import { body } from 'express-validator';

export const saveExperimentValidation = [
  body('type')
    .trim()
    .notEmpty()
    .withMessage('Experiment type is required'),
  body('algorithm')
    .trim()
    .notEmpty()
    .withMessage('Algorithm name is required'),
  body('input')
    .isObject()
    .withMessage('input must be a valid object'),
  body('results')
    .isObject()
    .withMessage('results must be a valid object'),
  body(['userId', '_id', 'createdAt', 'updatedAt']).custom((value, { req, path }) => {
    if (req.body[path] !== undefined) {
      delete req.body[path]; // Strip forbidden fields automatically
    }
    return true;
  }),
];
