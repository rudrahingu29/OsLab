import { body } from 'express-validator';

export const CANONICAL_TOPICS = [
  'foundations',
  'process-management',
  'cpu-scheduling',
  'process-synchronization',
  'deadlocks',
  'memory-management',
  'page-replacement',
  'disk-scheduling',
];

export const ALLOWED_TOPICS = [
  'foundations',
  'process-management',
  'cpu-scheduling',
  'processes-cpu',
  'process-synchronization',
  'deadlocks',
  'synchronization-deadlocks',
  'memory-management',
  'page-replacement',
  'storage-disk',
  'disk-scheduling',
  'file-systems',
  'security-virtualization',
  'security-protection',
  'final-exam',
];

export const TOPIC_ALIASES: Record<string, string> = {
  'intro-to-os': 'foundations',
  'hardware-architecture': 'foundations',
  'user-vs-kernel-mode': 'foundations',
  'system-calls': 'foundations',
  'module-1': 'foundations',
  'what-does-an-os-do': 'process-management',
  'processes': 'process-management',
  'process-lifecycle': 'process-management',
  'process-states': 'process-management',
  'threads-multithreading': 'process-management',
  'inter-process-communication': 'process-management',
  'module-2': 'processes-cpu',
  'synchronization-race-conditions': 'process-synchronization',
  'semaphores-mutexes': 'process-synchronization',
  'module-3': 'synchronization-deadlocks',
  'paging-segmentation': 'memory-management',
  'virtual-memory': 'page-replacement',
  'module-4': 'memory-management',
  'disk-management': 'disk-scheduling',
  'io-management': 'disk-scheduling',
  'module-5': 'storage-disk',
  'virtualization-containers': 'security-virtualization',
  'module-6': 'security-virtualization',
  'certification-exam': 'final-exam',
  'os-master-exam': 'final-exam',
};

export const normalizeTopic = (topic: string): string => {
  if (!topic || typeof topic !== 'string') return '';
  const trimmed = topic.trim().toLowerCase();
  return TOPIC_ALIASES[trimmed] || trimmed;
};

export const updateProgressValidation = [
  body('topic')
    .trim()
    .notEmpty()
    .withMessage('Topic is required')
    .custom((value: string) => {
      const normalized = normalizeTopic(value);
      if (!ALLOWED_TOPICS.includes(normalized)) {
        throw new Error(`Invalid topic. Allowed topics: ${ALLOWED_TOPICS.join(', ')}`);
      }
      return true;
    }),

  body(['completionPercentage', 'progress'])
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('completionPercentage must be a number between 0 and 100'),

  body('completedLessons')
    .optional()
    .isArray()
    .withMessage('completedLessons must be an array of strings'),

  body('completedExperiments')
    .optional()
    .isArray()
    .withMessage('completedExperiments must be an array of strings'),

  body('userId').custom((value, { req }) => {
    if (req.body.userId !== undefined) {
      delete req.body.userId; // Automatically strip userId from client payload
    }
    return true;
  }),
];
