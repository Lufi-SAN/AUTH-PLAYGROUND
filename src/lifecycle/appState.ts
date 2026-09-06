import { appConfig } from '../config/app.js'
import { verificationStrategySchema } from './schemas/verificationStrategy_schema.js'
import type { VerificationStrategy } from '../types/user.types.js'

let appStateInstance: AppState | null = null

class AppState {
  private _currentVerificationStrategy: VerificationStrategy

  constructor() {
    const parsedStrategyAtBoot = verificationStrategySchema.safeParse(
      appConfig.verificationStrategy,
    )
    if (parsedStrategyAtBoot.success) {
      this._currentVerificationStrategy = parsedStrategyAtBoot.data
    } else {
      throw new Error(
        `Invalid auth strategy configuration. Check env.DEFAULT_AUTH_STRATEGY: ${JSON.stringify(
          parsedStrategyAtBoot.error.format(),
        )}`,
      )
    }
  }

  get currentVerificationStrategy(): VerificationStrategy {
    return this._currentVerificationStrategy
  }

  set currentVerificationStrategy(strategy: VerificationStrategy) {
    this._currentVerificationStrategy = strategy
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
