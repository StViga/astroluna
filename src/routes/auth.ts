// Authentication routes for AstroLuna

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { CloudflareBindings } from '../types/database';
import { DatabaseService, generateToken, generateRandomToken } from '../utils/database';
import { MockDatabaseService } from '../utils/mock-database';

const auth = new Hono<{ Bindings: CloudflareBindings }>();

// Validation schemas
const signupSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(8, 'Phone number must be at least 8 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirm_password: z.string(),
  privacy_accepted: z.boolean().refine(val => val === true, 'You must accept privacy policy'),
  language: z.enum(['en', 'es', 'de']).optional(),
  currency: z.enum(['EUR', 'USD', 'GBP']).optional()
}).refine(data => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password']
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
});

const newPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  new_password: z.string().min(6, 'Password must be at least 6 characters'),
  confirm_password: z.string()
}).refine(data => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password']
});

// Helper function to get database service
async function getDbService(env: any) {
  if (env.DB) {
    try {
      // Test if database is properly set up by checking for users table
      await env.DB.prepare('SELECT COUNT(*) FROM users LIMIT 1').first();
      return new DatabaseService(env.DB);
    } catch (error) {
      console.log('D1 database not properly configured, using mock database:', error.message);
      await MockDatabaseService.initialize();
      return new MockDatabaseService();
    }
  } else {
    console.log('Using mock database (D1 not available)');
    await MockDatabaseService.initialize();
    return new MockDatabaseService();
  }
}

// Sign up route
auth.post('/signup', zValidator('json', signupSchema), async (c) => {
  try {
    const data = c.req.valid('json');
    const db = await getDbService(c.env);

    // Check if user already exists
    const existingUser = await db.getUserByEmail(data.email);
    if (existingUser) {
      return c.json({ error: 'User with this email already exists' }, 400);
    }

    // Create new user
    const user = await db.createUser({
      email: data.email,
      password: data.password,
      full_name: data.full_name,
      phone: data.phone,
      language: data.language || 'en',
      currency: data.currency || 'EUR'
    });

    // Generate JWT token
    const jwtSecret = c.env.JWT_SECRET || 'dev_secret_key_change_in_production';
    const token = generateToken(user.id, jwtSecret);

    // Return user data without password
    const { password_hash, ...userWithoutPassword } = user;

    return c.json({
      success: true,
      message: 'Account created successfully',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Registration failed. Please try again.' }, 500);
  }
});

// Login route
auth.post('/login', zValidator('json', loginSchema), async (c) => {
  try {
    const { email, password } = c.req.valid('json');
    const db = await getDbService(c.env);

    // Find user by email
    const user = await db.getUserByEmail(email);
    if (!user) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    // Verify password
    const isValidPassword = await db.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    // Generate JWT token
    const jwtSecret = c.env.JWT_SECRET || 'dev_secret_key_change_in_production';
    const token = generateToken(user.id, jwtSecret);

    // Get user credits
    const credits = await db.getUserCredits(user.id);

    // Return user data without password
    const { password_hash, ...userWithoutPassword } = user;

    return c.json({
      success: true,
      message: 'Login successful',
      user: userWithoutPassword,
      credits,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Login failed. Please try again.' }, 500);
  }
});

// Request password reset
auth.post('/reset-password', zValidator('json', resetPasswordSchema), async (c) => {
  try {
    const { email } = c.req.valid('json');
    const db = await getDbService(c.env);

    // Find user by email
    const user = await db.getUserByEmail(email);
    if (!user) {
      // Return success even if user doesn't exist for security
      return c.json({
        success: true,
        message: 'If this email exists, you will receive a password reset link'
      });
    }

    // Generate reset token
    const resetToken = generateRandomToken();
    const expiresAt = new Date(Date.now() + 3600000).toISOString(); // 1 hour from now

    // Store reset token
    await db.createResetToken(user.id, resetToken, expiresAt);

    // TODO: Send email with reset link
    // For now, we'll return the token in development
    const resetUrl = `${c.env.BASE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    console.log(`Password reset requested for ${email}`);
    console.log(`Reset URL: ${resetUrl}`);

    return c.json({
      success: true,
      message: 'If this email exists, you will receive a password reset link',
      // Remove this in production
      ...(c.env.NODE_ENV === 'development' && { reset_token: resetToken, reset_url: resetUrl })
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return c.json({ error: 'Password reset failed. Please try again.' }, 500);
  }
});

// Set new password
auth.post('/reset-password/confirm', zValidator('json', newPasswordSchema), async (c) => {
  try {
    const { token, new_password } = c.req.valid('json');
    const db = await getDbService(c.env);

    // Verify reset token
    const resetData = await db.verifyResetToken(token);
    if (!resetData) {
      return c.json({ error: 'Invalid or expired reset token' }, 400);
    }

    // Check if token is expired
    const now = new Date();
    const expiresAt = new Date(resetData.expires_at);
    if (now > expiresAt) {
      return c.json({ error: 'Reset token has expired' }, 400);
    }

    // Get user
    const user = await db.getUserById(resetData.user_id);
    if (!user) {
      return c.json({ error: 'User not found' }, 400);
    }

    // Update password
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(new_password, 10);
    
    await c.env.DB.prepare(`
      UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(hashedPassword, user.id).run();

    // Mark token as used
    await db.markResetTokenUsed(token);

    return c.json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Set new password error:', error);
    return c.json({ error: 'Password update failed. Please try again.' }, 500);
  }
});

// Get current user profile
auth.get('/profile', async (c) => {
  try {
    // Extract JWT token from Authorization header
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const jwtSecret = c.env.JWT_SECRET || 'dev_secret_key_change_in_production';
    
    // Verify token
    const jwt = await import('jsonwebtoken');
    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret) as { userId: number };
    } catch {
      return c.json({ error: 'Invalid or expired token' }, 401);
    }

    const db = await getDbService(c.env);
    const user = await db.getUserById(decoded.userId);
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Get user credits
    const credits = await db.getUserCredits(user.id);

    // Return user data without password
    const { password_hash, ...userWithoutPassword } = user;

    return c.json({
      success: true,
      user: userWithoutPassword,
      credits
    });

  } catch (error) {
    console.error('Profile error:', error);
    return c.json({ error: 'Failed to get profile' }, 500);
  }
});

export default auth;