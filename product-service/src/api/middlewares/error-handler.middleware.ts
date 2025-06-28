import { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class ValidationError extends Error implements AppError {
  statusCode = 400;
  isOperational = true;

  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends Error implements AppError {
  statusCode = 404;
  isOperational = true;

  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends Error implements AppError {
  statusCode = 409;
  isOperational = true;

  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal Server Error";

  // Handle specific error types
  if (error.name === "ValidationError") {
    statusCode = 400;
  } else if (error.name === "NotFoundError") {
    statusCode = 404;
  } else if (error.name === "ConflictError") {
    statusCode = 409;
  } else if (error.name === "PrismaClientKnownRequestError") {
    // Handle Prisma errors
    statusCode = 400;
    message = "Database operation failed";
  } else if (error.name === "PrismaClientValidationError") {
    statusCode = 400;
    message = "Invalid data provided";
  }

  // Log error in development
  if (process.env.NODE_ENV === "development") {
    console.error("Error:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
    });
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
};
