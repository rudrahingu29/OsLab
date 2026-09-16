import { body } from 'express-validator';

export const updateProfileValidation = [
  body('name').trim().notEmpty().withMessage('Name cannot be empty'),
];

export const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
];
