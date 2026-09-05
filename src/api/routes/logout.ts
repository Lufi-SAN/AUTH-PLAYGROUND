import { Router } from 'express'
import { IPLimiter, globalTrafficLimiter } from '../middleware/rateLimiter.js'
import { sanitiserMiddleware } from '../middleware/inputSanitiser.js'
import { clearSessionsSchema } from './schemas/SCHEMA_SINK.js'
import type { Request } from '../../types/user.types.js'
import { z } from 'zod'
import { verifyJWT } from '../middleware/verifyJWT.js'
import { logout } from '../controllers/logoutController.js'

export function logoutRouter() {
  const router = Router()

  //Protected route
  router.post(
    '/',
    IPLimiter(15, 5, 'logout'),
    globalTrafficLimiter(1, 200, 'logout'),
    sanitiserMiddleware(
      'cookies',
      clearSessionsSchema,
      (req: Request, parsedData: z.infer<typeof clearSessionsSchema>) => {
        req.validatedData = parsedData
      },
    ),
    verifyJWT,
    logout,
  )

  return router
}
