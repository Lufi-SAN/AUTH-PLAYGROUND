import { Router } from 'express'
import { sanitiserMiddleware } from '../middleware/MIDDLEWARE_SINK.js'
import { registerSchema } from './schemas/SCHEMA_SINK.js'
import { registerUser } from '../controllers/register/registerController.js'

export function registerRoute() {
  const router = Router()

  router.post('/', sanitiserMiddleware('body', registerSchema), registerUser)

  return router
}
