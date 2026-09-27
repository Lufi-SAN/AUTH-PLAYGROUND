import type { Request, Response, NextFunction } from '../../types/user.types.js'
import {
  UnauthorizedUserError,
  InsufficientRoleError,
} from '../../errors/AppErrors.js'

export function requireRole(requiredRole: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role

    if (!userRole) {
      return next(new UnauthorizedUserError('User role is missing'))
    }

    if (userRole !== requiredRole) {
      return next(
        new InsufficientRoleError(
          `User role does not have access to this resource`,
        ),
      )
    }

    next()
  }
}
