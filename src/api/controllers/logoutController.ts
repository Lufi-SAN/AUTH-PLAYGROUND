import type { Request, Response, NextFunction } from '../../types/user.types.js'
import { logoutOrchestrator } from '../../services/logoutServices.js'
import { successResponse } from '../../utils/JSONGenerators.js'

export async function logout(req: Request, res: Response, next: NextFunction) {
  const { id: userId } = req.user as { id: string }
  const { sessionId } = req.validatedData as {
    sessionId?: string
    accessToken?: string
  }

  try {
    const { message } = await logoutOrchestrator(sessionId, userId)

    res.clearCookie('refreshToken')
    res.clearCookie('sessionId')

    return res.status(200).json(successResponse(message))
  } catch (error) {
    next(error)
  }
}
