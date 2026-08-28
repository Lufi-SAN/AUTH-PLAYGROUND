import * as crypto from 'crypto'
import { redisKeys } from '../config/redis.js'
import { redis } from '../loaders/loadRedis.js'
import {
  MissingAuthCredentialsError,
  InvalidAuthTokenError,
  UnauthorizedUserError,
  SessionBreachDetectedError,
  SessionExpiredError,
} from '../errors/AppErrors.js'
import { createAccessToken, createRefreshToken } from './loginServices.js'

export async function refreshUserOrchestrator(
  incomingRefreshToken: string | undefined,
  incomingSessionId: string | undefined,
) {
  if (!incomingRefreshToken || !incomingSessionId) {
    throw new MissingAuthCredentialsError('Refresh token missing')
  }

  const redisInstance = redis.getRedisInstance()
  const SESSION_KEY = redisKeys.session(incomingSessionId)
  const sessionData = await redisInstance.hgetall(SESSION_KEY)

  if (!sessionData) {
    throw new UnauthorizedUserError('Invalid or expired session')
  }

  const usedTokenHashes: string[] = JSON.parse(
    sessionData.used_token_hashes || '[]',
  )
  const activeTokenHash = sessionData.active_token_hash
  const userId = sessionData.user_id

  const incomingRefreshTokenHash = crypto
    .createHash('sha256')
    .update(incomingRefreshToken)
    .digest('hex')

  //Token reuse? Wipe the session
  if (usedTokenHashes.includes(incomingRefreshTokenHash)) {
    // NUCLEAR OPTION: Attacker or Legitimate user is re-submitting old tokens.
    await redisInstance.del(SESSION_KEY)
    throw new SessionBreachDetectedError('Token reuse. Session invalidated.')
  }

  //Check if correct refresh token to session link
  if (activeTokenHash !== incomingRefreshTokenHash) {
    throw new InvalidAuthTokenError('Refresh token is invalid')
  }

  usedTokenHashes.push(incomingRefreshTokenHash)

  //CAP on the array ballooning - what's cleared wouldn't be risky realistically
  if (usedTokenHashes.length > 5) {
    usedTokenHashes.shift() // Removes the oldest hash from the front of the array
  }

  const newRefreshToken = createRefreshToken()
  const newRefreshTokenHash = crypto
    .createHash('sha256')
    .update(newRefreshToken)
    .digest('hex')

  await redisInstance.hset(SESSION_KEY, {
    active_token_hash: newRefreshTokenHash,
    used_token_hashes: JSON.stringify(usedTokenHashes),
  })

  await redisInstance.expire(SESSION_KEY, 7 * 24 * 60 * 60) //Extend TTL of your session by re-starting expiry time

  const newAccessToken = await createAccessToken(
    userId as string,
    incomingSessionId,
  )
  return { newAccessToken, newRefreshToken, incomingSessionId }
}
