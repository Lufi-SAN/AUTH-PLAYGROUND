import { rateLimit } from 'express-rate-limit'
import { RedisStore, type RedisReply } from 'rate-limit-redis'
import { redis } from '../../loaders/loadRedis.js'
import { TooManyAttemptsError } from '../../errors/AppErrors.js'

const redisInstance = redis.getRedisInstance()

//IP-layer rate limiter
export const IPLimiter = (window: number, limit: number, redisPrefix: string) =>
  rateLimit({
    windowMs: window * 60 * 1000,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    store: new RedisStore({
      sendCommand: (...args: string[]) =>
        redisInstance.call(
          ...(args as [string, ...string[]]),
        ) as Promise<RedisReply>,
      prefix: `${redisPrefix}:rate-limit:ip`,
    }),
    handler: (req, res, next) => {
      return next(
        new TooManyAttemptsError('Too many requests, please try again later.'),
      )
    },
  })

/**custom rate limiter
C
U
S
T
O
M

H
E
R
E
*/

//total traffic limiter(ip-based)
export const globalTrafficLimiter = (
  window: number,
  limit: number,
  redisPrefix: string,
) =>
  rateLimit({
    windowMs: window * 60 * 1000,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: () => `${redisPrefix}:global-rate-limit:ip`,
    store: new RedisStore({
      sendCommand: (...args: string[]) =>
        redisInstance.call(
          ...(args as [string, ...string[]]),
        ) as Promise<RedisReply>,
      prefix: 'rate-limit:global:',
    }),
    handler: (req, res, next) => {},
  })
