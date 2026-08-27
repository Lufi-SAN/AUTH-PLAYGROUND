import type { Request, Response, NextFunction } from '../../types/user.types.js'
import { resendLinkOrchestrator } from '../../services/resendLinkServices.js'
import { successResponse } from '../../utils/JSONGenerators.js'

export async function resendLink(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { email } = req.validatedData as {
    email: string
  }

  try {
    const { message } = await resendLinkOrchestrator(email)
    return res.json(successResponse(message))
  } catch (err) {
    return next(err)
  }
}
