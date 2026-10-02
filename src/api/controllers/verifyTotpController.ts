import type { Request, Response, NextFunction } from '../../types/user.types.js'
import { verifyTotpOrchestrator } from '../../services/verifyTotpServices.js'

export async function verifyTotp(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.user as { id: string }
    const { code } = req.validatedData as { code: string }
    await verifyTotpOrchestrator(id, code)
  } catch (err) {
    next(err)
  }
}
