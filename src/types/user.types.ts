export type { Pool } from 'pg'

export type { Server } from 'node:http'

export type { MyRedisClientType } from '../loaders/loadRedis.js'

export type { MailerClientType } from '../loaders/loadMailer.js'

export type {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from 'express'

export type { SanitiserInputType } from '../api/middleware/inputSanitiser.js'

export interface ApiSuccess {
  success: true
  message?: string
  data?: Record<string, unknown>
}

export interface ApiError {
  success: false
  error: {
    status: number
    title: string
    detail: string
  }
  path: string
}

export interface DomainErrorType extends Error {
  message: 'HTTP Error'
  status: number
  title: string
  detail: string
}
