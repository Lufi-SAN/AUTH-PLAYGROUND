import { Router } from 'express'
import { z } from 'zod'
import { sanitiserMiddleware } from '../middleware/MIDDLEWARE_SINK.js'
import type { Request } from '../../types/user.types.js'
import { registerSchema } from './schemas/SCHEMA_SINK.js'
import { registerUser } from '../controllers/registerController.js'

export function registerRoute() {
  const router = Router()

  router.post(
    '/',
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
