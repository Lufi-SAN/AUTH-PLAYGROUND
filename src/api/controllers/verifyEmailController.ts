import type { Request, Response, NextFunction } from '../../types/user.types.js'
import { verifyEmailOrchestrator } from '../../services/verifyEmailServices.js'
import { successResponse } from '../../utils/UTILS_SINK.js'

export async function verifyEmail(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { otp, email } = req.validatedData as { otp: string; email: string }

    const { message } = await verifyEmailOrchestrator(otp, email)

    return res.json(successResponse(message))
  } catch (error) {
    return next(error)
  }
}
