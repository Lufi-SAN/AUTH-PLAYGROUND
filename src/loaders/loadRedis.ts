import { redisConfig } from '../config/redis.js'
import { createClient } from 'redis'
import { testWithRetry } from '../utils/testConnectionsWithRetry.js'

let redisInstance: MyRedisClientType | null = null

export async function loadRedis() {
  const { redis_url } = redisConfig

  const redisClient = createClient({ url: redis_url })

  redisClient.on('error', (err) => {
    console.error('Unexpected error on Redis client', err)
    process.exit(-1)
  })

  //test the connection with retry
  await testWithRetry(() => redisClient.connect(), { name: 'Redis' })

  redisInstance = redisClient
  return redisClient
}

export const redis = {
  getRedis: () => {
    if (!redisInstance) {
      throw new Error('Redis client not initialized')
    }
    return redisInstance
  },
}

export type MyRedisClientType = ReturnType<typeof createClient>
