import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Validation middleware
type Middleware = (req: Request, res: Response, next: NextFunction) => void;

export const validate: Middleware = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
    return;
  }
  next();
};

// User registration validation
export const validateRegister = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  validate
];

// User login validation
export const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

// Message validation
export const validateMessage = [
  body('content').trim().notEmpty().withMessage('Message content is required'),
  body('receiverId').isMongoId().withMessage('Invalid receiver ID'),
  validate
];

// Group creation validation
export const validateGroup = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Group name must be between 1 and 50 characters'),
  body('members').isArray({ min: 1 }).withMessage('At least one member is required'),
  body('members.*').isMongoId().withMessage('Invalid member ID'),
  validate
]; 