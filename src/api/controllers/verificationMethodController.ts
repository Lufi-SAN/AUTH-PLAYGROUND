import type { Request, Response, NextFunction } from '../../types/user.types.js'
import { appState } from '../../lifecycle/appState.js'
import { successResponse } from '../../utils/JSONGenerators.js'

export async function chooseVerificationMethod(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { strategy } = req.validatedData as {
      strategy: 'emailVerification' | 'totp' | 'webauthn'
    }
    appState.getAppState().currentAuthStrategy = strategy
    return res.json(
      successResponse('Verification method chosen successfully', { strategy }),
    )
  } catch (err) {
    next(err)
  }
}
