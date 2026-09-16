import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { QuizService } from './quiz.service';
import { AuthRequest } from '../../types';

export const getQuestionsByTopic = asyncHandler(async (req: Request, res: Response) => {
  const topic = Array.isArray(req.params.topic) ? req.params.topic[0] : req.params.topic;
  const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 10;

  const result = await QuizService.getQuestionsByTopic(topic, limit);
  res.json({ success: true, data: result });
});

export const submitQuiz = asyncHandler(async (req: AuthRequest, res: Response) => {
  const topic = Array.isArray(req.params.topic) ? req.params.topic[0] : req.params.topic;
  const { answers } = req.body;
  const userId = req.user?.userId!;

  const result = await QuizService.gradeSubmission(userId, topic, answers);
  res.json({ success: true, data: result });
});

export const getQuizHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId!;
  const topic = req.query.topic ? String(req.query.topic) : undefined;
  const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
  const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 20;

  const result = await QuizService.getUserHistory(userId, topic, page, limit);
  res.json({ success: true, ...result });
});

export const getAttemptById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId!;
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const attempt = await QuizService.getAttemptById(userId, id);
  res.json({ success: true, data: attempt });
});
