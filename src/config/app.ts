import { env } from './env.js'

export const appConfig = {
  port: env.PORT,
  nodeEnv: env.NODE_ENV,
  appDomain: env.APP_DOMAIN,
  authStrategy: env.DEFAULT_AUTH_STRATEGY,
}
