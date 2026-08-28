import type { Request, Response, NextFunction } from '../../types/user.types.js'
import { refreshUserOrchestrator } from '../../services/refreshServices.js'
import { successResponse } from '../../utils/JSONGenerators.js'

export async function refreshUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { refreshToken, sessionId } = req.validatedData as {
      refreshToken?: string
      sessionId?: string
    }

    const { newAccessToken, newRefreshToken } = await refreshUserOrchestrator(
      refreshToken,
      sessionId,
    )

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'lax' as const,
    }

    const accessOptions = Object.assign(
      { maxAge: 15 * 60 * 1000 },
      cookieOptions,
    )
    const longLivedOptions = Object.assign(
      { maxAge: 7 * 24 * 60 * 60 * 1000 },
      cookieOptions,
    )

    //Overwrite access and refresh cookies with the fresh set
    res.cookie('accessToken', newAccessToken, accessOptions)
    res.cookie('refreshToken', newRefreshToken, longLivedOptions)
    res.cookie('sessionId', sessionId, longLivedOptions)

    return res.json(successResponse('Tokens refreshed successfully'))
  } catch (err) {
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')
    res.clearCookie('sessionId')
    return next(err)
  }
}
