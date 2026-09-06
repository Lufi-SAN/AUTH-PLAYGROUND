import type {
  Request,
  Response,
  NextFunction,
  VerificationStrategy,
} from '../../types/user.types.js'
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
      verificationStrategy?: VerificationStrategy
    }

    let { verificationStrategy } = req.validatedData as {
      username: string
      email: string
      password: string
      verificationStrategy?: VerificationStrategy
    }

    if (!verificationStrategy) {
      verificationStrategy = appState.getAppState().currentVerificationStrategy
    }

    const newUserData = await registerUserOrchestrator(
      password,
      username,
      email,
      verificationStrategy,
    )

    return res.json(
      successResponse('User registered successfully', newUserData),
    )
  } catch (error) {
    return next(error)
  }
}
