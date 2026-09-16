import { body } from 'express-validator';

export const validateDiskSimulation = [
  body('diskSize')
    .isInt({ min: 2, max: 100000 })
    .withMessage('diskSize must be an integer greater than 1'),

  body('initialHead')
    .isInt({ min: 0 })
    .withMessage('initialHead must be a non-negative integer')
    .custom((initialHead: number, { req }) => {
      const diskSize = req.body.diskSize;
      if (typeof diskSize === 'number' && initialHead >= diskSize) {
        throw new Error(`initialHead must be strictly less than diskSize (${diskSize})`);
      }
      return true;
    }),

  body('requests')
    .isArray({ min: 1, max: 200 })
    .withMessage('requests must be a non-empty array containing between 1 and 200 cylinder requests'),

  body('requests.*')
    .isInt({ min: 0 })
    .withMessage('Each cylinder request must be a non-negative integer'),

  body('requests').custom((requests: any[], { req }) => {
    const diskSize = req.body.diskSize;
    if (Array.isArray(requests) && typeof diskSize === 'number') {
      const outOfBounds = requests.find((r: any) => typeof r === 'number' && (r < 0 || r >= diskSize));
      if (outOfBounds !== undefined) {
        throw new Error(`Cylinder request ${outOfBounds} is out of bounds (valid range: 0 to ${diskSize - 1})`);
      }
    }
    return true;
  }),

  body('direction')
    .optional()
    .isIn(['left', 'right'])
    .withMessage('direction must be either "left" or "right"'),
];

export const validateDirectionalDiskSimulation = [
  ...validateDiskSimulation,
  body('direction')
    .exists()
    .isIn(['left', 'right'])
    .withMessage('direction is required and must be either "left" or "right"'),
];
