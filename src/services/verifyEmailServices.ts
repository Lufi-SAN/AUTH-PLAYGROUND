import { redisKeys } from '../config/redis.js'
import { redis } from '../loaders/loadRedis.js'
import {
  getUserIdByEmailDB,
  updateUserVerificationStatusDB,
} from '../repositories/verifyEmailRepo.js'
import {
  OtpNotFound,
  TooManyAttempts,
  UserNotFound,
} from '../errors/AppErrors.js'
import argon2id from '@node-rs/argon2'
import { argon2Config } from '../config/argon2.js'

async function getUserIdByEmail(email: string) {
  const result = await getUserIdByEmailDB(email)
  if (!result) {
    throw new UserNotFound('No user found with email')
  }
  return result
}

async function checkRedisForOTPKey(userId: string) {
  const luaScript = `
    local otpHashValue = redis.call('HGET', KEYS[1], 'otpHash')
    
    if not otpHashValue then
      return {"EXPIRED"}
    end
    
    local currentAttempts = redis.call('HGET', KEYS[1], 'attempts')
    
    if currentAttempts and tonumber(currentAttempts) >= 5 then
      return {"LOCKED"}
    end
    
    local newAttempts = redis.call('HINCRBY', KEYS[1], 'attempts', 1)
    
    return {"OK", otpHashValue}
    `

  const redisKey = redisKeys.emailVerificationOTP(userId)
  const [status, otpHashValue] = (await redis
    .getRedisInstance()
    .eval(luaScript, 1, redisKey)) as [string, string]

  if (status === 'EXPIRED') {
    throw new OtpNotFound('OTP invalid or missing')
  }
  if (status === 'LOCKED') {
    redis.getRedisInstance().del(redisKey)
    throw new TooManyAttempts('Too many OTP attempts')
  }

  return otpHashValue
}

async function verifyOTP(otpHashValue: string, otp: string) {
  const verificationResult = await argon2id.verify(otpHashValue, otp, {
    memoryCost: argon2Config.memoryCost,
  })
  if (!verificationResult) {
    throw new OtpNotFound('OTP invalid')
  }

  return verificationResult
}

async function updateUserVerificationStatus(
  userId: string,
  verificationResult: boolean,
) {
  updateUserVerificationStatusDB(userId, verificationResult)
}

export async function verifyEmailOrchestrator(otp: string, email: string) {
  const { userId, isVerified } = await getUserIdByEmail(email)
  if (isVerified) {
    return { message: 'Email is already verified' }
  }
  const otpHash = await checkRedisForOTPKey(userId)
  const validOTP = await verifyOTP(otpHash, otp)
  await updateUserVerificationStatus(userId, validOTP)
  return { message: 'Email verified successfully' }
}
