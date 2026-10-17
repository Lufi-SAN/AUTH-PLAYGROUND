import type { MyRedisClientType } from '../loaders/loadRedis.js'
import { redisKeys } from '../config/redis.js'
import { redis } from '../loaders/loadRedis.js'
import { updateUserVerificationStatusDB } from '../repositories/verifyEmailRepo.js'
import { OtpNotFoundError } from '../errors/AppErrors.js'
import type { verifyEmailType } from '../types/user.types.js'
import { movePendingStatusToPermanentDB } from '../repositories/verifyEmailRepo.js'

async function checkRedisForOTPKey(
  redisInstance: MyRedisClientType,
  redisKey: string,
  both: boolean = false,
) {
  if (!both) {
    const email = await redisInstance.hget(redisKey, 'current_email')
    if (!email) {
      throw new OtpNotFoundError('OTP invalid or missing')
    }

    return email
  } else {
    const [currentEmail, newEmail] = await redisInstance.hmget(
      redisKey,
      'current_email',
      'new_email',
    )
    if (!currentEmail || !newEmail) {
      throw new OtpNotFoundError('OTP invalid or missing')
    }
    return [currentEmail, newEmail]
  }
}

async function updateUserVerificationStatus(email: string) {
  return await updateUserVerificationStatusDB(email)
}

async function cleanRedis(redisInstance: MyRedisClientType, redisKey: string) {
  await redisInstance.del(redisKey)
}

async function movePendingStatusToPermanent(
  currentEmail: string,
  newEmail: string,
) {
  return await movePendingStatusToPermanentDB(currentEmail, newEmail)
}

export function verifyEmailOrchestrator(
  otp: string,
  type: 'register',
): Promise<{ message: string }>
export function verifyEmailOrchestrator(
  otp: string,
  type: 'change-email',
): Promise<{ userId: string; updatedEmail: string }>

export async function verifyEmailOrchestrator(
  otp: string,
  type: verifyEmailType,
) {
  const redisInstance = redis.getRedisInstance()
  if (type === 'register') {
    const redisKey = redisKeys.emailVerificationOTP(otp)
    const email = (await checkRedisForOTPKey(redisInstance, redisKey)) as string
    const isVerified = await updateUserVerificationStatus(email)
    if (!isVerified) {
      throw new Error('Invalid or expired verification process.')
    }
    await cleanRedis(redisInstance, redisKey)
    return { message: 'Email verified successfully' }
  }
  if (type === 'change-email') {
    const redisKey = redisKeys.emailChangeVerificationOTP(otp)
    const [currentEmail, newEmail] = await checkRedisForOTPKey(
      redisInstance,
      redisKey,
      true,
    )
    const { userId, newEmail: updatedEmail } =
      await movePendingStatusToPermanent(
        currentEmail as string,
        newEmail as string,
      )
    return { userId, updatedEmail }
  }
}
