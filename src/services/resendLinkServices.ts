import { generateSecure14DigitString } from '../utils/generateSecure14DigitString.js'
import { redisKeys } from '../config/redis.js'
import { redis } from '../loaders/loadRedis.js'
import { redisOTPKeySetup, sendOTPEmail } from './registerServices.js'

export async function resendLinkOrchestrator(email: string) {
  const newOtp = generateSecure14DigitString()

  const redisInstance = redis.getRedisInstance()
  const redisKey = redisKeys.emailVerificationOTP(newOtp)
  await redisOTPKeySetup(redisInstance, redisKey, email)

  await sendOTPEmail(email, newOtp)

  return { message: 'Verification link successfully sent' }
}
