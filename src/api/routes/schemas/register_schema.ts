import z from 'zod'

export const registerSchema = z.object({
  username: z.string().trim().min(3).max(30),
  email: z.string().toLowerCase().email().max(255),
  password: z.string().min(8).max(100),
})

export type RegisterSchema = z.infer<typeof registerSchema>
