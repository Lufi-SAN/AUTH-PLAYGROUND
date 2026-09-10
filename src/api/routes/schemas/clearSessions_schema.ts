import z from 'zod'

export const clearSessionsSchema = z.object({
  sessionId: z.string().optional(),
})
