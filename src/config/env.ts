import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().nonempty(),
  REDIS_URL: z.string().nonempty(),
  APP_DOMAIN: z.string().nonempty(),
  OWASP_ARGON2_MEMORY_COST: z.coerce.number().default(19456),
})

export const env = envSchema.parse(process.env)
