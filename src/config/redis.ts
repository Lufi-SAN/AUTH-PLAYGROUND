import { env } from './env.js'

export const redisConfig = {
  redis_url: env.REDIS_URL,
}

export const REDIS_PREFIXES = {
  EMAIL_VERIFICATION_OTP: 'verification_otp:', //Hash for storing otp details
  SESSION: 'session:', //Hash for storing session details
  SESSION_INDEX: 'user:sessions:', //set
  JWK_STORE: 'jwk:keys:', //Hash for storing jwk details. TTL applied when rotated out e.g. jwk:keys:567829efrg
  KID_POINTER: 'jwk:active_kid', //points active kid e.g. jwk:active_keyPair "567829efrg"
} as const

export const redisKeys = {
  emailVerificationOTP: (otp: string) =>
    `${REDIS_PREFIXES.EMAIL_VERIFICATION_OTP}${otp}`,
  session: (sessionId: string) => `${REDIS_PREFIXES.SESSION}${sessionId}`,
  sessionIndex: (userId: string) => `${REDIS_PREFIXES.SESSION_INDEX}${userId}`,
  jwkStore: (kid: string) => `${REDIS_PREFIXES.JWK_STORE}${kid}`, //e.g. jwk:keys:567829efrg
  kidPointer: () => `${REDIS_PREFIXES.KID_POINTER}`,
}

export type RedisKeys = typeof redisKeys
