import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  error: ApiError | ZodError | Prisma.PrismaClientKnownRequestError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', error);

  // Zod validation errors
  if (error instanceof ZodError) {
    const validationErrors = error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));

    res.status(400).json({
      error: 'Validation failed',
      details: validationErrors,
    });
    return;
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        // Unique constraint violation
        const target = error.meta?.target as string[] | undefined;
        const field = target ? target[0] : 'field';
        res.status(409).json({
          error: 'Duplicate entry',
          message: `${field} already exists`,
          field,
        });
        return;

      case 'P2025':
        // Record not found
        res.status(404).json({
          error: 'Resource not found',
          message: 'The requested resource does not exist',
        });
        return;

      case 'P2003':
        // Foreign key constraint violation
        res.status(400).json({
          error: 'Invalid reference',
          message: 'Referenced resource does not exist',
        });
        return;

      case 'P2014':
        // Required relation violation
        res.status(400).json({
          error: 'Invalid relation',
          message: 'Required relation is missing',
        });
        return;

      default:
        res.status(500).json({
          error: 'Database error',
          message: 'An unexpected database error occurred',
          code: error.code,
        });
        return;
    }
  }

  // Custom API errors
  if (error.statusCode) {
    res.status(error.statusCode).json({
      error: error.message || 'An error occurred',
      code: error.code,
    });
    return;
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json({
      error: 'Invalid token',
      message: 'The provided token is invalid',
    });
    return;
  }

  if (error.name === 'TokenExpiredError') {
    res.status(401).json({
      error: 'Token expired',
      message: 'The provided token has expired',
    });
    return;
  }

  // Multer errors (file upload)
  if (error.name === 'MulterError') {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        res.status(400).json({
          error: 'File too large',
          message: 'The uploaded file exceeds the size limit',
        });
        return;
      case 'LIMIT_FILE_COUNT':
        res.status(400).json({
          error: 'Too many files',
          message: 'Too many files uploaded',
        });
        return;
      case 'LIMIT_UNEXPECTED_FILE':
        res.status(400).json({
          error: 'Unexpected file',
          message: 'Unexpected file field',
        });
        return;
      default:
        res.status(400).json({
          error: 'File upload error',
          message: error.message,
        });
        return;
    }
  }

  // Stripe errors
  if (error.name === 'StripeError') {
    res.status(400).json({
      error: 'Payment error',
      message: error.message,
      code: error.code,
    });
    return;
  }

  // Default error
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};

export const createError = (message: string, statusCode: number = 500, code?: string): ApiError => {
  const error = new Error(message) as ApiError;
  error.statusCode = statusCode;
  error.code = code;
  return error;
};

export const notFoundError = (resource: string = 'Resource'): ApiError => {
  return createError(`${resource} not found`, 404, 'NOT_FOUND');
};

export const unauthorizedError = (message: string = 'Unauthorized'): ApiError => {
  return createError(message, 401, 'UNAUTHORIZED');
};

export const forbiddenError = (message: string = 'Forbidden'): ApiError => {
  return createError(message, 403, 'FORBIDDEN');
};

export const validationError = (message: string = 'Validation failed'): ApiError => {
  return createError(message, 400, 'VALIDATION_ERROR');
};

export const conflictError = (message: string = 'Conflict'): ApiError => {
  return createError(message, 409, 'CONFLICT');
};