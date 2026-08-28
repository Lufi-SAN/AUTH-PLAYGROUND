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

class InvalidUserFormCredentialsError
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

class InvalidLoginCredentialsError
  extends DomainError
  implements DomainErrorType
{
  constructor(
    public detail: string,
    public readonly message = 'HTTP Error' as const,
    public readonly status = 401 as const,
    public readonly title = 'Unauthorized' as const,
  ) {
    super()
  }
}

class UserAlreadyExistsError extends DomainError implements DomainErrorType {
  constructor(
    public detail: string,
    public readonly message = 'HTTP Error' as const,
    public readonly status = 409 as const,
    public readonly title = 'Conflict' as const,
  ) {
    super()
  }
}

class UnauthorizedUserError extends DomainError implements DomainErrorType {
  constructor(
    public detail: string,
    public readonly message = 'HTTP Error' as const,
    public readonly status = 401 as const,
    public readonly title = 'Unauthorized' as const,
  ) {
    super()
  }
}

class TooManyAttemptsError extends DomainError implements DomainErrorType {
  constructor(
    public detail: string,
    public readonly message = 'HTTP Error' as const,
    public readonly status = 429 as const,
    public readonly title = 'Too Many Requests' as const,
  ) {
    super()
  }
}

class UserNotFoundError extends DomainError implements DomainErrorType {
  constructor(
    public detail: string,
    public readonly message = 'HTTP Error' as const,
    public readonly status = 404 as const,
    public readonly title = 'Not Found' as const,
  ) {
    super()
  }
}

class OtpNotFoundError extends DomainError implements DomainErrorType {
  constructor(
    public detail: string,
    public readonly message = 'HTTP Error' as const,
    public readonly status = 410 as const,
    public readonly title = 'Gone' as const,
  ) {
    super()
  }
}

class UserNotVerifiedError extends DomainError implements DomainErrorType {
  constructor(
    public detail: string,
    public readonly message = 'HTTP Error' as const,
    public readonly status = 403 as const,
    public readonly title = 'Forbidden' as const,
  ) {
    super()
  }
}

class MissingAuthCredentialsError
  extends DomainError
  implements DomainErrorType
{
  constructor(
    public detail: string = 'Required authentication cookies are missing.',
    public readonly message = 'HTTP Error' as const,
    public readonly status = 401 as const,
    public readonly title = 'Unauthorized' as const,
  ) {
    super()
  }
}

class InvalidAuthTokenError extends DomainError implements DomainErrorType {
  constructor(
    public detail: string = 'The provided authentication token is invalid or expired.',
    public readonly message = 'HTTP Error' as const,
    public readonly status = 401 as const,
    public readonly title = 'Unauthorized' as const,
  ) {
    super()
  }
}

class SessionBreachDetectedError
  extends DomainError
  implements DomainErrorType
{
  constructor(
    public detail: string = 'A security violation occurred. Please log in again.',
    public readonly message = 'HTTP Error' as const,
    public readonly status = 401 as const,
    public readonly title = 'Unauthorized' as const,
  ) {
    super()
  }
}

class SessionExpiredError extends DomainError implements DomainErrorType {
  constructor(
    public detail: string = 'Your session has expired. Please log in again.',
    public readonly message = 'HTTP Error' as const,
    public readonly status = 401 as const,
    public readonly title = 'Unauthorized' as const,
  ) {
    super()
  }
}

export {
  BadRequestError,
  InvalidUserFormCredentialsError,
  InvalidLoginCredentialsError,
  UserAlreadyExistsError,
  UnauthorizedUserError,
  TooManyAttemptsError,
  UserNotFoundError,
  OtpNotFoundError,
  UserNotVerifiedError,
  MissingAuthCredentialsError,
  InvalidAuthTokenError,
  SessionBreachDetectedError,
  SessionExpiredError,
}
