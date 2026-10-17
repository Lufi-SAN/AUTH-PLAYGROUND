import z from 'zod'

export const verifyEmailSchema = z.object({
  otp: z.string().length(14),
  type: z.enum(['change-email', 'register', 'reset-password']),
})

export type VerifyEmailSchema = z.infer<typeof verifyEmailSchema>
