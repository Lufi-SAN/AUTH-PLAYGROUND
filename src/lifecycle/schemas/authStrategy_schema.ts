import z from 'zod'

export const authStrategySchema = z.enum([
  'emailVerification',
  'totp',
  'webauthn',
])
export type AuthStrategy = z.infer<typeof authStrategySchema>
