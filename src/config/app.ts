import { env } from './env.js'

export const appConfig = {
  port: env.PORT,
  nodeEnv: env.NODE_ENV,
}
