import { Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { LearningProgress } from './progress.model';
import { AuthRequest } from '../../types';
import { normalizeTopic } from './progress.validation';

export const updateProgress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { topic, completionPercentage, progress, completedLessons, completedExperiments } = req.body;
  const userId = req.user?.userId;

  const normalizedTopic = normalizeTopic(topic);
  const targetPercentage = completionPercentage !== undefined ? Number(completionPercentage) : (progress !== undefined ? Number(progress) : 0);

  const updateFields: any = {
    lastAccessedAt: new Date(),
  };

  if (targetPercentage !== undefined && !isNaN(targetPercentage)) {
    updateFields.completionPercentage = targetPercentage;
  }

  if (Array.isArray(completedLessons)) {
    updateFields.$addToSet = { completedLessons: { $each: completedLessons } };
  }

  if (Array.isArray(completedExperiments)) {
    if (!updateFields.$addToSet) updateFields.$addToSet = {};
    updateFields.$addToSet.completedExperiments = { $each: completedExperiments };
  }

  const learningProgress = await LearningProgress.findOneAndUpdate(
    { userId, topic: normalizedTopic },
    updateFields,
    { new: true, upsert: true, runValidators: true }
  );

  res.json(learningProgress);
});

export const getProgress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const progressList = await LearningProgress.find({ userId }).sort({ updatedAt: -1 });
  res.json(progressList);
});

export const getProgressByTopic = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const rawTopic = Array.isArray(req.params.topic) ? req.params.topic[0] : req.params.topic;
  const normalizedTopic = normalizeTopic(rawTopic);

  let progress = await LearningProgress.findOne({ userId, topic: normalizedTopic });

  if (!progress) {
    progress = new LearningProgress({
      userId,
      topic: normalizedTopic,
      completionPercentage: 0,
      completedLessons: [],
      completedExperiments: [],
      bestQuizPercentage: 0,
      quizCompleted: false,
    });
  }

  res.json(progress);
});
