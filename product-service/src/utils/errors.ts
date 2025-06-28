export class AppException extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppException {
  constructor(message: string) {
    super(message, 400);
  }
}

export class NotFoundError extends AppException {
  constructor(message: string) {
    super(message, 404);
  }
}

export class UnauthorizedError extends AppException {
  constructor(message: string = "Unauthorized") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppException {
  constructor(message: string = "Forbidden") {
    super(message, 403);
  }
}

export class ConflictError extends AppException {
  constructor(message: string) {
    super(message, 409);
  }
}

export class InternalServerError extends AppException {
  constructor(message: string = "Internal Server Error") {
    super(message, 500);
  }
}
