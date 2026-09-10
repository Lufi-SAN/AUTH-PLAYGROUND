import type { Request, Response, NextFunction } from '../../types/user.types.js'
import { changePasswordOrchestrator } from '../../services/changePasswordServices.js'
import { successResponse } from '../../utils/JSONGenerators.js'

export async function changePassword(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id: userId } = req.user as { id: string }
    const { sessionId, currentPassword, newPassword } = req.validatedData as {
      sessionId?: string
      currentPassword: string
      newPassword: string
      confirmNewPassword: string
    }

    const updateInfo = await changePasswordOrchestrator(
      sessionId,
      userId,
      currentPassword,
      newPassword,
    )

    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')
    res.clearCookie('sessionId')

    return res.json(
      successResponse('Password changed successfully', updateInfo),
    )
  } catch (error) {
    next(error)
  }
}
