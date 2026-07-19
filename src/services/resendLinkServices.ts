import { generateSecure14DigitString } from '../utils/generateSecure14DigitString.js'
import { redisOTPHashSetup, sendOTPEmail } from './registerServices.js'

export async function resendLinkOrchestrator(email: string) {
  const newOtp = generateSecure14DigitString()

  await redisOTPHashSetup(email, newOtp)

  await sendOTPEmail(email, newOtp)

  return { message: 'Verification link successfully sent' }
}
