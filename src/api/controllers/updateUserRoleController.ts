import type { Request, Response, NextFunction } from '../../types/user.types.js'
import { updateUserRoleOrchestrator } from '../../services/updateUserRoleServices.js'

export async function updateUserRole(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const {
      userId: incomingId,
      oldRole,
      newRole,
    } = req.validatedData as {
      userId: string
      oldRole: string
      newRole: string
    }
    const { userId, role } = await updateUserRoleOrchestrator(
      newRole,
      incomingId,
      oldRole,
    )
    res.status(200).json({
      message: 'User role updated successfully',
      data: { userId, role },
    })
  } catch (err) {
    next(err)
  }
}
