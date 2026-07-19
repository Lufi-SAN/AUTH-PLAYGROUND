import { nanoid } from 'nanoid'

export function generateSecure14DigitString() {
  const otp = nanoid(14)
  return otp
}
