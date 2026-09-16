import { Router } from 'express';
import * as progressController from './progress.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { updateProgressValidation } from './progress.validation';

const router = Router();

router.use(authenticate);

router.post('/', updateProgressValidation, validate, progressController.updateProgress);
router.get('/', progressController.getProgress);
router.get('/:topic', progressController.getProgressByTopic);

export default router;
