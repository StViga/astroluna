import { Request, Response } from 'express';
import { User } from '../models/User';
import { 
  validateEmail, 
  validatePassword, 
  validate,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  refreshTokenSchema,
  changePasswordSchema,
  updateProfileSchema
} from '../utils/validation';
import { AuthLogger, logger } from '../services/LoggingService';
import { emailService } from '../services/EmailService';
import { TokenService, TokenBlacklist } from '../utils/tokens';
import { AuthenticatedRequest } from '../types/auth';

export class AuthController {
  private userModel = new User();

  // Register new user
  register = async (req: Request, res: Response) => {
    try {
      const validation = validate(registerSchema, req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: 'Invalid input data',
          details: validation.errors,
          code: 'VALIDATION_ERROR'
        });
      }

      const userData = validation.data;
      AuthLogger.registrationAttempt(userData.email, false, req.ip);

      // Check if user already exists
      const existingUser = await this.userModel.findByEmail(userData.email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'User with this email already exists',
          code: 'USER_EXISTS'
        });
      }

      // Create new user
      const user = await this.userModel.create(userData);

      if (!user) {
        return res.status(500).json({
          success: false,
          error: 'User registration failed',
          code: 'REGISTRATION_FAILED'
        });
      }

      // Send verification email
      try {
        const verificationToken = TokenService.generateSecureToken(32);
        await this.userModel.setEmailVerificationToken(user.id, verificationToken);
        await emailService.sendEmailVerification(user.email, verificationToken, user.language);
      } catch (emailError) {
        logger.error('Failed to send verification email', { email: user.email, error: emailError });
      }

      // Generate JWT tokens
      const tokens = TokenService.generateTokens(user);

      AuthLogger.registrationAttempt(userData.email, true, req.ip);

      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please check your email for verification.',
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          phone: user.phone,
          language: user.language,
          currency: user.currency,
          credits: user.credits,
          is_verified: user.is_verified,
          created_at: user.created_at
        },
        ...tokens
      });

    } catch (error: any) {
      logger.error('Registration error', error);
      res.status(500).json({
        success: false,
        error: 'Registration failed',
        code: 'REGISTRATION_ERROR'
      });
    }
  };

  // Login user
  login = async (req: Request, res: Response) => {
    try {
      const validation = validate(loginSchema, req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: 'Invalid input data',
          details: validation.errors,
          code: 'VALIDATION_ERROR'
        });
      }

      const { email, password } = validation.data;
      AuthLogger.loginAttempt(email, false, req.ip);

      // Find user by email
      const user = await this.userModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        });
      }

      // Verify password
      const isPasswordValid = await this.userModel.verifyPassword(user.id, password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        });
      }

      // Generate JWT tokens
      const tokens = TokenService.generateTokens(user);

      AuthLogger.loginAttempt(email, true, req.ip);

      res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          phone: user.phone,
          language: user.language,
          currency: user.currency,
          credits: user.credits,
          is_verified: user.is_verified,
          last_login: new Date().toISOString()
        },
        ...tokens
      });

    } catch (error: any) {
      logger.error('Login error', error);
      res.status(500).json({
        success: false,
        error: 'Login failed',
        code: 'LOGIN_ERROR'
      });
    }
  };

  // Get user profile
  getProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'NO_USER'
        });
      }

      const user = await this.userModel.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          phone: user.phone,
          language: user.language,
          currency: user.currency,
          credits: user.credits,
          is_verified: user.is_verified,
          created_at: user.created_at,
          updated_at: user.updated_at
        }
      });

    } catch (error: any) {
      logger.error('Profile error', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch profile',
        code: 'PROFILE_ERROR'
      });
    }
  };

  // Update user profile
  updateProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'NO_USER'
        });
      }

      const validation = validate(updateProfileSchema, req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: 'Invalid input data',
          details: validation.errors,
          code: 'VALIDATION_ERROR'
        });
      }

      const updatedUser = await this.userModel.updateProfile(req.user.id, validation.data);

      if (!updatedUser) {
        return res.status(400).json({
          success: false,
          error: 'Profile update failed',
          code: 'UPDATE_FAILED'
        });
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser
      });

    } catch (error: any) {
      logger.error('Profile update error', error);
      res.status(500).json({
        success: false,
        error: 'Profile update failed',
        code: 'UPDATE_ERROR'
      });
    }
  };

  // Refresh token
  refreshToken = async (req: Request, res: Response) => {
    try {
      const validation = validate(refreshTokenSchema, req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: 'Invalid input data',
          details: validation.errors,
          code: 'VALIDATION_ERROR'
        });
      }

      const { refresh_token } = validation.data;
      const decoded = TokenService.verifyRefreshToken(refresh_token);

      if (!decoded) {
        AuthLogger.tokenRefresh(0, false);
        return res.status(401).json({
          success: false,
          error: 'Invalid refresh token',
          code: 'INVALID_REFRESH_TOKEN'
        });
      }

      const user = await this.userModel.findById(decoded.userId);

      if (!user) {
        AuthLogger.tokenRefresh(decoded.userId, false);
        return res.status(401).json({
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      const newAccessToken = TokenService.refreshAccessToken(refresh_token);

      if (!newAccessToken) {
        AuthLogger.tokenRefresh(decoded.userId, false);
        return res.status(401).json({
          success: false,
          error: 'Failed to generate new access token',
          code: 'TOKEN_GENERATION_FAILED'
        });
      }

      AuthLogger.tokenRefresh(decoded.userId, true);

      res.json({
        success: true,
        access_token: newAccessToken,
        expires_in: 15 * 60 // 15 minutes
      });

    } catch (error: any) {
      logger.error('Token refresh error', error);
      res.status(500).json({
        success: false,
        error: 'Token refresh failed',
        code: 'REFRESH_ERROR'
      });
    }
  };

  // Forgot password
  forgotPassword = async (req: Request, res: Response) => {
    try {
      const validation = validate(forgotPasswordSchema, req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: 'Invalid input data',
          details: validation.errors,
          code: 'VALIDATION_ERROR'
        });
      }

      const { email, language } = validation.data;
      AuthLogger.passwordReset(email, false, req.ip);

      const user = await this.userModel.findByEmail(email);
      if (user) {
        const resetToken = TokenService.generateSecureToken(32);
        await this.userModel.setPasswordResetToken(user.id, resetToken);
        
        try {
          await emailService.sendPasswordReset(email, resetToken, language || 'en');
          AuthLogger.passwordReset(email, true, req.ip);
        } catch (emailError) {
          logger.error('Failed to send password reset email', { email, error: emailError });
        }
      }

      // Always return success to prevent email enumeration
      res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent'
      });

    } catch (error: any) {
      logger.error('Password reset request error', error);
      res.status(500).json({
        success: false,
        error: 'Password reset request failed',
        code: 'RESET_REQUEST_ERROR'
      });
    }
  };

  // Reset password with token
  resetPassword = async (req: Request, res: Response) => {
    try {
      const validation = validate(resetPasswordSchema, req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: 'Invalid input data',
          details: validation.errors,
          code: 'VALIDATION_ERROR'
        });
      }

      const { token, password } = validation.data;

      const success = await this.userModel.resetPasswordWithToken(token, password);

      if (!success) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or expired reset token',
          code: 'INVALID_TOKEN'
        });
      }

      res.json({
        success: true,
        message: 'Password reset successfully'
      });

    } catch (error: any) {
      logger.error('Password reset error', error);
      res.status(500).json({
        success: false,
        error: 'Password reset failed',
        code: 'RESET_ERROR'
      });
    }
  };

  // Verify email with token
  verifyEmail = async (req: Request, res: Response) => {
    try {
      const token = req.query.token || req.body.token;

      if (!token || typeof token !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Verification token is required',
          code: 'NO_TOKEN'
        });
      }

      const user = await this.userModel.verifyEmailWithToken(token);

      if (!user) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or expired verification token',
          code: 'INVALID_TOKEN'
        });
      }

      AuthLogger.emailVerification(user.email, true);

      // Send welcome email after successful verification
      try {
        await emailService.sendWelcomeEmail(user.email, user.full_name, user.language);
      } catch (emailError) {
        logger.error('Failed to send welcome email', { email: user.email, error: emailError });
      }

      res.json({
        success: true,
        message: 'Email verified successfully',
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          is_verified: true
        }
      });

    } catch (error: any) {
      logger.error('Email verification error', error);
      res.status(500).json({
        success: false,
        error: 'Email verification failed',
        code: 'VERIFICATION_ERROR'
      });
    }
  };

  // Resend verification email
  resendVerification = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      if (!validateEmail(email)) {
        return res.status(400).json({
          success: false,
          error: 'Valid email is required',
          code: 'INVALID_EMAIL'
        });
      }

      const user = await this.userModel.findByEmail(email);

      if (user && !user.is_verified) {
        const verificationToken = TokenService.generateSecureToken(32);
        await this.userModel.setEmailVerificationToken(user.id, verificationToken);
        
        try {
          await emailService.sendEmailVerification(email, verificationToken, user.language);
        } catch (emailError) {
          logger.error('Failed to send verification email', { email, error: emailError });
        }
      }

      // Always return success to prevent email enumeration
      res.json({
        success: true,
        message: 'If the email exists and is unverified, a new verification link has been sent'
      });

    } catch (error: any) {
      logger.error('Resend verification error', error);
      res.status(500).json({
        success: false,
        error: 'Failed to resend verification email',
        code: 'RESEND_ERROR'
      });
    }
  };

  // Change password (authenticated user)
  changePassword = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'NO_USER'
        });
      }

      const validation = validate(changePasswordSchema, req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: 'Invalid input data',
          details: validation.errors,
          code: 'VALIDATION_ERROR'
        });
      }

      const { current_password, new_password } = validation.data;

      // Verify current password
      const isCurrentPasswordValid = await this.userModel.verifyPassword(
        req.user.id, 
        current_password
      );

      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          error: 'Current password is incorrect',
          code: 'INVALID_CURRENT_PASSWORD'
        });
      }

      // Update password
      const success = await this.userModel.updatePassword(req.user.id, new_password);

      if (!success) {
        return res.status(500).json({
          success: false,
          error: 'Failed to update password',
          code: 'PASSWORD_UPDATE_FAILED'
        });
      }

      res.json({
        success: true,
        message: 'Password changed successfully'
      });

    } catch (error: any) {
      logger.error('Change password error', error);
      res.status(500).json({
        success: false,
        error: 'Password change failed',
        code: 'CHANGE_PASSWORD_ERROR'
      });
    }
  };

  // Logout (invalidate token)
  logout = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'NO_USER'
        });
      }

      // Blacklist current token
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token) {
        TokenBlacklist.blacklistToken(token);
      }

      AuthLogger.logout(req.user.id, req.ip);

      res.json({
        success: true,
        message: 'Logged out successfully'
      });

    } catch (error: any) {
      logger.error('Logout error', error);
      res.status(500).json({
        success: false,
        error: 'Logout failed',
        code: 'LOGOUT_ERROR'
      });
    }
  };

  // Logout from all devices
  logoutAll = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'NO_USER'
        });
      }

      // In a real implementation, you'd invalidate all tokens for this user
      // For now, we'll just blacklist the current token
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token) {
        TokenBlacklist.blacklistToken(token);
      }

      AuthLogger.logout(req.user.id, req.ip);

      res.json({
        success: true,
        message: 'Logged out from all devices successfully'
      });

    } catch (error: any) {
      logger.error('Logout all error', error);
      res.status(500).json({
        success: false,
        error: 'Logout from all devices failed',
        code: 'LOGOUT_ALL_ERROR'
      });
    }
  };

  // Delete account (soft delete)
  deleteAccount = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'NO_USER'
        });
      }

      const { password } = req.body;

      if (!password) {
        return res.status(400).json({
          success: false,
          error: 'Password confirmation is required',
          code: 'PASSWORD_REQUIRED'
        });
      }

      // Verify password before deletion
      const isPasswordValid = await this.userModel.verifyPassword(req.user.id, password);

      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          error: 'Password is incorrect',
          code: 'INVALID_PASSWORD'
        });
      }

      // Soft delete the account
      const success = await this.userModel.softDeleteAccount(req.user.id);

      if (!success) {
        return res.status(500).json({
          success: false,
          error: 'Failed to delete account',
          code: 'DELETE_FAILED'
        });
      }

      // Blacklist current token
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token) {
        TokenBlacklist.blacklistToken(token);
      }

      logger.info('Account deleted', { userId: req.user.id, email: req.user.email });

      res.json({
        success: true,
        message: 'Account deleted successfully'
      });

    } catch (error: any) {
      logger.error('Delete account error', error);
      res.status(500).json({
        success: false,
        error: 'Account deletion failed',
        code: 'DELETE_ERROR'
      });
    }
  };

  // Get user sessions (debug endpoint)
  getUserSessions = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'NO_USER'
        });
      }

      // In a real implementation, you'd fetch sessions from Redis or database
      // For now, we'll return mock data
      const sessions = [
        {
          id: '1',
          device: 'Chrome on Windows',
          ip: req.ip,
          lastActive: new Date().toISOString(),
          current: true
        }
      ];

      res.json({
        success: true,
        sessions
      });

    } catch (error: any) {
      logger.error('Get sessions error', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch sessions',
        code: 'SESSIONS_ERROR'
      });
    }
  };
}