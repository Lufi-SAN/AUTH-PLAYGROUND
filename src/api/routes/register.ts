import { Router } from 'express'
import { globalTrafficLimiter, IPLimiter } from '../middleware/rateLimiter.js'
import { z } from 'zod'
import { sanitiserMiddleware } from '../middleware/MIDDLEWARE_SINK.js'
import type { Request } from '../../types/user.types.js'
import { registerSchema } from './schemas/SCHEMA_SINK.js'
import { registerUser } from '../controllers/registerController.js'

export function registerRouter() {
  const router = Router()

  router.post(
    '/',
    IPLimiter(5, 3, 'register'),
    globalTrafficLimiter(1, 100, 'register'),
    sanitiserMiddleware(
      'body',
      registerSchema,
      (req: Request, parsedData: z.infer<typeof registerSchema>) => {
        req.validatedData = parsedData
      },
    ),
    registerUser,
  )

  return router
}
