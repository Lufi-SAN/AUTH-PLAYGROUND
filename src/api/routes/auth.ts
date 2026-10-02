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
import { updateUserRole } from '../controllers/updateUserRoleController.js'
import { getAllUsers } from '../controllers/getAllUsersController.js'
import {
  verifyJWTSchema,
  updateUserRoleSchema,
  paginationSchema,
} from './schemas/SCHEMA_SINK.js'

export function authRouter() {
  const router = Router()

  router.post(
    '/update-role',
    IPLimiter(1, 5, 'updateRole'),
    globalTrafficLimiter(1, 300, 'updateRole'),
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

  router.get(
    '/all-users',
    IPLimiter(1, 5, 'allUsers'),
    globalTrafficLimiter(1, 300, 'allUsers'),
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
      'query',
      paginationSchema,
      (req: Request, parsedData: z.infer<typeof paginationSchema>) => {
        req.validatedData = parsedData
      },
    ),
    getAllUsers,
  )

  return router
}
