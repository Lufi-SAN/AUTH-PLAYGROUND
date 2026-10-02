import { Router } from 'express'
import { IPLimiter, globalTrafficLimiter } from '../middleware/rateLimiter.js'
import { sanitiserMiddleware } from '../middleware/inputSanitiser.js'
import {
  verifyJWTSchema,
  totpVerificationSchema,
} from './schemas/SCHEMA_SINK.js'
import type { Request } from '../../types/user.types.js'
import { z } from 'zod'
import { verifyJWT } from '../middleware/verifyJWT.js'
import { enrollTotp } from '../controllers/totpController.js'
import { verifyTotp } from '../controllers/verifyTotpController.js'

export function totpRouter() {
  const router = Router()

  //Protected route
  router.post(
    '/setup',
    IPLimiter(15, 5, 'enroll-totp'),
    globalTrafficLimiter(1, 200, 'enroll-totp'),
    sanitiserMiddleware(
      'headers',
      verifyJWTSchema,
      (req: Request, parsedData: z.infer<typeof verifyJWTSchema>) => {
        req.validatedData = parsedData
      },
    ),
    verifyJWT,
    enrollTotp,
  )

  router.post(
    '/verify',
    IPLimiter(15, 5, 'enroll-totp-verify'),
    globalTrafficLimiter(1, 200, 'enroll-totp-verify'),
    sanitiserMiddleware(
      'headers',
      verifyJWTSchema,
      (req: Request, parsedData: z.infer<typeof verifyJWTSchema>) => {
        req.validatedData = parsedData
      },
    ),
    verifyJWT,
    sanitiserMiddleware(
      'body',
      totpVerificationSchema,
      (req: Request, parsedData: z.infer<typeof totpVerificationSchema>) => {
        req.validatedData = parsedData
      },
    ),
    verifyTotp,
  )

  return router
}
