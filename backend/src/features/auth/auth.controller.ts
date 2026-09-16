import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as authService from './auth.service';
import { AuthRequest } from '../../types';
import { User } from '../user/user.model';
import { ApiError } from '../../utils/ApiError';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const result = await authService.registerUser(name, email, password);
  res.status(201).json(result);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.loginUser(email, password);
  res.json(result);
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user?.userId).select('-passwordHash');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  res.json(user);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.json({
    message: 'Logged out successfully. Please clear your authentication token on the client.',
  });
});

