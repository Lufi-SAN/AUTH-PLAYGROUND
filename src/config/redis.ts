import { env } from './env.js'

export const redisConfig = {
  redis_url: env.REDIS_URL,
}

export const REDIS_PREFIXES = {
  EMAIL_VERIFICATION_OTP: 'verification_otp:',
  SESSION: 'session:',
  SESSION_INDEX: 'user:sessions:',
} as const

export const redisKeys = {
  emailVerificationOTP: (userId: string, email: string) =>
    `${REDIS_PREFIXES.EMAIL_VERIFICATION_OTP}${userId}:${email.toLowerCase().trim()}`,
  session: (sessionId: string) => `${REDIS_PREFIXES.SESSION}${sessionId}`,
  sessionIndex: (userId: string) => `${REDIS_PREFIXES.SESSION_INDEX}${userId}`,
}

export type RedisKeys = typeof redisKeys
