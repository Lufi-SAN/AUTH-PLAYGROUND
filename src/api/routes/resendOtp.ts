import { Router } from 'express'
import { resendOtp } from '../controllers/resendOtpController.js'
import { sanitiserMiddleware } from '../middleware/inputSanitiser.js'
import { resendOtpSchema } from './schemas/SCHEMA_SINK.js'

export function resendOtpRoute() {
  const router = Router()

  router.post(
    '/:userId',
    sanitiserMiddleware('params', resendOtpSchema),
    resendOtp,
  )

  return router
}
