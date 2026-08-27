import { getUserByUsernameDB } from '../repositories/loginRepo.js'
import { UserNotFoundError, UserNotVerifiedError } from '../errors/AppErrors.js'
import argon2id from '@node-rs/argon2'
import { argon2Config } from '../config/argon2.js'
import { redisKeys } from '../config/redis.js'
import { redis, type MyRedisClientType } from '../loaders/loadRedis.js'
import { SignJWT } from 'jose'
import { getActiveKid, getSigningKey } from './keyStore.js'
import * as crypto from 'crypto'

async function getUserDetailsWithUsername(username: string) {
  const result = await getUserByUsernameDB(username)
  if (result === 'Not verified') {
    throw new UserNotVerifiedError('User is not verified')
  }
  if (result === null) {
    throw new UserNotFoundError('User not found')
  }
  return { userId: result.userId, passwordHash: result.passwordHash }
}

async function verifyPassword(password: string, passwordHash: string) {
  return await argon2id.verify(passwordHash, password, {
    memoryCost: argon2Config.memoryCost,
  })
}

async function createUserSession(
  redisInstance: MyRedisClientType,
  redisKey: string,
  userId: string,
  activeTokenHash: string,
) {
  await redisInstance.hset(redisKey, {
    user_id: userId,
    createdAt: new Date().toISOString(),
    activeTokenHash,
    usedTokenHashes: JSON.stringify([]),
  })
  await redisInstance.expire(redisKey, 7 * 24 * 60 * 60) // Set session expiration to 7 days
}

export function createRefreshToken() {
  return crypto.randomBytes(32).toString('hex')
}

export async function createAccessToken(userId: string) {
  //Get signing key & active kid as metadata for eventual public key verification
  const signingKey = getSigningKey()
  const kid = getActiveKid()
  const accessToken = await new SignJWT({
    sub: userId,
  })
    .setProtectedHeader({
      alg: 'EdDSA',
      kid,
      typ: 'JWT',
    })
    .setIssuedAt()
    .setExpirationTime('15m')
    .setJti(crypto.randomUUID())
    .sign(signingKey)

  return accessToken
}

export async function loginUserOrchestrator(
  username: string,
  password: string,
) {
  const { userId, passwordHash } = await getUserDetailsWithUsername(username)
  const doesPasswordMatch = await verifyPassword(password, passwordHash)
  if (!doesPasswordMatch) {
    throw new UserNotFoundError('User not found: Password does not match')
  }
  const refreshToken = createRefreshToken()
  const refreshTokenHash = crypto
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex')
  const sessionId = `sid-${crypto.randomBytes(32).toString('hex')}`
  const SESSION_KEY = redisKeys.session(sessionId)
  const redisInstance = redis.getRedisInstance()
  await createUserSession(redisInstance, SESSION_KEY, userId, refreshTokenHash)
  const accessToken = await createAccessToken(userId)

  return { accessToken, refreshToken, sessionId }
}
