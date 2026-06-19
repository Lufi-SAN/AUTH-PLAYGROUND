import z from 'zod'

export const resendOtpSchema = z.object({
  userId: z.string().uuid(),
})
