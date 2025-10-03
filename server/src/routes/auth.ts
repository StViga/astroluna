import express from 'express';
import { AuthController } from '../controllers/AuthController';
import { 
  authRateLimit, 
  registerRateLimit, 
  passwordResetRateLimit,
  apiRateLimit 
} from '../middleware/rateLimiting';
import { authenticate } from '../middleware/auth';

const router = express.Router();
const authController = new AuthController();

// Apply general API rate limiting to all auth routes
router.use(apiRateLimit);

// Public routes (no authentication required)

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 * @rateLimit 3 requests per hour per IP
 */
router.post('/register', registerRateLimit, (req, res) => 
  authController.register(req, res)
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return JWT tokens
 * @access  Public
 * @rateLimit 5 failed attempts per 15 minutes per IP
 */
router.post('/login', authRateLimit, (req, res) => 
  authController.login(req, res)
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 * @rateLimit 3 requests per 15 minutes per email/IP
 */
router.post('/forgot-password', passwordResetRateLimit, (req, res) => 
  authController.forgotPassword(req, res)
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using token
 * @access  Public
 * @rateLimit 3 requests per 15 minutes per IP
 */
router.post('/reset-password', passwordResetRateLimit, (req, res) => 
  authController.resetPassword(req, res)
);

/**
 * @route   GET /api/auth/verify-email
 * @desc    Verify email address using token
 * @access  Public
 */
router.get('/verify-email', (req, res) => 
  authController.verifyEmail(req, res)
);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email address using token (POST version for forms)
 * @access  Public
 */
router.post('/verify-email', (req, res) => 
  authController.verifyEmail(req, res)
);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token using refresh token
 * @access  Public (requires valid refresh token)
 * @rateLimit Standard API rate limiting
 */
router.post('/refresh-token', (req, res) => 
  authController.refreshToken(req, res)
);

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend email verification
 * @access  Public
 * @rateLimit Same as password reset
 */
router.post('/resend-verification', passwordResetRateLimit, (req, res) => 
  authController.resendVerification(req, res)
);

// Protected routes (require authentication)

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, (req, res) => 
  authController.getProfile(req, res)
);

/**
 * @route   PUT /api/auth/me
 * @desc    Update current user profile
 * @access  Private
 */
router.put('/me', authenticate, (req, res) => 
  authController.updateProfile(req, res)
);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 * @rateLimit Same as password reset for security
 */
router.post('/change-password', authenticate, passwordResetRateLimit, (req, res) => 
  authController.changePassword(req, res)
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and invalidate tokens
 * @access  Private
 */
router.post('/logout', authenticate, (req, res) => 
  authController.logout(req, res)
);

/**
 * @route   POST /api/auth/logout-all
 * @desc    Logout user from all devices
 * @access  Private
 */
router.post('/logout-all', authenticate, (req, res) => 
  authController.logoutAll(req, res)
);

/**
 * @route   DELETE /api/auth/delete-account
 * @desc    Delete user account (soft delete)
 * @access  Private
 * @rateLimit Limited to prevent accidental deletion
 */
router.delete('/delete-account', authenticate, passwordResetRateLimit, (req, res) => 
  authController.deleteAccount(req, res)
);

// Admin/Debug routes (should be protected with additional admin middleware in production)
if (process.env.NODE_ENV === 'development') {
  /**
   * @route   GET /api/auth/verify-token
   * @desc    Verify if token is valid (debug endpoint)
   * @access  Private
   */
  router.get('/verify-token', authenticate, (req, res) => {
    res.json({
      success: true,
      message: 'Token is valid',
      user: req.user
    });
  });

  /**
   * @route   GET /api/auth/sessions
   * @desc    Get all active sessions for current user (debug)
   * @access  Private
   */
  router.get('/sessions', authenticate, (req, res) => 
    authController.getUserSessions(req, res)
  );
}

// Health check route
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Auth service is healthy',
    timestamp: new Date().toISOString()
  });
});

export default router;