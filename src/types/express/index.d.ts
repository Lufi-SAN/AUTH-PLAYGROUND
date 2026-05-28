import 'express'

declare module 'express-serve-static-core' {
  interface Request {
    userData?: {
      id: number
      token_version: number
    }
    user?: {
      id: string
    }
    validatedData?: Record<string, any>
    rateLimit?: {
      limit: number
      used: number
      remaining: number
      resetTime: Date
    }
  }
}
