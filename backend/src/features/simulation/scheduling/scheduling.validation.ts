import { body } from 'express-validator';

export const validateProcesses = [
  body('processes')
    .isArray({ min: 1, max: 100 })
    .withMessage('processes must be an array containing between 1 and 100 process objects'),
  body('processes.*.pid')
    .exists()
    .withMessage('Each process must have a pid'),
  body('processes.*.arrivalTime')
    .isFloat({ min: 0 })
    .withMessage('arrivalTime must be a non-negative number'),
  body('processes.*.burstTime')
    .isFloat({ min: 0.0001 })
    .withMessage('burstTime must be a positive number greater than 0'),
  body('processes.*.priority')
    .optional()
    .isFloat()
    .withMessage('priority must be a valid number'),
  body('processes').custom((processes: any[]) => {
    if (!Array.isArray(processes)) return true;
    const pids = processes.map(p => String(p.pid));
    const uniquePids = new Set(pids);
    if (uniquePids.size !== pids.length) {
      throw new Error('Duplicate process IDs detected in processes array');
    }
    return true;
  }),
];

export const validateRoundRobin = [
  ...validateProcesses,
  body('timeQuantum')
    .isFloat({ min: 0.0001 })
    .withMessage('timeQuantum is required and must be a positive number greater than 0'),
];

export const validatePriority = [
  ...validateProcesses,
  body('isPreemptive')
    .optional()
    .isBoolean()
    .withMessage('isPreemptive must be a boolean'),
];
