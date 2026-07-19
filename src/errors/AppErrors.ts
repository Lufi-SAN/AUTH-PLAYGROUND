import { DomainError } from './BaseDomainError.js'
import { type DomainErrorType } from '../types/user.types.js'

class BadRequestError extends DomainError implements DomainErrorType {
  constructor(
    public detail: string,
    public readonly message = 'HTTP Error' as const,
    public readonly status = 400 as const,
    public readonly title = 'Bad Request' as const,
  ) {
    super()
  }
}
class InvalidUserFormCredentials
  extends DomainError
  implements DomainErrorType
{
  constructor(
    public detail: string,
    public readonly message = 'HTTP Error' as const,
    public readonly status = 422 as const,
    public readonly title = 'Unprocessable Content' as const,
  ) {
    super()
  }
}
class InvalidLoginCredentials extends DomainError implements DomainErrorType {
  constructor(
    public detail: string,
    public readonly message = 'HTTP Error' as const,
    public readonly status = 401 as const,
    public readonly title = 'Unauthorized' as const,
  ) {
    super()
  }
}
class UserAlreadyExists extends DomainError implements DomainErrorType {
  constructor(
    public detail: string,
    public readonly message = 'HTTP Error' as const,
    public readonly status = 409 as const,
    public readonly title = 'Conflict' as const,
  ) {
    super()
  }
}
class UnauthorizedUser extends DomainError implements DomainErrorType {
  constructor(
    public detail: string,
    public readonly message = 'HTTP Error' as const,
    public readonly status = 401 as const,
    public readonly title = 'Unauthorized' as const,
  ) {
    super()
  }
}
class TooManyAttempts extends DomainError implements DomainErrorType {
  constructor(
    public detail: string,
    public readonly message = 'HTTP Error' as const,
    public readonly status = 429 as const,
    public readonly title = 'Too Many Requests' as const,
  ) {
    super()
  }
}

class UserNotFound extends DomainError implements DomainErrorType {
  constructor(
    public detail: string,
    public readonly message = 'HTTP Error' as const,
    public readonly status = 404 as const,
    public readonly title = 'Not Found' as const,
  ) {
    super()
  }
}

class OtpNotFound extends DomainError implements DomainErrorType {
  constructor(
    public detail: string,
    public readonly message = 'HTTP Error' as const,
    public readonly status = 410 as const,
    public readonly title = 'Gone' as const,
  ) {
    super()
  }
}

class VerificationEmailMismatch extends DomainError implements DomainErrorType {
  constructor(
    public detail: string,
    public readonly message = 'HTTP Error' as const,
    public readonly status = 403 as const,
    public readonly title = 'Forbidden' as const,
  ) {
    super()
  }
}

export {
  BadRequestError,
  InvalidUserFormCredentials,
  InvalidLoginCredentials,
  UserAlreadyExists,
  UnauthorizedUser,
  TooManyAttempts,
  UserNotFound,
  OtpNotFound,
  VerificationEmailMismatch,
}
