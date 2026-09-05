import z from 'zod'

export const clearSessionsSchema = z.object({
  accessToken: z.string().optional(),
  sessionId: z.string().optional(),
})
