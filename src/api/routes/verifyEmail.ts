import { Router } from 'express'
import { sanitiserMiddleware } from '../middleware/MIDDLEWARE_SINK.js'
import { verifyEmailSchema } from './schemas/SCHEMA_SINK.js'
import { verifyEmail } from '../controllers/verifyEmail/verifyEmailController.js'

export function verifyEmailRoute() {
  const router = Router()

  router.post(
    '/:otp',
    sanitiserMiddleware('params', verifyEmailSchema),
    verifyEmail,
  )

  return router
}
