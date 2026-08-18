import type { MyRedisClientType } from '../loaders/loadRedis.js'
import { redisKeys } from '../config/redis.js'
import { redis } from '../loaders/loadRedis.js'
import { updateUserVerificationStatusDB } from '../repositories/verifyEmailRepo.js'
import { OtpNotFoundError } from '../errors/AppErrors.js'

async function checkRedisForOTPKey(
  redisInstance: MyRedisClientType,
  redisKey: string,
) {
  const email = await redisInstance.hget(redisKey, 'email')
  if (!email) {
    throw new OtpNotFoundError('OTP invalid or missing')
  }

  return email
}

async function updateUserVerificationStatus(email: string) {
  return await updateUserVerificationStatusDB(email)
}

async function cleanRedis(redisInstance: MyRedisClientType, redisKey: string) {
  await redisInstance.del(redisKey)
}

export async function verifyEmailOrchestrator(
  otp: string,
): Promise<{ message: string }> {
  const redisInstance = redis.getRedisInstance()
  const redisKey = redisKeys.emailVerificationOTP(otp)
  const email = await checkRedisForOTPKey(redisInstance, redisKey)
  const isVerified = await updateUserVerificationStatus(email)
  if (!isVerified) {
    throw new Error('Invalid or expired verification process.')
  }
  await cleanRedis(redisInstance, redisKey)
  return { message: 'Email verified successfully' }
}
