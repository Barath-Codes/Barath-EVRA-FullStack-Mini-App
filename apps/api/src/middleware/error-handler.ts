import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

/**
 * Custom application error with HTTP status code.
 */
export class AppError extends Error {
  public readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

/**
 * Global error handling middleware.
 * Catches AppError, ZodError, and unexpected errors,
 * returning structured { error, message } responses.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Zod validation errors - 400
  if (err instanceof ZodError) {
    const messages = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: messages,
    });
    return;
  }

  // Known application errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
    });
    return;
  }

  // Unexpected errors - 500
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
  });
}
