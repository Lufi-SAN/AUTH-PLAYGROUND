export class DomainError extends Error {
  constructor(message = 'HTTP Error') {
    super(message)
  }
}
