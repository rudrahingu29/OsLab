import { Router } from 'express';
import * as quizController from './quiz.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { validateQuizSubmission } from './quiz.validation';

const router = Router();

// Apply authentication to all quiz routes
router.use(authenticate);

// IMPORTANT ROUTE ORDER:
// 1. /history
// 2. /attempts/:id
// 3. /:topic
// 4. /:topic/submit

router.get('/history', quizController.getQuizHistory);
router.get('/attempts/:id', quizController.getAttemptById);
router.get('/:topic', quizController.getQuestionsByTopic);
router.post('/:topic/submit', validateQuizSubmission, validate, quizController.submitQuiz);

export default router;
