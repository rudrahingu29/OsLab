import { body } from 'express-validator';
import { ALLOWED_TOPICS, TOPIC_ALIASES, normalizeTopic } from '../progress/progress.validation';

export const validateQuizSubmission = [
  body('answers')
    .isArray({ min: 1, max: 100 })
    .withMessage('answers must be a non-empty array of question responses'),

  body('answers.*.questionId')
    .isMongoId()
    .withMessage('questionId must be a valid MongoDB ObjectId'),

  body('answers.*.answer')
    .isInt({ min: 0 })
    .withMessage('answer must be a non-negative integer'),

  body('answers').custom((answers: any[]) => {
    if (Array.isArray(answers)) {
      const seenIds = new Set<string>();
      for (const item of answers) {
        if (item && item.questionId) {
          const idStr = String(item.questionId);
          if (seenIds.has(idStr)) {
            throw new Error(`Duplicate questionId "${idStr}" detected in submission`);
          }
          seenIds.add(idStr);
        }
      }
    }
    return true;
  }),

  // Strip client attempt to inject scores or statuses
  body(['score', 'percentage', 'passed', 'correct', 'maxScore', 'attemptId']).custom((value, { req, path }) => {
    if (req.body[path] !== undefined) {
      delete req.body[path];
    }
    return true;
  }),
];
