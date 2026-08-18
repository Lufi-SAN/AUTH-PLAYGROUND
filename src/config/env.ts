import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().nonempty(),
  REDIS_URL: z.string().nonempty(),
  APP_DOMAIN: z.string().nonempty(),
  OWASP_ARGON2_MEMORY_COST: z.coerce.number().default(19456),
  SMTP_HOST: z.string().nonempty(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().nonempty(),
  SMTP_PASSWORD: z.string().nonempty(),
  DEFAULT_AUTH_STRATEGY: z
    .enum(['emailVerification', 'totp', 'webauthn'])
    .default('emailVerification'),
})

export const env = envSchema.parse(process.env)
