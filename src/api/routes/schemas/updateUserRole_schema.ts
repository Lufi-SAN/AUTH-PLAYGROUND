import { z } from 'zod'

export const updateUserRoleSchema = z.object({
  userId: z.string().pipe(z.uuid()),
  oldRole: z.enum(['user', 'admin']),
  newRole: z.enum(['user', 'admin']),
})
