import { appConfig } from '../config/app.js'
import { authStrategySchema } from './schemas/authStrategy_schema.js'
import type { AuthStrategy } from '../types/user.types.js'

let appStateInstance: AppState | null = null

class AppState {
  private _currentAuthStrategy: AuthStrategy

  constructor() {
    const parsedStrategyAtBoot = authStrategySchema.safeParse(
      appConfig.authStrategy,
    )
    if (parsedStrategyAtBoot.success) {
      this._currentAuthStrategy = parsedStrategyAtBoot.data
    } else {
      throw new Error(
        `Invalid auth strategy configuration. Check env.DEFAULT_AUTH_STRATEGY: ${JSON.stringify(
          parsedStrategyAtBoot.error.format(),
        )}`,
      )
    }
  }

  get currentAuthStrategy(): AuthStrategy {
    return this._currentAuthStrategy
  }

  set currentAuthStrategy(strategy: AuthStrategy) {
    this._currentAuthStrategy = strategy
  }
}

export function setupAppState() {
  appStateInstance = new AppState()
}

export const appState = {
  getAppState: () => {
    if (!appStateInstance) {
      throw new Error(
        'AppState has not been initialized. Please call setupAppState() first.',
      )
    }
    return appStateInstance
  },
}

/**
Will run sync at buil
If DEFAULT_AUTH_STRATEGY not present or wrong value, an error will be thrown by the constructor. This should stop build from happening
We have an exported appState object that returns the appStateInstance. If empty, throws an error. Used in res-req path so handled by global error handler(I think should alert dev: dashboard OR process.exit straight)
appStateInstance has setter & getter to affect private appState variable 
*/
