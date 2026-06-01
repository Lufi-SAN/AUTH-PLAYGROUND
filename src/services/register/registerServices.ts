import { generateSecure6DigitString } from '../../utils/generateSecure6DigitString.js'
import argon2id from '@node-rs/argon2'
import { argon2Config } from '../../config/argon2.js'
import { saveNewUserDB } from '../../repositories/register/registerRepo.js'
import { redisKeys } from '../../config/redis.js'
import { DatabaseError } from 'pg'
import { UserAlreadyExists } from '../../errors/AppErrors.js'
import { redis } from '../../loaders/loadRedis.js'

async function otpAndHash(password: string) {
  const otp = generateSecure6DigitString()
  const [passwordHash, otpHash] = await Promise.all([
    argon2id.hash(password, {
      memoryCost: argon2Config.memoryCost,
    }),
    argon2id.hash(otp, {
      memoryCost: argon2Config.memoryCost,
    }),
  ])
  return { passwordHash, otpHash, otp }
}

async function saveNewUser(
  username: string,
  email: string,
  passwordHash: string,
) {
  try {
    const newUserData = await saveNewUserDB(username, email, passwordHash)
    return newUserData
  } catch (error) {
    if (error instanceof DatabaseError && error.code === '23505') {
      if (error.constraint === 'users_email_unique_idx') {
        throw new UserAlreadyExists('Email already exists')
      } else if (error.constraint === 'users_username_unique_idx') {
        throw new UserAlreadyExists('Username already exists')
      }
    }
    throw error
  }
}

async function redisOTPHashSetup(id: string, otpHash: string) {
  const redisKey = redisKeys.emailVerificationOTP(id)
  await redis
    .getRedisInstance()
    .multi()
    .hSet(redisKey, {
      otpHash,
      attempts: '0',
    })
    .expire(redisKey, 15 * 60)
    .exec()
}

async function sendOTPEmail(email: string, otp: string) {
  // Implement email sending logic here using your preferred email service provider
  // For example, you can use nodemailer or any transactional email service API
  console.log(`Sending OTP ${otp} to email: ${email}`)
}

export async function registerUserOrchestration(
  password: string,
  username: string,
  email: string,
): Promise<{ id: string; username: string; email: string }> {
  const { passwordHash, otpHash, otp } = await otpAndHash(password)

  //service for db
  const newUserData = await saveNewUser(username, email, passwordHash)

  //service for redis
  await redisOTPHashSetup(newUserData.id, otpHash)

  return newUserData
}
