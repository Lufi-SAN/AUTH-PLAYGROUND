import { Router } from 'express'
import { globalTrafficLimiter, IPLimiter } from '../middleware/rateLimiter.js'
import { sanitiserMiddleware } from '../middleware/inputSanitiser.js'
import { refreshSchema } from './schemas/refresh_schema.js'
import type { Request } from '../../types/user.types.js'
import { z } from 'zod'
import { refreshUser } from '../controllers/refreshController.js'

export function refreshRouter() {
  const router = Router()
  router.post(
    '/',
    IPLimiter(0, 0, 'refresh'),
    globalTrafficLimiter(0, 0, 'refresh'),
    sanitiserMiddleware(
      'cookies',
      refreshSchema,
      (req: Request, parsedData: z.infer<typeof refreshSchema>) => {
        req.validatedData = parsedData
      },
    ),
    refreshUser,
  )
  return router
}
