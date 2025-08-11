import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class ApiError extends Error implements AppError {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BulkOperationError extends ApiError {
  results: any;

  constructor(message: string, statusCode: number, results: any) {
    super(message, statusCode);
    this.name = 'BulkOperationError';
    this.results = results;
  }
}

export const globalErrorHandler = (
  error: AppError & { results?: any },
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';
  let additionalData = {};

  // Handle Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    statusCode = 400;
    message = 'Database operation failed';
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  // Handle JWT expired errors
  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Handle bulk operation errors
  if (error.name === 'BulkOperationError' && error.results) {
    additionalData = { results: error.results };
    // For bulk operations, we might want to return a partial success
    statusCode = 207; // Multi-Status
  }

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', error);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...additionalData,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};
