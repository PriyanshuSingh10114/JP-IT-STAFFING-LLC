/**
 * Authentication Routes
 * Handles user registration, login, and profile management
 */

const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const AuthService = require('../services/AuthService');
const authMiddleware = require('../middleware/authMiddleware');
const validationHandler = require('../middleware/validationHandler');
const logger = require('../utils/logger');

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty(),
  ],
  validationHandler,
  async (req, res, next) => {
    try {
      const result = await AuthService.registerUser(req.body);
      res.status(201).json(result);
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/**
 * POST /api/auth/login
 * Login user
 */
router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  validationHandler,
  async (req, res, next) => {
    try {
      const result = await AuthService.loginUser(req.body.email, req.body.password);
      res.status(200).json(result);
    } catch (error) {
      logger.error('Login error:', error);
      res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/**
 * GET /api/auth/profile
 * Get user profile
 */
router.get('/profile', authMiddleware, async (req, res, next) => {
  try {
    const user = await AuthService.getUserProfile(req.userId);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    logger.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put('/profile', authMiddleware, async (req, res, next) => {
  try {
    const user = await AuthService.updateUserProfile(req.userId, req.body);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    logger.error('Error updating profile:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * POST /api/auth/change-password
 * Change password
 */
router.post(
  '/change-password',
  authMiddleware,
  [
    body('oldPassword').notEmpty(),
    body('newPassword').isLength({ min: 8 }),
    body('confirmPassword').custom((value, { req }) => value === req.body.newPassword),
  ],
  validationHandler,
  async (req, res, next) => {
    try {
      const result = await AuthService.changePassword(req.userId, req.body.oldPassword, req.body.newPassword);
      res.status(200).json(result);
    } catch (error) {
      logger.error('Error changing password:', error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/**
 * POST /api/auth/linkedin-credentials
 * Update LinkedIn credentials
 */
router.post('/linkedin-credentials', authMiddleware, async (req, res, next) => {
  try {
    const result = await AuthService.updateLinkedInCredentials(
      req.userId,
      req.body.linkedinEmail,
      req.body.linkedinPassword
    );
    res.status(200).json(result);
  } catch (error) {
    logger.error('Error updating LinkedIn credentials:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * POST /api/auth/gmail-refresh-token
 * Update Gmail refresh token
 */
router.post('/gmail-refresh-token', authMiddleware, async (req, res, next) => {
  try {
    const result = await AuthService.updateGmailRefreshToken(req.userId, req.body.refreshToken);
    res.status(200).json(result);
  } catch (error) {
    logger.error('Error updating Gmail token:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * POST /api/auth/api-keys
 * Update API keys
 */
router.post('/api-keys', authMiddleware, async (req, res, next) => {
  try {
    const result = await AuthService.updateApiKeys(req.userId, req.body);
    res.status(200).json(result);
  } catch (error) {
    logger.error('Error updating API keys:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user (handled client-side)
 */
router.post('/logout', authMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

module.exports = router;
