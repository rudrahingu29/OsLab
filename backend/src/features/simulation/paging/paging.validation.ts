import { body } from 'express-validator';

export const validatePagingSimulation = [
  body('referenceString')
    .isArray({ min: 1, max: 500 })
    .withMessage('referenceString must be an array containing between 1 and 500 page references'),
  body('referenceString.*')
    .exists()
    .withMessage('Each reference in referenceString must be valid'),
  body('frameCount')
    .isInt({ min: 1, max: 50 })
    .withMessage('frameCount must be a positive integer between 1 and 50'),
];
