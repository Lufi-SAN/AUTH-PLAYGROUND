import type { Request, Response, NextFunction } from '../../types/user.types.js'
import type { ChangeEmailSchema } from '../routes/schemas/changeEmail_schema.js'
import { changeEmailOrchestrator } from '../../services/changeEmailServices.js'
import { successResponse } from '../../utils/JSONGenerators.js'

export async function changeEmail(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id: userId } = req.user as { id: string }
    const { currentEmail, newEmail, totpCode } =
      req.validatedData as ChangeEmailSchema

    await changeEmailOrchestrator(userId, currentEmail, newEmail, totpCode)

    return res.status(200).json(successResponse('Email changed successfully'))
  } catch (error) {
    next(error)
  }
}
