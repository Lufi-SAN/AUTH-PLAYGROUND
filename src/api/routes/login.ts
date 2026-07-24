import { Router } from 'express'
import { globalTrafficLimiter, IPLimiter } from '../middleware/rateLimiter.js'
import { z } from 'zod'
import { sanitiserMiddleware } from '../middleware/MIDDLEWARE_SINK.js'
import type { Request } from '../../types/user.types.js'

export function loginRoute() {
  const router = Router()

  router.post(
    '/',
    globalTrafficLimiter(1, 1000, 'login'),
    IPLimiter(1, 5, 'login'),
  )
}
