import { redisKeys } from '../config/redis.js'
import { redis } from '../loaders/loadRedis.js'
import { updateUserVerificationStatusDB } from '../repositories/verifyEmailRepo.js'
import { OtpNotFound } from '../errors/AppErrors.js'

async function checkRedisForOTPKey(redisKey: string) {
  const redisInstance = redis.getRedisInstance()
  const email = await redisInstance.hget(redisKey, 'email')
  if (!email) {
    throw new OtpNotFound('OTP invalid or missing')
  }

  return email
}

async function updateUserVerificationStatus(email: string) {
  return await updateUserVerificationStatusDB(email)
}

async function cleanRedis(redisKey: string) {
  const redisInstance = redis.getRedisInstance()
  await redisInstance.del(redisKey)
}

export async function verifyEmailOrchestrator(
  otp: string,
): Promise<{ message: string }> {
  const redisKey = redisKeys.emailVerificationOTP(otp)
  const email = await checkRedisForOTPKey(redisKey)
  const isVerified = await updateUserVerificationStatus(email)
  if (!isVerified) {
    throw new Error('Invalid or expired verification process.')
  }
  await cleanRedis(redisKey)
  return { message: 'Email verified successfully' }
}
