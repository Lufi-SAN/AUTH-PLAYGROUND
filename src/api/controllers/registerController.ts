import type { Request, Response, NextFunction } from '../../types/user.types.js'
import { registerUserOrchestrator } from '../../services/registerServices.js'
import { successResponse } from '../../utils/UTILS_SINK.js'
import type { RegisterSchema } from '../routes/schemas/register_schema.js'

export async function registerUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    //get validated data from sanitiser middleware
    const { username, email, password } = req.validatedData as RegisterSchema

    const newUserData = await registerUserOrchestrator(
      password,
      username,
      email,
    )

    return res
      .status(201)
      .json(successResponse('User registered successfully', newUserData))
  } catch (error) {
    return next(error)
  }
}
