import type { Request, Response, NextFunction } from '../../types/user.types.js'
import { enrollTotpOrchestrator } from '../../services/totpServices.js'

export async function enrollTotp(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.user as { id: string }

    const { otpURI, qrCodeDataURL } = await enrollTotpOrchestrator(id)
    return res.status(200).json({
      message: 'TOTP enrollment successful',
      otpURI,
      qrCodeDataURL,
    })
  } catch (err) {
    next(err)
  }
}
