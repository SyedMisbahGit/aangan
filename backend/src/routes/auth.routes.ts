import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import { authService } from '../services/auth.service';
import { BadRequestError } from '../utils/errors';
import { requireAuth } from '../middleware/auth';
import { wrapAsync } from '../utils/asyncHandler';
import logger from '../utils/logger';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               name:
 *                 type: string
 *                 minLength: 2
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 expiresIn:
 *                   type: number
 *                 tokenType:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       409:
 *         description: Email already in use
 */
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('name').trim().isLength({ min: 2 }),
  ],
  validateRequest,
  wrapAsync(async (req, res) => {
    const { email, password, name } = req.body;
    const tokens = await authService.register(email, password, name);
    res.status(201).json(tokens);
  })
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 expiresIn:
 *                   type: number
 *                 tokenType:
 *                   type: string
 *       401:
 *         description: Invalid credentials or email not verified
 */
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  validateRequest,
  wrapAsync(async (req, res) => {
    const { email, password } = req.body;
    const tokens = await authService.login(email, password);
    res.json(tokens);
  })
);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 expiresIn:
 *                   type: number
 *                 tokenType:
 *                   type: string
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post(
  '/refresh',
  [
    body('refreshToken').notEmpty(),
  ],
  validateRequest,
  wrapAsync(async (req, res) => {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshToken(refreshToken);
    res.json(tokens);
  })
);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout and revoke refresh token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       204:
 *         description: Logout successful
 *       401:
 *         description: Not authenticated or invalid token
 */
router.post(
  '/logout',
  requireAuth,
  [
    body('refreshToken').notEmpty(),
  ],
  validateRequest,
  wrapAsync(async (req, res) => {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    res.status(204).end();
  })
);

/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: Verify email with verification token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired token
 */
router.post(
  '/verify-email',
  [
    body('token').notEmpty(),
  ],
  validateRequest,
  wrapAsync(async (req, res) => {
    const { token } = req.body;
    await authService.verifyEmail(token);
    res.json({ message: 'Email verified successfully' });
  })
);

/**
 * @swagger
 * /api/auth/resend-verification:
 *   post:
 *     summary: Resend verification email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Verification email sent if the email exists
 */
router.post(
  '/resend-verification',
  [
    body('email').isEmail().normalizeEmail(),
  ],
  validateRequest,
  wrapAsync(async (req, res) => {
    const { email } = req.body;
    
    // Check if user exists and email is not verified
    const user = await req.db('users')
      .where({ email, email_verified: false })
      .first();

    if (user) {
      // Generate new verification token
      const verificationToken = jwt.sign(
        { userId: user.id, email: user.email, purpose: 'email_verification' },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      // Send verification email
      await sendEmail({
        to: email,
        subject: 'Verify your email',
        template: 'verify-email',
        data: {
          name: user.name,
          verificationUrl: `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`,
        },
      });
    }

    // Always return success to prevent email enumeration
    res.json({ message: 'If your email is registered and not verified, you will receive a verification email' });
  })
);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset email sent if the email exists
 */
router.post(
  '/forgot-password',
  [
    body('email').isEmail().normalizeEmail(),
  ],
  validateRequest,
  wrapAsync(async (req, res) => {
    const { email } = req.body;
    await authService.requestPasswordReset(email);
    res.json({ message: 'If your email is registered, you will receive a password reset link' });
  })
);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password with reset token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 */
router.post(
  '/reset-password',
  [
    body('token').notEmpty(),
    body('newPassword').isLength({ min: 8 }),
  ],
  validateRequest,
  wrapAsync(async (req, res) => {
    const { token, newPassword } = req.body;
    await authService.resetPassword(token, newPassword);
    res.json({ message: 'Password reset successfully' });
  })
);

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Authenticate with Google
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *                 description: Google ID token
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 expiresIn:
 *                   type: number
 *                 tokenType:
 *                   type: string
 *       400:
 *         description: Invalid Google token
 */
router.post(
  '/google',
  [
    body('idToken').notEmpty(),
  ],
  validateRequest,
  wrapAsync(async (req, res) => {
    const { idToken } = req.body;
    const tokens = await authService.authenticateWithGoogle(idToken);
    res.json(tokens);
  })
);

/**
 * @swagger
 * /api/auth/facebook:
 *   get:
 *     summary: Initiate Facebook OAuth flow
 *     tags: [Auth]
 *     description: Redirects to Facebook for authentication
 *     responses:
 *       302:
 *         description: Redirect to Facebook
 */
router.get(
  '/facebook',
  (req, res, next) => {
    const strategy = authService.getFacebookStrategy();
    if (!strategy) {
      return next(new Error('Facebook OAuth is not configured'));
    }
    
    // Store the return URL in the session if provided
    if (req.query.returnTo) {
      req.session.returnTo = req.query.returnTo;
    }
    
    // Initialize the Facebook strategy
    const passport = require('passport');
    passport.authenticate('facebook', { scope: ['email'] })(req, res, next);
  }
);

/**
 * @swagger
 * /api/auth/facebook/callback:
 *   get:
 *     summary: Facebook OAuth callback
 *     tags: [Auth]
 *     description: Callback URL for Facebook OAuth
 *     responses:
 *       302:
 *         description: Redirect to the frontend with tokens or error
 */
router.get(
  '/facebook/callback',
  (req, res, next) => {
    const passport = require('passport');
    
    passport.authenticate('facebook', { session: false, failureRedirect: '/login?error=facebook_auth_failed' },
      (err: any, user: any, info: any) => {
        if (err) {
          logger.error('Facebook auth error:', err);
          return res.redirect(`${process.env.FRONTEND_URL}/login?error=facebook_auth_failed`);
        }
        
        if (!user) {
          return res.redirect(`${process.env.FRONTEND_URL}/login?error=facebook_auth_failed`);
        }
        
        // Generate tokens
        const tokens = authService.generateTokens(user.id, user.email, user.role);
        
        // Store the refresh token
        authService.storeRefreshToken(user.id, tokens.tokenId, tokens.refreshToken)
          .catch(error => {
            logger.error('Error storing refresh token:', error);
          });
        
        // Redirect to frontend with tokens
        const returnTo = req.session.returnTo || '/';
        delete req.session.returnTo;
        
        const redirectUrl = new URL(`${process.env.FRONTEND_URL}${returnTo}`);
        redirectUrl.searchParams.set('access_token', tokens.accessToken);
        redirectUrl.searchParams.set('refresh_token', tokens.refreshToken);
        redirectUrl.searchParams.set('expires_in', tokens.expiresIn.toString());
        redirectUrl.searchParams.set('token_type', tokens.tokenType);
        
        res.redirect(redirectUrl.toString());
      }
    )(req, res, next);
  }
);

/**
 * @swagger
 * /api/auth/apple:
 *   get:
 *     summary: Initiate Apple OAuth flow
 *     tags: [Auth]
 *     description: Redirects to Apple for authentication
 *     responses:
 *       302:
 *         description: Redirect to Apple
 */
router.get(
  '/apple',
  (req, res, next) => {
    const strategy = authService.getAppleStrategy();
    if (!strategy) {
      return next(new Error('Apple OAuth is not configured'));
    }
    
    // Store the return URL in the session if provided
    if (req.query.returnTo) {
      req.session.returnTo = req.query.returnTo;
    }
    
    // Initialize the Apple strategy
    const passport = require('passport');
    passport.authenticate('apple', { scope: ['email', 'name'] })(req, res, next);
  }
);

/**
 * @swagger
 * /api/auth/apple/callback:
 *   post:
 *     summary: Apple OAuth callback
 *     tags: [Auth]
 *     description: Callback URL for Apple OAuth
 *     responses:
 *       302:
 *         description: Redirect to the frontend with tokens or error
 */
router.post(
  '/apple/callback',
  (req, res, next) => {
    const passport = require('passport');
    
    passport.authenticate('apple', { session: false, failureRedirect: '/login?error=apple_auth_failed' },
      (err: any, user: any, info: any) => {
        if (err) {
          logger.error('Apple auth error:', err);
          return res.redirect(`${process.env.FRONTEND_URL}/login?error=apple_auth_failed`);
        }
        
        if (!user) {
          return res.redirect(`${process.env.FRONTEND_URL}/login?error=apple_auth_failed`);
        }
        
        // Generate tokens
        const tokens = authService.generateTokens(user.id, user.email, user.role);
        
        // Store the refresh token
        authService.storeRefreshToken(user.id, tokens.tokenId, tokens.refreshToken)
          .catch(error => {
            logger.error('Error storing refresh token:', error);
          });
        
        // Redirect to frontend with tokens
        const returnTo = req.session.returnTo || '/';
        delete req.session.returnTo;
        
        const redirectUrl = new URL(`${process.env.FRONTEND_URL}${returnTo}`);
        redirectUrl.searchParams.set('access_token', tokens.accessToken);
        redirectUrl.searchParams.set('refresh_token', tokens.refreshToken);
        redirectUrl.searchParams.set('expires_in', tokens.expiresIn.toString());
        redirectUrl.searchParams.set('token_type', tokens.tokenType);
        
        res.redirect(redirectUrl.toString());
      }
    )(req, res, next);
  }
);

export default router;
