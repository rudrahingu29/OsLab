import { Router } from 'express';
import * as userController from './user.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { updateProfileValidation, changePasswordValidation } from './user.validation';

const router = Router();

// Protect all user routes
router.use(authenticate);

router.get('/me', userController.getProfile);
router.patch('/me', updateProfileValidation, validate, userController.updateProfile);
router.patch('/me/password', changePasswordValidation, validate, userController.changePassword);
router.delete('/me', userController.deleteAccount);

export default router;
