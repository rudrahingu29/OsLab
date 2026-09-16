import { Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { DashboardService } from './dashboard.service';
import { AuthRequest } from '../../types';

export const getDashboard = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId!;
  const data = await DashboardService.getDashboardData(userId);
  res.json({ success: true, data });
});
