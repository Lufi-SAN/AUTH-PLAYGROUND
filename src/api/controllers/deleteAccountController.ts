import type { Request, Response, NextFunction } from '../../types/user.types.js'
import { successResponse } from '../../utils/JSONGenerators.js'

export async function deleteAccount(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    return res.status(200).json(successResponse('Account deleted successfully'))
  } catch (error) {
    next(error)
  }
}
