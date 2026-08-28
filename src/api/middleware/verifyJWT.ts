import type { Request, Response, NextFunction } from '../../types/user.types.js'
import { InvalidAuthTokenError } from '../../errors/AppErrors.js'
import { jwtVerify } from 'jose'
import { getActiveKid, getPublicKeyFromCache } from '../../services/keyStore.js'

import { DomainError } from '../../errors/BaseDomainError.js'

async function verifyJWT(req: Request, res: Response, next: NextFunction) {
  try {
    //Remember to run a cookie sanitiser for every protected route
    const { accessToken } = req.validatedData as {
      accessToken?: string
    }

    if (!accessToken) {
      return next(new InvalidAuthTokenError('Access token has expired'))
    }

    const kid = getActiveKid()
    const publicKey = getPublicKeyFromCache(kid) as CryptoKey

    const { payload } = await jwtVerify(accessToken, publicKey, {
      algorithms: ['EdDSA'],
    })

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
