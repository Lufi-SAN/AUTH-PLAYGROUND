import z from 'zod'

export const refreshSchema = z.object({
  refreshToken: z.string().optional(),
  sessionId: z.string().optional(),
})
