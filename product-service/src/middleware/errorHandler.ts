import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../utils/validation";
import {
  ProductNotFoundError,
  DuplicateSKUError,
} from "../services/product.service";

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
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
  if (error instanceof ValidationError) {
    statusCode = 400;
  } else if (error instanceof ProductNotFoundError) {
    statusCode = 404;
  } else if (error instanceof DuplicateSKUError) {
    statusCode = 409;
  }

  // Log error for debugging
  console.error(
    `[${new Date().toISOString()}] ${error.name}: ${error.message}`
  );
  if (process.env.NODE_ENV === "development") {
    console.error(error.stack);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
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
    error: `Route ${req.originalUrl} not found`,
  });
};
