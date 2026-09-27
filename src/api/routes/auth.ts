import { Router } from 'express'
import { z } from 'zod'
import {
  sanitiserMiddleware,
  globalTrafficLimiter,
  IPLimiter,
  verifyJWT,
  requireRole,
} from '../middleware/MIDDLEWARE_SINK.js'
import type { Request } from '../../types/user.types.js'
import { chooseVerificationMethod } from '../controllers/verificationMethodController.js'
import { updateUserRole } from '../controllers/updateUserRoleController.js'
import {
  verificationMethodSchema,
  verifyJWTSchema,
  updateUserRoleSchema,
} from './schemas/SCHEMA_SINK.js'

export function authRouter() {
  const router = Router()

  // Example of a protected route
  router.post(
    '/verification-method',
    IPLimiter(1, 5, 'verificationMethod'),
    globalTrafficLimiter(1, 300, 'verificationMethod'),
    sanitiserMiddleware(
      'headers',
      verifyJWTSchema,
      (req: Request, parsedData: z.infer<typeof verifyJWTSchema>) => {
        req.validatedData = parsedData
      },
    ),
    verifyJWT,
    requireRole('admin'),
    sanitiserMiddleware(
      'body',
      verificationMethodSchema,
      (req: Request, parsedData: z.infer<typeof verificationMethodSchema>) => {
        req.validatedData = parsedData
      },
    ),
    chooseVerificationMethod,
  )

  router.post(
    '/assign-role',
    IPLimiter(1, 5, 'assignRole'),
    globalTrafficLimiter(1, 300, 'assignRole'),
    sanitiserMiddleware(
      'headers',
      verifyJWTSchema,
      (req: Request, parsedData: z.infer<typeof verifyJWTSchema>) => {
        req.validatedData = parsedData
      },
    ),
    verifyJWT,
    requireRole('admin'),
    sanitiserMiddleware(
      'body',
      updateUserRoleSchema,
      (req: Request, parsedData: z.infer<typeof updateUserRoleSchema>) => {
        req.validatedData = parsedData
      },
    ),
    updateUserRole,
  )

  return router
}
