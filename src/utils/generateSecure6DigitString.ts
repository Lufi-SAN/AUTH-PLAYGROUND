import crypto from 'crypto'

export function generateSecure6DigitString() {
  const otp = crypto.randomInt(100000, 1000000).toString()
  return otp
}
