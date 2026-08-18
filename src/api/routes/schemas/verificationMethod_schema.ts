import z from 'zod'

export const verificationMethodSchema = z.object({
  strategy: z.enum(['emailVerification', 'totp', 'webauthn']),
})
