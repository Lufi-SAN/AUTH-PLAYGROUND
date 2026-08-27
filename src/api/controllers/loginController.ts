import type { Request, Response, NextFunction } from '../../types/user.types.js'
import { loginUserOrchestrator } from '../../services/loginServices.js'
import { successResponse } from '../../utils/UTILS_SINK.js'

export async function loginUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { username, password } = req.validatedData as {
      username: string
      password: string
    }

    const { accessToken, refreshToken, sessionId } =
      await loginUserOrchestrator(username, password)

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

    res.cookie('accessToken', accessToken, accessOptions)
    res.cookie('refreshToken', refreshToken, longLivedOptions)
    res.cookie('sessionId', sessionId, longLivedOptions)

    return res.json(successResponse('User logged in successfully'))
  } catch (err) {
    return next(err)
  }
}
