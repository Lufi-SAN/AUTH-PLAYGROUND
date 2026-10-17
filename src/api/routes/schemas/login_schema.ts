import z from 'zod'

export const loginSchema = z.object({
  username: z.string().trim().min(3).max(30),
  password: z.string().min(8).max(100),
  totpCode: z
    .string()
    .trim()
    .length(6, 'TOTP code must be 6 digits')
    .optional(),
})

export type LoginSchema = z.infer<typeof loginSchema>
