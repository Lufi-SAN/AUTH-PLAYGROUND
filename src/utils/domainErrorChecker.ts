import { DomainError } from '../errors/BaseDomainError.js'
import type { DomainErrorType } from '../types/user.types.js'

export function isDomainError(errorObject: DomainErrorType) {
  return (
    typeof errorObject === 'object' &&
    errorObject !== null &&
    errorObject instanceof DomainError
  )
}
