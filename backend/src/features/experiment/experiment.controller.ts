import { Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { Experiment } from './experiment.model';
import { AuthRequest } from '../../types';
import { ApiError } from '../../utils/ApiError';

export const saveExperiment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { type, algorithm, input, results } = req.body;
  const experiment = await Experiment.create({
    userId: req.user?.userId,
    type: type.trim(),
    algorithm: algorithm.trim(),
    input,
    results,
  });
  res.status(201).json(experiment);
});

export const getExperiments = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { type, algorithm, page, limit } = req.query;

  const query: any = { userId };

  if (type) {
    query.type = String(type).trim();
  }

  if (algorithm) {
    query.algorithm = String(algorithm).trim();
  }

  const isPaginated = page !== undefined || limit !== undefined;

  if (isPaginated) {
    const pageNum = Math.max(1, parseInt(String(page || '1'), 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit || '20'), 10)));
    const skip = (pageNum - 1) * limitNum;

    const [experiments, total] = await Promise.all([
      Experiment.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Experiment.countDocuments(query),
    ]);

    return res.json({
      success: true,
      data: experiments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  }

  // Default array response for backward compatibility
  const experiments = await Experiment.find(query).sort({ createdAt: -1 });
  res.json(experiments);
});

export const getExperimentById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  const experiment = await Experiment.findOne({ _id: req.params.id, userId });
  if (!experiment) {
    throw new ApiError(404, 'Experiment not found');
  }
  res.json(experiment);
});

export const deleteExperiment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  const experiment = await Experiment.findOneAndDelete({ _id: req.params.id, userId });
  if (!experiment) {
    throw new ApiError(404, 'Experiment not found');
  }
  res.json({ message: 'Experiment deleted' });
});
