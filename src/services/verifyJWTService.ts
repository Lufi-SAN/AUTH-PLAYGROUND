import { jwtVerify } from 'jose'
import { getActiveKid, getPublicKeyFromCache } from './keyStore.js'
import type { UserJWTPayload } from '../types/user.types.js'

export async function verifyJWTService(token: string) {
  const kid = getActiveKid()
  const publicKey = getPublicKeyFromCache(kid) as CryptoKey

  const { payload } = await jwtVerify(token, publicKey, {
    algorithms: ['EdDSA'],
  })

  return payload as unknown as UserJWTPayload
}
