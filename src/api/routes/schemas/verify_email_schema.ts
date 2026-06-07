import z from 'zod'

export const verifyEmailSchema = z.object({
  otp: z.string().length(6),
  userId: z.string().uuid(),
})
