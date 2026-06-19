import { Router } from 'express'
import { sanitiserMiddleware } from '../middleware/MIDDLEWARE_SINK.js'
import { verifyEmailSchema } from './schemas/SCHEMA_SINK.js'
import { verifyEmail } from '../controllers/verifyEmailController.js'

export function verifyEmailRoute() {
  const router = Router()

  router.get(
    '/:otp/:email',
    sanitiserMiddleware('params', verifyEmailSchema),
    verifyEmail,
  )

  return router
}
