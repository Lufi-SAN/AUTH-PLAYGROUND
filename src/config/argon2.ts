import { env } from './env.js'

export const argon2Config = {
  memoryCost: env.OWASP_ARGON2_MEMORY_COST,
}
