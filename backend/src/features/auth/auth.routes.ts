import { Router } from 'express';
import * as authController from './auth.controller';
import { validate } from '../../middleware/validate';
import { registerValidation, loginValidation } from './auth.validation';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.getMe);

export default router;

