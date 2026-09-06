import { generateSecure14DigitString } from '../utils/generateSecure14DigitString.js'
import { createPasswordHash } from '../utils/UTILS_SINK.js'
import { saveNewUserDB } from '../repositories/registerRepo.js'
import { redisKeys } from '../config/redis.js'
import { DatabaseError } from 'pg'
import { UserAlreadyExistsError } from '../errors/AppErrors.js'
import { redis } from '../loaders/loadRedis.js'
import { enqueueOTPEmailJob } from '../jobs/enqueueOTPEmailJob.js'
import type { VerificationStrategy } from '../types/user.types.js'
import type { MyRedisClientType } from '../loaders/loadRedis.js'

async function saveNewUser(
  username: string,
  email: string,
  passwordHash: string,
  verificationStrategy: VerificationStrategy,
) {
  try {
    const newUserData = await saveNewUserDB(
      username,
      email,
      passwordHash,
      verificationStrategy,
    )
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

export async function redisOTPKeySetup(
  redisInstance: MyRedisClientType,
  redisKey: string,
  email: string,
) {
  await redisInstance
    .multi()
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
  verificationStrategy: VerificationStrategy,
): Promise<{ id: string; username: string; email: string } | undefined> {
  const passwordHash = await createPasswordHash(password)

  //service for db
  const newUserData = await saveNewUser(
    username,
    email,
    passwordHash,
    verificationStrategy,
  )

  if (verificationStrategy === 'emailVerification') {
    const otp = generateSecure14DigitString()

    const redisInstance = redis.getRedisInstance()
    const redisKey = redisKeys.emailVerificationOTP(otp)
    //service for redis
    await redisOTPKeySetup(redisInstance, redisKey, email)

    //service for email queue
    await sendOTPEmail(email, otp)

    return newUserData
  }
}
