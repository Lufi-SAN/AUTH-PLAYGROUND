import type { Request, Response, NextFunction } from '../../types/user.types.js'
import { resendLinkOrchestrator } from '../../services/resendLinkServices.js'

export async function resendLink(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { email } = req.validatedData as {
    email: string
  }

  try {
    await resendLinkOrchestrator(email)
  } catch (err) {
    return next(err)
  }
}
