import {
  MissingAuthCredentialsError,
  UserNotFoundError,
} from '../errors/AppErrors.js'
import { redis } from '../loaders/loadRedis.js'
import { redisKeys } from '../config/redis.js'
import {
  updatePasswordHashDB,
  getUserPasswordHashDB,
} from '../repositories/changePasswordRepo.js'
import { verifyPassword, createPasswordHash } from '../utils/UTILS_SINK.js'

export async function changePasswordOrchestrator(
  sessionId: string | undefined,
  userId: string,
  currentPassword: string,
  newPassword: string,
) {
  if (!sessionId) {
    throw new MissingAuthCredentialsError('Session ID missing')
  }

  const passwordHash = await getUserPasswordHashDB(userId) // Ensure user exists and get password hash
  if (!passwordHash) {
    throw new UserNotFoundError('User not found') // Handle user not found case
  }

  const isCurrentPasswordValid = await verifyPassword(
    currentPassword,
    passwordHash,
  )
  if (!isCurrentPasswordValid) {
    throw new UserNotFoundError('User not found: Password does not match') // Handle incorrect current password
  }

  const newPasswordHash = await createPasswordHash(newPassword) // Hash the new password

  const updateInfo = await updatePasswordHashDB(userId, newPasswordHash)

  //delete all sessions
  const redisInstance = redis.getRedisInstance()
  const SESSION_INDEX = redisKeys.sessionIndex(userId)
  const sessionKeys = await redisInstance.smembers(SESSION_INDEX)
  if (sessionKeys.length > 0) {
    await redisInstance.multi().del(sessionKeys).del(SESSION_INDEX).exec()
  }

  return updateInfo
}
