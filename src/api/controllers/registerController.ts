import type { Request, Response, NextFunction } from '../../types/user.types.js'
import { appState } from '../../lifecycle/appState.js'
import { registerUserOrchestrator } from '../../services/registerServices.js'
import { successResponse } from '../../utils/UTILS_SINK.js'

export async function registerUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    //get validated data from sanitiser middleware
    const { username, email, password } = req.validatedData as {
      username: string
      email: string
      password: string
    }

    const authStrategy = appState.getAppState().currentAuthStrategy

    const newUserData = await registerUserOrchestrator(
      password,
      username,
      email,
      authStrategy,
    )

    return res.json(
      successResponse('User registered successfully', newUserData),
    )
  } catch (error) {
    return next(error)
  }
}
