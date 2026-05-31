import type {
  NextFunction,
  Request,
  Response,
  DomainErrorType,
} from '../../types/user.types.js'
import { appConfig } from '../../config/app.js'
import { errorResponse, isDomainError } from '../../utils/UTILS_SINK.js'

export function globalErrorHandler(
  err: Error | DomainErrorType,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.error('Global error handler:', err)
  const path = appConfig.appDomain + req.originalUrl

  if ('status' in err && isDomainError(err)) {
    const status = err.status
    const title = err.title
    const detail = err.detail

    return res.json(errorResponse(status, title, detail, path))
  }

  const defaultStatusCode = 500
  const dTitle = 'Internal Server Error'
  const dDetail = 'An unexpected error occurred. Please try again later.'

  return res.json(errorResponse(defaultStatusCode, dTitle, dDetail, path))
}
