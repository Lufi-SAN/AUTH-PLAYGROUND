import z from 'zod'

export const registerSchema = z.object({
  username: z.string().trim().min(3).max(30),
  email: z.string().trim().toLowerCase().max(255).pipe(z.email()),
  password: z.string().min(8).max(100),
})

export type RegisterSchema = z.infer<typeof registerSchema>
