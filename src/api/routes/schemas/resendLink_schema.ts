import z from 'zod'

export const resendLinkSchema = z.object({
  email: z.string(),
})
