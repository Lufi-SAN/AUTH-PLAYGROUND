import { getUserByUsernameDB } from '../repositories/loginRepo.js'
import { UserNotFoundError, UserNotVerifiedError } from '../errors/AppErrors.js'
import argon2id from '@node-rs/argon2'
import { argon2Config } from '../config/argon2.js'
import { redisKeys } from '../config/redis.js'
import { redis, type MyRedisClientType } from '../loaders/loadRedis.js'
import { nanoid } from 'nanoid'
import { SignJWT } from 'jose'

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
) {
  await redisInstance.hset(redisKey, {
    userId,
    createdAt: new Date().toISOString(),
  })
  await redisInstance.expire(redisKey, 24 * 60 * 60) // Set session expiration to 24 hours
}

async function createTokens() {
  //Get signing key & active kid as metadata for eventual public key verification
  const accessToken = await new SignJWT()
    .setProtectedHeader({})
    .setIssuedAt()
    .setExpirationTime()
    .sign()

  return { accessToken }
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
  const seshId = nanoid()
  const redisKey = redisKeys.session(seshId)
  const redisInstance = redis.getRedisInstance()
  await createUserSession(redisInstance, redisKey, userId)
}
