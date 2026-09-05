import { MissingAuthCredentialsError } from '../errors/AppErrors.js'
import { redisKeys } from '../config/redis.js'
import { redis } from '../loaders/loadRedis.js'

export async function logoutOrchestrator(
  sessionId: string | undefined,
  userId: string,
) {
  if (!sessionId) {
    throw new MissingAuthCredentialsError('Session ID missing')
  }

  const SESSION_INDEX = redisKeys.sessionIndex(userId)
  const redisInstance = redis.getRedisInstance()
  const sessionKeys = await redisInstance.smembers(SESSION_INDEX)
  if (sessionKeys.length > 0) {
    await redisInstance.multi().del(sessionKeys).del(SESSION_INDEX).exec()
  }

  return { message: 'User logged out successfully' }
}
