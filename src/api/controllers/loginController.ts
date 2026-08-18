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

    const userData = await loginUserOrchestrator(username, password)
  } catch (err) {
    return next(err)
  }
}
