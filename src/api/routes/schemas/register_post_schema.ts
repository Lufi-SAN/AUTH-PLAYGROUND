import z from 'zod'

export const registerPostSchema = z.object({
  username: z.string().trim().min(3).max(20),
  email: z.string().toLowerCase().email().max(255),
  password: z.string().min(8).max(100),
})
