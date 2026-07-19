import z from 'zod'

export const verifyEmailSchema = {
  params: z.object({
    otp: z.string().length(6),
    emailHash: z.string(),
  }),
  body: z.object({
    email: z.string().toLowerCase().email().max(255),
  }),
}
