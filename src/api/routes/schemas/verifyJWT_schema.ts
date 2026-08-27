import z from 'zod'

export const verifyJWTSchema = z.object({
  accessToken: z.string().optional(),
})
