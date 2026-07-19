import { generateSecure6DigitString } from '../utils/generateSecure6DigitString.js'
import argon2id from '@node-rs/argon2'
import { argon2Config } from '../config/argon2.js'
import { saveNewUserDB } from '../repositories/registerRepo.js'
import { redisKeys } from '../config/redis.js'
import { DatabaseError } from 'pg'
import { UserAlreadyExists } from '../errors/AppErrors.js'
import { redis } from '../loaders/loadRedis.js'
import { enqueueOTPEmailJob } from '../jobs/enqueueOTPEmailJob.js'

async function otpAndHash(password: string, email: string) {
  const otp = generateSecure6DigitString()
  const [passwordHash, otpHash, emailHash] = await Promise.all([
    argon2id.hash(password, {
      memoryCost: argon2Config.memoryCost,
    }),
    argon2id.hash(otp, {
      memoryCost: argon2Config.memoryCost,
    }),
    argon2id.hash(email, {
      memoryCost: argon2Config.memoryCost,
    }),
  ])
  return { passwordHash, otpHash, emailHash, otp }
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

export async function redisOTPHashSetup(emailHash: string, otpHash: string) {
  const redisKey = redisKeys.emailVerificationOTP(emailHash)
  const redisInstance = redis.getRedisInstance()
  await redisInstance
    .multi()
    .hset(redisKey, {
      otpHash,
      attempts: '0',
    })
    .expire(redisKey, 15 * 60)
    .exec()
}

export async function sendOTPEmail(email: string, otp: string) {
  // Implement email sending logic here using your preferred email service provider
  // For example, you can use nodemailer or any transactional email service API
  console.log('enqueuing')
  await enqueueOTPEmailJob(email, otp)
}

export async function registerUserOrchestrator(
  password: string,
  username: string,
  email: string,
): Promise<{ id: string; username: string; email: string }> {
  const { passwordHash, otpHash, emailHash, otp } = await otpAndHash(
    password,
    email,
  )

  //service for db
  const newUserData = await saveNewUser(username, email, passwordHash)

  //service for redis
  await redisOTPHashSetup(emailHash, otpHash)

  //service for email queue
  await sendOTPEmail(email, otp)

  return newUserData
}
