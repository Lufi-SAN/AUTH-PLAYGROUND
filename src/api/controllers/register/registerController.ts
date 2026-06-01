import type {
  Request,
  Response,
  NextFunction,
} from '../../../types/user.types.js'
import { registerUserOrchestration } from '../../../services/register/registerServices.js'
import { successResponse } from '../../../utils/UTILS_SINK.js'

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

    const newUserData = await registerUserOrchestration(
      password,
      username,
      email,
    )

    return res.json(
      successResponse('User registered successfully', newUserData),
    )
  } catch (error) {
    return next(error)
  }
}
