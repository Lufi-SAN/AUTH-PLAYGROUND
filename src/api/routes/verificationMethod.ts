import { Router } from 'express'
import { globalTrafficLimiter, IPLimiter } from '../middleware/rateLimiter.js'
import { z } from 'zod'
import type { Request } from '../../types/user.types.js'
import { chooseVerificationMethod } from '../controllers/verificationMethodController.js'
import { sanitiserMiddleware } from '../middleware/inputSanitiser.js'
import { verificationMethodSchema } from './schemas/SCHEMA_SINK.js'

export function verificationMethodRoute() {
  const router = Router()

  router.post(
    '/',
    IPLimiter(1, 5, 'verificationMethod'),
    globalTrafficLimiter(1, 300, 'verificationMethod'),
    sanitiserMiddleware(
      'body',
      verificationMethodSchema,
      (req: Request, parsedData: z.infer<typeof verificationMethodSchema>) => {
        req.validatedData = parsedData
      },
    ),
    chooseVerificationMethod,
  )

  return router
}
