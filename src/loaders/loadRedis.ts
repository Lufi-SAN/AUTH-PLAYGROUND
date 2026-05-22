import { redisConfig } from '../config/redis.js'
import { createClient } from 'redis'
import { testWithRetry } from '../utils/testConnectionsWithRetry.js'

export async function loadRedis() {
  const { redis_url } = redisConfig

  const redisClient = createClient({ url: redis_url })

  redisClient.on('error', (err) => {
    console.error('Unexpected error on Redis client', err)
    process.exit(-1)
  })

  //test the connection with retry
  await testWithRetry(() => redisClient.connect(), { name: 'Redis' })

  return redisClient
}

export type MyRedisClientType = ReturnType<typeof createClient>
