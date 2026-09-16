import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { asyncHandler } from '../../utils/asyncHandler';
import { User } from './user.model';
import { Experiment } from '../experiment/experiment.model';
import { LearningProgress } from '../progress/progress.model';
import { AuthRequest } from '../../types';
import { ApiError } from '../../utils/ApiError';

export const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user?.userId).select('-passwordHash');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  res.json(user);
});

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name } = req.body;

  const user = await User.findById(req.user?.userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (name !== undefined) {
    user.name = name.trim();
  }

  await user.save();

  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  });
});

export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user?.userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    throw new ApiError(400, 'Current password is incorrect');
  }

  const salt = await bcrypt.genSalt(12);
  user.passwordHash = await bcrypt.hash(newPassword, salt);
  await user.save();

  res.json({ message: 'Password updated successfully' });
});

export const deleteAccount = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Cascading cleanup of user-owned records
  await Experiment.deleteMany({ userId });
  await LearningProgress.deleteMany({ userId });
  await User.findByIdAndDelete(userId);

  res.json({ message: 'Account and associated data deleted successfully' });
});
