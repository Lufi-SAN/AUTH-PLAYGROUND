import type { Request, Response, NextFunction } from '../../types/user.types.js'
import type { VerifyEmailSchema } from '../routes/schemas/verifyEmail_schema.js'
import { verifyEmailOrchestrator } from '../../services/verifyEmailServices.js'
import { successResponse } from '../../utils/UTILS_SINK.js'

export async function verifyEmail(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { otp, type } = req.validatedData as VerifyEmailSchema

    if (type === 'register') {
      const { message } = await verifyEmailOrchestrator(otp, type)

      return res.status(200).json(successResponse(message))
    }

    if (type === 'change-email') {
      const { userId, updatedEmail } = await verifyEmailOrchestrator(otp, type)

      return res.status(200).json(
        successResponse('Email change verified', {
          userId,
          updatedEmail,
        }),
      )
    }
  } catch (error) {
    return next(error)
  }
}
