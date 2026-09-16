import { body } from 'express-validator';

export const validateCreateProcess = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Process name is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Process name must be between 1 and 50 characters'),

  body('burstTime')
    .isInt({ min: 1, max: 1000 })
    .withMessage('burstTime must be a positive integer between 1 and 1000'),

  body('priority')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('priority must be an integer between 1 and 20'),

  body(['userId', 'pid', 'createdAt', 'updatedAt', 'state', 'remainingTime']).custom(
    (value, { req, path }) => {
      if (req.body[path] !== undefined) {
        delete req.body[path];
      }
      return true;
    }
  ),
];

export const validateAllocateMemory = [
  body('pid')
    .isInt({ min: 1 })
    .withMessage('pid must be a positive integer'),

  body('size')
    .isInt({ min: 1, max: 1024 })
    .withMessage('size must be a positive integer between 1 and 1024 (MB)'),
];

export const validateFreeMemory = [
  body('pid')
    .isInt({ min: 1 })
    .withMessage('pid must be a positive integer'),
];

export const validateCreateFile = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('File name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('File name must be between 1 and 100 characters')
    .matches(/^[a-zA-Z0-9_\-\.\s]+$/)
    .withMessage('File name contains invalid characters'),

  body('content')
    .optional()
    .isString()
    .withMessage('content must be a string')
    .isLength({ max: 100000 })
    .withMessage('File content must not exceed 100,000 characters'),

  body(['userId', 'size', '_id', 'createdAt', 'updatedAt']).custom((value, { req, path }) => {
    if (req.body[path] !== undefined) {
      delete req.body[path];
    }
    return true;
  }),
];

export const validateUpdateFile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('File name must be between 1 and 100 characters')
    .matches(/^[a-zA-Z0-9_\-\.\s]+$/)
    .withMessage('File name contains invalid characters'),

  body('content')
    .optional()
    .isString()
    .withMessage('content must be a string')
    .isLength({ max: 100000 })
    .withMessage('File content must not exceed 100,000 characters'),

  body(['userId', 'size', '_id', 'createdAt', 'updatedAt']).custom((value, { req, path }) => {
    if (req.body[path] !== undefined) {
      delete req.body[path];
    }
    return true;
  }),
];
