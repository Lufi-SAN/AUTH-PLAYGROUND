import * as crypto from 'crypto'
import { redisKeys } from '../config/redis.js'
import { redis } from '../loaders/loadRedis.js'
import {
  MissingAuthCredentialsError,
  InvalidAuthTokenError,
  UnauthorizedUserError,
  SessionBreachDetectedError,
} from '../errors/AppErrors.js'
import { createAccessToken, createRefreshToken } from './loginServices.js'

export async function refreshUserOrchestrator(
  incomingRefreshToken: string | undefined,
  sessionId: string,
) {
  if (!incomingRefreshToken || !sessionId) {
    throw new MissingAuthCredentialsError('Refresh token missing')
  }

  const redisInstance = redis.getRedisInstance()
  const SESSION_KEY = redisKeys.session(sessionId)
  const sessionData = await redisInstance.hgetall(SESSION_KEY)

  if (!sessionData) {
    throw new UnauthorizedUserError('Invalid or expired session')
  }

  const usedTokenHashes: string[] = JSON.parse(
    sessionData.usedTokenHashes || '[]',
  )
  const activeTokenHash = sessionData.activeTokenHash
  const userId = sessionData.user_id

  const incomingHash = crypto
    .createHash('sha256')
    .update(incomingRefreshToken)
    .digest('hex')

  //Token reuse? Wipe the session
  if (usedTokenHashes.includes(incomingHash)) {
    // NUCLEAR OPTION: Attacker or Legitimate user is re-submitting old tokens.
    await redisInstance.del(SESSION_KEY)
    throw new SessionBreachDetectedError('Token reuse. Session invalidated.')
  }

  if (activeTokenHash !== incomingHash) {
    throw new InvalidAuthTokenError('Refresh token is invalid')
  }

  usedTokenHashes.push(incomingHash)

  const newRefreshToken = createRefreshToken()
  const newRefreshTokenHash = crypto
    .createHash('sha256')
    .update(newRefreshToken)
    .digest('hex')

  await redisInstance.hset(SESSION_KEY, {
    activeTokenHash: newRefreshTokenHash,
    usedTokenHashes: JSON.stringify(usedTokenHashes),
  })

  await redisInstance.expire(SESSION_KEY, 7 * 24 * 60 * 60) //Extend TTL of your session by re-starting expiry time

  const accessToken = await createAccessToken(userId as string)
  return { accessToken, newRefreshToken, sessionId }
}
