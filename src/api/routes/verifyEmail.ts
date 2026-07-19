import { Router } from 'express'
import { z } from 'zod'
import { sanitiserMiddleware } from '../middleware/MIDDLEWARE_SINK.js'
import { verifyEmailSchema } from './schemas/SCHEMA_SINK.js'
import { verifyEmail } from '../controllers/verifyEmailController.js'
import type { Request } from '../../types/user.types.js'

export function verifyEmailRoute() {
  const router = Router()

  router.get(
    '/:otp/:emailHash',
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
