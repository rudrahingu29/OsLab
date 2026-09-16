import { body } from 'express-validator';

export const validateMemoryAllocation = [
  body('blocks')
    .isArray({ min: 1, max: 100 })
    .withMessage('blocks must be an array containing between 1 and 100 block objects'),
  body('blocks.*.id')
    .exists()
    .withMessage('Each block must have an id'),
  body('blocks.*.size')
    .isFloat({ min: 0.0001 })
    .withMessage('Block size must be a positive number greater than 0'),
  body('blocks').custom((blocks: any[]) => {
    if (!Array.isArray(blocks)) return true;
    const ids = blocks.map(b => String(b.id));
    const uniqueIds = new Set(ids);
    if (uniqueIds.size !== ids.length) {
      throw new Error('Duplicate block IDs detected in blocks array');
    }
    return true;
  }),

  body('processes')
    .isArray({ min: 1, max: 100 })
    .withMessage('processes must be an array containing between 1 and 100 process objects'),
  body('processes.*.id')
    .exists()
    .withMessage('Each process must have an id'),
  body('processes.*.size')
    .isFloat({ min: 0.0001 })
    .withMessage('Process size must be a positive number greater than 0'),
  body('processes').custom((processes: any[]) => {
    if (!Array.isArray(processes)) return true;
    const ids = processes.map(p => String(p.id));
    const uniqueIds = new Set(ids);
    if (uniqueIds.size !== ids.length) {
      throw new Error('Duplicate process IDs detected in processes array');
    }
    return true;
  }),
];
