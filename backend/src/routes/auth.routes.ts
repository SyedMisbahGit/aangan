import { Router, Request, Response, NextFunction } from 'express';
import { body, query, validationResult, ValidationChain } from 'express-validator';
import { authService } from '../services/auth.service.js';
import { BadRequestError } from '../utils/errors.js';

const router = Router();

// Input validation middleware
const validate = (validations: ValidationChain[]) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await Promise.all(validations.map(validation => (validation as any).run(req)));
      const errors = validationResult(req);
      if (errors.isEmpty()) {
        return next();
      }
      
      // Format errors in a way that matches our error handler's expectations
      const errorMap: Record<string, string[]> = {};
      errors.array().forEach((err: any) => {
        if (!errorMap[err.param]) {
          errorMap[err.param] = [];
        }
        errorMap[err.param].push(err.msg);
      });
      
      // Create a BadRequestError with the validation errors
      const error = new BadRequestError('Validation failed', 'VALIDATION_ERROR', { 
        details: Object.entries(errorMap).map(([param, messages]) => ({
          param,
          messages,
          location: 'body',
          type: 'field'
        }))
      });
      
      // Ensure the error has a status code
      error.statusCode = 400;
      throw error;
    } catch (error) {
      next(error);
    }
  };
};

// Basic health check route
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Register a new user
router.post(
  '/register',
  validate([
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').trim().isLength({ min: 1 }),
  ]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, name } = req.body;
      const tokens = await authService.register(email, password, name);
      res.status(201).json(tokens);
    } catch (error) {
      next(error);
    }
  }
);

// Login with email and password
router.post(
  '/login',
  validate([
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 1 }),
  ]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const tokens = await authService.login(email, password);
      res.json(tokens);
    } catch (error) {
      next(error);
    }
  }
);

// Refresh access token
router.post(
  '/refresh',
  validate([
    body('refreshToken').isLength({ min: 1 }),
  ]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      const tokens = await authService.refreshToken(refreshToken);
      res.json(tokens);
    } catch (error) {
      next(error);
    }
  }
);

// Logout
router.post(
  '/logout',
  validate([
    body('refreshToken').isLength({ min: 1 }),
  ]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      await authService.logout(refreshToken);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

// Request password reset
router.post(
  '/forgot-password',
  validate([
    body('email').isEmail().normalizeEmail(),
  ]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      await authService.requestPasswordReset(email);
      res.status(202).json({ message: 'Password reset email sent if account exists' });
    } catch (error) {
      next(error);
    }
  }
);

// Reset password with token
router.post(
  '/reset-password',
  validate([
    body('token').isLength({ min: 1 }),
    body('newPassword').isLength({ min: 6 }),
  ]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, newPassword } = req.body;
      await authService.resetPassword(token, newPassword);
      res.json({ message: 'Password has been reset successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// Verify email with token
router.get(
  '/verify-email',
  validate([
    query('token').isLength({ min: 1 }),
  ]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.query; // Correctly get the token from the query parameters
      if (typeof token !== 'string') {
        throw new BadRequestError('Invalid token', 'INVALID_TOKEN');
      }
      await authService.verifyEmail(token);
      res.json({ message: 'Email verified successfully' });
    } catch (error) {
      next(error);
    }
  }
);

export default router;