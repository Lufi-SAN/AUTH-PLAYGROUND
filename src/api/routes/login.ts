import { Router } from 'express'
import { globalTrafficLimiter, IPLimiter } from '../middleware/rateLimiter.js'
import { z } from 'zod'
import { sanitiserMiddleware } from '../middleware/MIDDLEWARE_SINK.js'
import type { Request } from '../../types/user.types.js'
import { loginSchema } from './schemas/SCHEMA_SINK.js'
import { loginUser } from '../controllers/loginController.js'

export function loginRoute() {
  const router = Router()

  router.post(
    '/',
    IPLimiter(1, 5, 'login'),
    globalTrafficLimiter(1, 1000, 'login'),
    sanitiserMiddleware(
      'body',
      loginSchema,
      (req: Request, parsedData: z.infer<typeof loginSchema>) => {
        req.validatedData = parsedData
      },
    ),
    loginUser,
  )
}
