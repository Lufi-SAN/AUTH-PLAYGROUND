import { getUserByUsernameDB } from '../repositories/loginRepo.js'
import { UserNotFoundError, UserNotVerifiedError } from '../errors/AppErrors.js'
import { verifyPassword } from '../utils/verifyPassword.js'
import { redisKeys } from '../config/redis.js'
import { redis, type MyRedisClientType } from '../loaders/loadRedis.js'
import { SignJWT } from 'jose'
import { getActiveKid, getSigningKey } from './keyStore.js'
import * as crypto from 'crypto'
import { verify } from 'otplib'

interface UserInfo {
  userId: string
  role: string
}

export interface UserJWTPayload {
  sub: string
  sid: string
  role: string
}

export interface UserSessionData {
  user_id: string
  role: string
  created_at: string
  active_token_hash: string
  used_token_hashes: string[]
}

async function getUserDetailsWithUsername(username: string) {
  const result = await getUserByUsernameDB(username)
  if (result === 'Not verified') {
    throw new UserNotVerifiedError('User is not verified')
  }
  if (result === null) {
    throw new UserNotFoundError('User not found')
  }
  return {
    userId: result.userId,
    passwordHash: result.passwordHash,
    role: result.role,
    totpSecret: result.totpSecret,
  }
}

async function createUserSession(
  redisInstance: MyRedisClientType,
  redisKey: string,
  { userId, role }: UserInfo,
  activeTokenHash: string,
  sessionIndexKey: string,
) {
  await redisInstance
    .multi()
    .hset(redisKey, {
      user_id: userId,
      role: role,
      created_at: new Date().toISOString(),
      active_token_hash: activeTokenHash,
      used_token_hashes: JSON.stringify([]),
    })
    .expire(redisKey, 7 * 24 * 60 * 60)
    .sadd(sessionIndexKey, redisKey)
    .exec()
}

export function createRefreshToken() {
  return crypto.randomBytes(32).toString('hex')
}

export async function createAccessToken(
  { userId, role }: UserInfo,
  sessionId: string,
) {
  //Get signing key & active kid as metadata for eventual public key verification
  const signingKey = getSigningKey()
  const kid = getActiveKid()
  const accessToken = await new SignJWT({
    sub: userId,
    sid: sessionId,
    role: role,
  })
    .setProtectedHeader({
      alg: 'EdDSA',
      kid,
      typ: 'at+jwt',
    })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(signingKey)

  return accessToken
}

export async function loginUserOrchestrator(
  username: string,
  password: string,
  code?: string,
) {
  const { userId, passwordHash, role, totpSecret } =
    await getUserDetailsWithUsername(username)
  const userInfo = { userId, role }

  const doesPasswordMatch = await verifyPassword(password, passwordHash)
  if (!doesPasswordMatch) {
    throw new UserNotFoundError('User not found: Password does not match')
  }

  if (code) {
    if (!totpSecret) {
      throw new UserNotFoundError('User not found: TOTP secret not found')
    } else {
      const verification = await verify({
        secret: totpSecret,
        token: code,
      })
      if (!verification.valid) {
        throw new UserNotFoundError('User not found: Invalid TOTP code')
      }
    }
  }

  const refreshToken = createRefreshToken()
  const refreshTokenHash = crypto
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex')

  const sessionId = `sid-${crypto.randomBytes(32).toString('hex')}`
  const SESSION_KEY = redisKeys.session(sessionId)
  const SESSION_INDEX_KEY = redisKeys.sessionIndex(userId)
  const redisInstance = redis.getRedisInstance()
  await createUserSession(
    redisInstance,
    SESSION_KEY,
    userInfo,
    refreshTokenHash,
    SESSION_INDEX_KEY,
  )
  const accessToken = await createAccessToken(userInfo, sessionId)

  return { accessToken, refreshToken, sessionId }
}
