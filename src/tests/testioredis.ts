import {
  redis,
  loadRedis,
  type MyRedisClientType,
} from '../loaders/loadRedis.js'

async function run() {
  await loadRedis()
  console.log('redis imported successfully')
  const redisInstance = redis.getRedisInstance()

  await test(redisInstance)
  console.log('test executed successfully')
}

async function test(redisInstance: MyRedisClientType) {
  await redisInstance
    .multi()
    .hset('test:key', {
      user_id: 'userId',
      created_at: new Date().toISOString(),
      active_token_hash: 'activeTokenHash',
      used_token_hashes: JSON.stringify(['kert', 'hert']),
    })
    .expire('test:key', 60)
    .sadd('test:session', 'sessionId')
    .expire('test:session', 60)
    .exec()
}

run()
