import { Router } from 'express';
import * as experimentController from './experiment.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { saveExperimentValidation } from './experiment.validation';

const router = Router();

router.use(authenticate);

router.post('/', saveExperimentValidation, validate, experimentController.saveExperiment);
router.get('/', experimentController.getExperiments);
router.get('/:id', experimentController.getExperimentById);
router.delete('/:id', experimentController.deleteExperiment);

export default router;
