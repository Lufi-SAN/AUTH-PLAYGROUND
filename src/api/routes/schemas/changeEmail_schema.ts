import { z } from 'zod'

export const changeEmailSchema = z.object({
  currentEmail: z.string().trim().toLowerCase().max(255).pipe(z.email()),
  newEmail: z.string().trim().toLowerCase().max(255).pipe(z.email()),
  totpCode: z
    .string()
    .trim()
    .length(6, 'TOTP code must be 6 digits')
    .optional(),
})

export type ChangeEmailSchema = z.infer<typeof changeEmailSchema>
