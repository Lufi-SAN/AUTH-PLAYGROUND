import { Router } from 'express'
import { IPLimiter, globalTrafficLimiter } from '../middleware/rateLimiter.js'
import { sanitiserMiddleware } from '../middleware/inputSanitiser.js'
import {
  changePasswordSchema,
  clearSessionsSchema,
  verifyJWTSchema,
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
      'headers',
      verifyJWTSchema,
      (req: Request, parsedData: z.infer<typeof verifyJWTSchema>) => {
        req.validatedData = parsedData
      },
    ),
    sanitiserMiddleware(
      'cookies',
      clearSessionsSchema,
      (req: Request, parsedData: z.infer<typeof clearSessionsSchema>) => {
        req.validatedData = { ...req.validatedData, ...parsedData }
      },
    ),
    verifyJWT,
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
