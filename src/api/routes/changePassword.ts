import { Router } from 'express'
import { IPLimiter, globalTrafficLimiter } from '../middleware/rateLimiter.js'
import { sanitiserMiddleware } from '../middleware/inputSanitiser.js'
import {
  changePasswordSchema,
  verifyJWTSchema,
  sessionIdSchema,
} from './schemas/SCHEMA_SINK.js'
import type { Request } from '../../types/user.types.js'
import { z } from 'zod'
import { verifyJWT } from '../middleware/verifyJWT.js'
import { changePassword } from '../controllers/changePasswordController.js'

export function changePasswordRouter() {
  const router = Router()

  //Protected route
  router.post(
    '/',
    IPLimiter(15, 5, 'change-password'),
    globalTrafficLimiter(1, 200, 'change-password'),
    sanitiserMiddleware(
      'cookies',
      verifyJWTSchema,
      (req: Request, parsedData: z.infer<typeof verifyJWTSchema>) => {
        req.validatedData = parsedData
      },
    ),
    verifyJWT,
    sanitiserMiddleware(
      'cookies',
      sessionIdSchema,
      (req: Request, parsedData: z.infer<typeof sessionIdSchema>) => {
        req.validatedData = parsedData
      },
    ),
    sanitiserMiddleware(
      'body',
      changePasswordSchema,
      (req: Request, parsedData: z.infer<typeof changePasswordSchema>) => {
        req.validatedData = { ...req.validatedData, ...parsedData }
      },
    ),
    changePassword,
  )

  return router
}
