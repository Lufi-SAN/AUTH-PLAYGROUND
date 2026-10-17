import { Router } from 'express'
import { z } from 'zod'
import {
  sanitiserMiddleware,
  globalTrafficLimiter,
  IPLimiter,
  verifyJWT,
} from '../middleware/MIDDLEWARE_SINK.js'
import type { Request } from '../../types/user.types.js'
import { verifyJWTSchema, changeEmailSchema } from './schemas/SCHEMA_SINK.js'
import { changeEmail } from '../controllers/changeEmailController.js'

export function changeEmailRouter() {
  const router = Router()

  router.post(
    '/',
    IPLimiter(1, 5, 'changeEmail'),
    globalTrafficLimiter(1, 300, 'changeEmail'),
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
      changeEmailSchema,
      (req: Request, parsedData: z.infer<typeof changeEmailSchema>) => {
        req.validatedData = parsedData
      },
    ),
    changeEmail,
  )

  return router
}
