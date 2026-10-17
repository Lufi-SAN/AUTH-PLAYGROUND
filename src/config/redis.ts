import { env } from './env.js'

export const redisConfig = {
  redis_url: env.REDIS_URL,
}

export const REDIS_PREFIXES = {
  EMAIL_VERIFICATION_OTP: 'verification_otp:', //Hash for storing otp details
  SESSION: 'user:session:', //Hash for storing session details
  SESSION_INDEX: 'user:sessions:', //Set for a single user's active sessions
  JWK_STORE: 'jwk:keys:', //Hash for storing jwk details. TTL applied when rotated out e.g. jwk:keys:567829efrg
  KID_POINTER: 'jwk:active_kid', //String points at active kid e.g. jwk:active_keyPair "567829efrg"
  JWK_TRACKER: 'jwk:active_key_list',
  EMAIL_CHANGE_VERIFICATION_OTP: 'email_change_verification_otp:', //Hash for storing otp details for email change
} as const

export const redisKeys = {
  emailVerificationOTP: (otp: string) =>
    `${REDIS_PREFIXES.EMAIL_VERIFICATION_OTP}${otp}`,
  session: (sessionId: string) => `${REDIS_PREFIXES.SESSION}${sessionId}`,
  sessionIndex: (userId: string) => `${REDIS_PREFIXES.SESSION_INDEX}${userId}`,
  jwkStore: (kid: string) => `${REDIS_PREFIXES.JWK_STORE}${kid}`, //e.g. jwk:keys:567829efrg
  kidPointer: () => `${REDIS_PREFIXES.KID_POINTER}`,
  jwkTracker: () => `${REDIS_PREFIXES.JWK_TRACKER}`,
  emailChangeVerificationOTP: (otp: string) =>
    `${REDIS_PREFIXES.EMAIL_CHANGE_VERIFICATION_OTP}${otp}:email_change`,
}

export type RedisKeys = typeof redisKeys
