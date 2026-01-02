import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface AppError extends Error {
  status?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  logger.error('Error occurred', {
    status,
    message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  res.status(status).json({
    error: {
      message,
      status,
      path: req.path,
      timestamp: new Date().toISOString()
    }
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: {
      message: 'Resource not found',
      status: 404,
      path: req.path,
      timestamp: new Date().toISOString()
    }
  });
};
