import type { Request, Response, NextFunction } from '../../types/user.types.js'
import { InvalidAuthTokenError } from '../../errors/AppErrors.js'
import { verifyJWTService } from '../../services/verifyJWTService.js'

import { DomainError } from '../../errors/BaseDomainError.js'

export async function verifyJWT(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    //Remember to run a cookie sanitiser for every protected route
    const { authorization } = req.validatedData as {
      authorization?: string
    }

    if (!authorization) {
      return next(new InvalidAuthTokenError('Access token has expired'))
    }

    const [type, token] = authorization.split(' ')

    const payload = await verifyJWTService(token as string)

    req.user = { id: payload.sub as string }
    next()
  } catch (err) {
    console.log('JWT verification error')
    if (err instanceof DomainError) {
      return next(err)
    }
    if (err instanceof Error && err.name === 'JWTExpired') {
      return next(new InvalidAuthTokenError('Access token has expired'))
    }
    if (
      err instanceof Error &&
      (err.name === 'JWTInvalid' ||
        err.name === 'JWSSignatureVerificationFailed')
    ) {
      return next(new InvalidAuthTokenError('JWT is invalid'))
    }
    next(err)
  }
}
