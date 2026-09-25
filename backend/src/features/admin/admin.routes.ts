import { Router } from 'express';
import * as adminController from './admin.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Protect all admin endpoints with authentication
router.use(authenticate);

// Platform & telemetry stats
router.get('/stats', adminController.getStats);
router.get('/labs/stats', adminController.getLabs);

// Users management
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.patch('/users/:id/role', adminController.updateRole);
router.patch('/users/:id/status', adminController.toggleStatus);
router.post('/users/:id/reset-progress', adminController.resetProgress);
router.delete('/users/:id', adminController.deleteUser);

// Quiz CMS
router.get('/quizzes/questions', adminController.getQuestions);
router.post('/quizzes/questions', adminController.createQuestion);
router.delete('/quizzes/questions/:id', adminController.deleteQuestion);

// Broadcasts / Announcements
router.get('/announcements', adminController.getAnnouncements);
router.post('/announcements', adminController.createAnnouncement);
router.patch('/announcements/:id/toggle', adminController.toggleAnnouncement);
router.delete('/announcements/:id', adminController.deleteAnnouncement);

export default router;
