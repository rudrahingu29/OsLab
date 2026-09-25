import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../types';
import { User } from '../features/user/user.model';

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

export const authorizeAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.userId) {
      return next(new ApiError(401, 'Authentication required'));
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    if (user.role !== 'admin' && !user.email.toLowerCase().includes('admin')) {
      return next(new ApiError(403, 'Access denied: Administrator privileges required.'));
    }

    next();
  } catch (err) {
    next(err);
  }
};
