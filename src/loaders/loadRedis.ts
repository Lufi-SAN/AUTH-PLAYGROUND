import { redisConfig } from '../config/redis.js'
import { Redis } from 'ioredis'
import { testWithRetry } from '../utils/testConnectionsWithRetry.js'

let redisInstance: MyRedisClientType | null = null

export async function loadRedis() {
  const { redis_url } = redisConfig

  const redisClient = new Redis(redis_url)

  redisClient.on('error', (err) => {
    console.error('Unexpected error on Redis client', err)
    process.exit(-1)
  })

  //test the connection with retry
  await testWithRetry(() => redisClient.ping(), {
    name: 'Redis',
    fileName: '[loadRedis.ts]',
  })

  redisInstance = redisClient
  return redisClient
}

export const redis = {
  getRedisInstance: () => {
    if (!redisInstance) {
      throw new Error('Redis client not yet initialized')
    }
    return redisInstance
  },
}

export type MyRedisClientType = Redis
