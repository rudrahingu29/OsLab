import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../types';

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Authentication token missing or malformed'));
  }

  const token = authHeader.split(' ')[1]?.trim();
  if (!token) {
    return next(new ApiError(401, 'Authentication token missing'));
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
    if (!decoded || !decoded.userId) {
      return next(new ApiError(401, 'Invalid authentication token payload'));
    }
    req.user = { userId: decoded.userId };
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Authentication token has expired'));
    }
    return next(new ApiError(401, 'Invalid authentication token'));
  }
};

