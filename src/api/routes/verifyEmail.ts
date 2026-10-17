import { Router } from 'express'
import { z } from 'zod'
import {
  sanitiserMiddleware,
  globalTrafficLimiter,
  IPLimiter,
} from '../middleware/MIDDLEWARE_SINK.js'
import { verifyEmailSchema } from './schemas/SCHEMA_SINK.js'
import { verifyEmail } from '../controllers/verifyEmailController.js'
import type { Request } from '../../types/user.types.js'

export function verifyEmailRouter() {
  const router = Router()

  router.get(
    '/:otp/:type',
    IPLimiter(1, 10, 'verifyEmail'),
    globalTrafficLimiter(1, 100, 'verifyEmail'),
    sanitiserMiddleware(
      'params',
      verifyEmailSchema,
      (req: Request, parsedData: z.infer<typeof verifyEmailSchema>) => {
        req.validatedData = parsedData
      },
    ),
    verifyEmail,
  )

  return router
}
