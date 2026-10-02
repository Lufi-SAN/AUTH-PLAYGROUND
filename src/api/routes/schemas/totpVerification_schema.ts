import { z } from 'zod'

export const totpVerificationSchema = z.object({
  code: z.string().trim().length(6, 'TOTP code must be 6 digits'),
})

export type TotpVerificationSchema = z.infer<typeof totpVerificationSchema>
