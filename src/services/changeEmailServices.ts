import {
  getUserDetailsDB,
  saveToPendingEmailDB,
} from '../repositories/changeEmailRepo.js'
import {
  UserNotFoundError,
  UnauthorizedUserError,
} from '../errors/AppErrors.js'
import { verify } from 'otplib'
import { generateSecure14DigitString } from '../utils/generateSecure14DigitString.js'
import { redis } from '../loaders/loadRedis.js'
import { redisKeys } from '../config/redis.js'
import { redisOTPKeySetup } from './registerServices.js'
import { enqueueOTPEmailJob } from '../jobs/enqueueOTPEmailJob.js'
import type { verifyEmailType } from '../types/user.types.js'

async function getAllUserDetails(userId: string, currentEmail: string) {
  const result = await getUserDetailsDB(userId, currentEmail)
  if (!result) {
    throw new UserNotFoundError(
      'User not found or current email does not match',
    )
  }
  return result
}

async function savePendingEmail(userId: string, newEmail: string) {
  await saveToPendingEmailDB(userId, newEmail)
}

async function sendOTPEmail(
  email: string,
  otp: string,
  type: verifyEmailType = 'change-email',
) {
  // Implement email sending logic here using your preferred email service provider
  // For example, you can use nodemailer or any transactional email service API
  await enqueueOTPEmailJob(email, otp, type)
}

export async function changeEmailOrchestrator(
  id: string,
  currentEmail: string,
  newEmail: string,
  totpCode?: string,
) {
  const { email, totpEnabled, totpSecret } = await getAllUserDetails(
    id,
    currentEmail,
  )
  currentEmail = email
  if (totpEnabled) {
    if (!totpCode) {
      throw new UnauthorizedUserError('No TOTP code')
    }
    const isValid = verify({ secret: totpSecret as string, token: totpCode })
    if (!isValid) {
      throw new UnauthorizedUserError('Invalid TOTP code')
    }
  }
  await savePendingEmail(id, newEmail)

  const otp = generateSecure14DigitString()

  const redisKey = redisKeys.emailChangeVerificationOTP(otp)
  const redisInstance = redis.getRedisInstance()
  await redisOTPKeySetup(redisInstance, redisKey, currentEmail, newEmail)

  await sendOTPEmail(newEmail, otp, 'change-email')

  return { message: 'New email stored for update. Verification pending.' }
}
