import type { Request, Response, NextFunction } from '../../types/user.types.js'
import { verifyTotpOrchestrator } from '../../services/verifyTotpServices.js'
import type { TotpVerificationSchema } from '../routes/schemas/totpVerification_schema.js'
import { successResponse } from '../../utils/UTILS_SINK.js'

export async function verifyTotp(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.user as { id: string }
    const { code } = req.validatedData as TotpVerificationSchema
    const { message } = await verifyTotpOrchestrator(id, code)
    return res.status(200).json(successResponse(message))
  } catch (err) {
    next(err)
  }
}
