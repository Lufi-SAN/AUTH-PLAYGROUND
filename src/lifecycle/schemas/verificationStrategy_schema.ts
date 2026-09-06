import z from 'zod'

export const verificationStrategySchema = z.enum([
  'emailVerification',
  'totp',
  'webauthn',
])
export type VerificationStrategy = z.infer<typeof verificationStrategySchema>
