import { generateSecure14DigitString } from '../utils/generateSecure14DigitString.js'
import argon2id from '@node-rs/argon2'
import { argon2Config } from '../config/argon2.js'
import { saveNewUserDB } from '../repositories/registerRepo.js'
import { redisKeys } from '../config/redis.js'
import { DatabaseError } from 'pg'
import { UserAlreadyExistsError } from '../errors/AppErrors.js'
import { redis } from '../loaders/loadRedis.js'
import { enqueueOTPEmailJob } from '../jobs/enqueueOTPEmailJob.js'

async function otpAndHash(password: string, email: string) {
  const otp = generateSecure14DigitString()
  const passwordHash = await argon2id.hash(password, {
    memoryCost: argon2Config.memoryCost,
  })
  return { passwordHash, otp }
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
        throw new UserAlreadyExistsError('Email already exists')
      } else if (error.constraint === 'users_username_unique_idx') {
        throw new UserAlreadyExistsError('Username already exists')
      }
    }
    throw error
  }
}

export async function redisOTPHashSetup(email: string, otp: string) {
  const redisKey = redisKeys.emailVerificationOTP(otp)
  const redisInstance = redis.getRedisInstance()
  await redisInstance
    .pipeline()
    .hset(redisKey, {
      email,
    })
    .expire(redisKey, 15 * 60)
    .exec()
}

export async function sendOTPEmail(email: string, otp: string) {
  // Implement email sending logic here using your preferred email service provider
  // For example, you can use nodemailer or any transactional email service API
  await enqueueOTPEmailJob(email, otp)
}

export async function registerUserOrchestrator(
  password: string,
  username: string,
  email: string,
): Promise<{ id: string; username: string; email: string }> {
  const { passwordHash, otp } = await otpAndHash(password, email)

  //service for db
  const newUserData = await saveNewUser(username, email, passwordHash)

  //service for redis
  await redisOTPHashSetup(email, otp)

  //service for email queue
  await sendOTPEmail(email, otp)

  return newUserData
}
