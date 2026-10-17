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

export function deleteAccountRouter() {
  const router = Router()

  return router
}
