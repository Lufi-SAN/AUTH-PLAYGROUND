import { env } from './env.js'

export const postgresConfig = {
  pg_url: env.DATABASE_URL,
}
