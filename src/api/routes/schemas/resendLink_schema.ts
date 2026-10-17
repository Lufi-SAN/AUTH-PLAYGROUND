import z from 'zod'

export const resendLinkSchema = z.object({
  email: z.string().trim().toLowerCase().max(255).pipe(z.email()),
})
