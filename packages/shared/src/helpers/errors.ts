export class EmailError extends Error {
  constructor(message: string) {
    super(message)
  }
}

export class ApiError extends Error {
  req?: string
  res: string
  badRequest: boolean
  constructor(message: string, res: string, req?: string, badRequest = false) {
    super(message)
    this.name = this.constructor.name
    this.req = req
    this.res = res
    this.badRequest = badRequest
  }
}

export class ApiErrorMessage extends Error {
  error: object
  constructor(error: object, message = 'Bad request') {
    super(message)
    this.name = this.constructor.name
    this.error = error
  }
}

export class WebhookError extends Error {
  meta?: Record<string, unknown>

  constructor(message: string, meta = {}) {
    super(message)
    this.name = this.constructor.name
    this.meta = meta
  }
}
