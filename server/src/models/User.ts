import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import Database from '../config/database.js';

export interface UserData {
  id: number;
  email: string;
  password_hash?: string;
  full_name: string;
  phone?: string;
  language: string;
  currency: string;
  is_verified: boolean;
  email_verification_token?: string;
  password_reset_token?: string;
  password_reset_expires?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  language?: string;
  currency?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export class User {
  private db = Database;

  async create(userData: CreateUserData): Promise<UserData> {
    const { email, password, full_name, phone, language = 'en', currency = 'EUR' } = userData;
    
    // Hash password
    const password_hash = await bcrypt.hash(password, 10);
    
    // Generate verification token
    const email_verification_token = crypto.randomBytes(32).toString('hex');

    const query = `
      INSERT INTO users (email, password_hash, full_name, phone, language, currency, email_verification_token)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, email, full_name, phone, language, currency, is_verified, created_at, updated_at
    `;
    
    const result = await this.db.query(query, [
      email, password_hash, full_name, phone, language, currency, email_verification_token
    ]);

    // Create initial credits record
    await this.db.query(
      'INSERT INTO credits (user_id, balance) VALUES ($1, $2)',
      [result.rows[0].id, 0]
    );

    return result.rows[0];
  }

  async findByEmail(email: string): Promise<UserData | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await this.db.query(query, [email]);
    return result.rows[0] || null;
  }

  async findById(id: number): Promise<UserData | null> {
    const query = `
      SELECT id, email, full_name, phone, language, currency, is_verified, created_at, updated_at
      FROM users WHERE id = $1
    `;
    const result = await this.db.query(query, [id]);
    return result.rows[0] || null;
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async authenticate(credentials: LoginCredentials): Promise<UserData | null> {
    const user = await this.findByEmail(credentials.email);
    if (!user || !user.password_hash) return null;

    const isValid = await this.verifyPassword(credentials.password, user.password_hash);
    if (!isValid) return null;

    // Remove password hash from returned data
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword as UserData;
  }

  async verifyEmail(token: string): Promise<boolean> {
    const query = `
      UPDATE users 
      SET is_verified = TRUE, email_verification_token = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE email_verification_token = $1 AND is_verified = FALSE
      RETURNING id
    `;
    const result = await this.db.query(query, [token]);
    return result.rows.length > 0;
  }

  async generatePasswordResetToken(email: string): Promise<string | null> {
    const user = await this.findByEmail(email);
    if (!user) return null;

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    const query = `
      UPDATE users 
      SET password_reset_token = $1, password_reset_expires = $2, updated_at = CURRENT_TIMESTAMP
      WHERE email = $3
      RETURNING id
    `;
    
    const result = await this.db.query(query, [resetToken, resetExpires, email]);
    return result.rows.length > 0 ? resetToken : null;
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const query = `
      SELECT id FROM users 
      WHERE password_reset_token = $1 
      AND password_reset_expires > CURRENT_TIMESTAMP
    `;
    
    const result = await this.db.query(query, [token]);
    if (result.rows.length === 0) return false;

    const password_hash = await bcrypt.hash(newPassword, 10);
    
    const updateQuery = `
      UPDATE users 
      SET password_hash = $1, password_reset_token = NULL, password_reset_expires = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE password_reset_token = $2
    `;
    
    await this.db.query(updateQuery, [password_hash, token]);
    return true;
  }

  async updateProfile(id: number, updates: Partial<UserData>): Promise<UserData | null> {
    const allowedFields = ['full_name', 'phone', 'language', 'currency'];
    const fields = Object.keys(updates).filter(key => allowedFields.includes(key));
    
    if (fields.length === 0) return null;

    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const values = [id, ...fields.map(field => updates[field as keyof UserData])];

    const query = `
      UPDATE users 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, email, full_name, phone, language, currency, is_verified, created_at, updated_at
    `;

    const result = await this.db.query(query, values);
    return result.rows[0] || null;
  }

  async getCreditsBalance(userId: number): Promise<number> {
    const query = 'SELECT balance FROM credits WHERE user_id = $1';
    const result = await this.db.query(query, [userId]);
    return result.rows[0]?.balance || 0;
  }

  async updateCreditsBalance(userId: number, amount: number): Promise<number> {
    const query = `
      UPDATE credits 
      SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $2
      RETURNING balance
    `;
    const result = await this.db.query(query, [amount, userId]);
    return result.rows[0]?.balance || 0;
  }

  async deductCredits(userId: number, amount: number): Promise<{ success: boolean; newBalance: number }> {
    return await this.db.transaction(async (client) => {
      // Check current balance
      const balanceResult = await client.query('SELECT balance FROM credits WHERE user_id = $1', [userId]);
      const currentBalance = balanceResult.rows[0]?.balance || 0;

      if (currentBalance < amount) {
        return { success: false, newBalance: currentBalance };
      }

      // Deduct credits
      const updateResult = await client.query(
        'UPDATE credits SET balance = balance - $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 RETURNING balance',
        [amount, userId]
      );

      return { success: true, newBalance: updateResult.rows[0].balance };
    });
  }

  // Set email verification token
  async setEmailVerificationToken(userId: number, token: string): Promise<boolean> {
    try {
      const hashedToken = await bcrypt.hash(token, 10);
      const result = await this.db.query(
        'UPDATE users SET email_verification_token = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [hashedToken, userId]
      );
      return result.rowCount > 0;
    } catch (error) {
      logger.error('Error setting email verification token', { userId, error });
      return false;
    }
  }

  // Verify email with token
  async verifyEmailWithToken(token: string): Promise<UserData | null> {
    try {
      const result = await this.db.query(
        'SELECT id, email, full_name, language, email_verification_token FROM users WHERE email_verification_token IS NOT NULL'
      );

      for (const user of result.rows) {
        if (user.email_verification_token && await bcrypt.compare(token, user.email_verification_token)) {
          // Update user as verified and clear token
          const updateResult = await this.db.query(
            `UPDATE users 
             SET is_verified = true, 
                 email_verification_token = NULL, 
                 updated_at = CURRENT_TIMESTAMP 
             WHERE id = $1 
             RETURNING id, email, full_name, phone, language, currency, credits, is_verified, created_at, updated_at`,
            [user.id]
          );
          
          return updateResult.rows[0] as UserData;
        }
      }
      return null;
    } catch (error) {
      logger.error('Error verifying email with token', { error });
      return null;
    }
  }

  // Set password reset token
  async setPasswordResetToken(userId: number, token: string): Promise<boolean> {
    try {
      const hashedToken = await bcrypt.hash(token, 10);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      
      const result = await this.db.query(
        `UPDATE users 
         SET password_reset_token = $1, 
             password_reset_expires = $2, 
             updated_at = CURRENT_TIMESTAMP 
         WHERE id = $3`,
        [hashedToken, expiresAt, userId]
      );
      return result.rowCount > 0;
    } catch (error) {
      logger.error('Error setting password reset token', { userId, error });
      return false;
    }
  }

  // Reset password with token
  async resetPasswordWithToken(token: string, newPassword: string): Promise<boolean> {
    try {
      const result = await this.db.query(
        `SELECT id, password_reset_token, password_reset_expires 
         FROM users 
         WHERE password_reset_token IS NOT NULL 
         AND password_reset_expires > CURRENT_TIMESTAMP`
      );

      for (const user of result.rows) {
        if (user.password_reset_token && await bcrypt.compare(token, user.password_reset_token)) {
          const hashedPassword = await bcrypt.hash(newPassword, 12);
          
          const updateResult = await this.db.query(
            `UPDATE users 
             SET password_hash = $1, 
                 password_reset_token = NULL, 
                 password_reset_expires = NULL,
                 updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2`,
            [hashedPassword, user.id]
          );
          
          return updateResult.rowCount > 0;
        }
      }
      return false;
    } catch (error) {
      logger.error('Error resetting password with token', { error });
      return false;
    }
  }

  // Update password (for authenticated users)
  async updatePassword(userId: number, newPassword: string): Promise<boolean> {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      const result = await this.db.query(
        'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [hashedPassword, userId]
      );
      return result.rowCount > 0;
    } catch (error) {
      logger.error('Error updating password', { userId, error });
      return false;
    }
  }

  // Verify password for user
  async verifyPassword(userId: number, password: string): Promise<boolean> {
    try {
      const result = await this.db.query(
        'SELECT password_hash FROM users WHERE id = $1',
        [userId]
      );
      
      if (result.rows.length === 0) {
        return false;
      }

      return await bcrypt.compare(password, result.rows[0].password_hash);
    } catch (error) {
      logger.error('Error verifying password', { userId, error });
      return false;
    }
  }

  // Soft delete account
  async softDeleteAccount(userId: number): Promise<boolean> {
    try {
      const result = await this.db.query(
        `UPDATE users 
         SET email = CONCAT('deleted_', id, '_', email),
             password_hash = NULL,
             email_verification_token = NULL,
             password_reset_token = NULL,
             password_reset_expires = NULL,
             phone = NULL,
             updated_at = CURRENT_TIMESTAMP,
             deleted_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND deleted_at IS NULL`,
        [userId]
      );
      return result.rowCount > 0;
    } catch (error) {
      logger.error('Error soft deleting account', { userId, error });
      return false;
    }
  }

  // Update profile information
  async updateProfile(userId: number, updates: Partial<UserData>): Promise<UserData | null> {
    try {
      const allowedFields = ['full_name', 'phone', 'language', 'currency'];
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      for (const [field, value] of Object.entries(updates)) {
        if (allowedFields.includes(field) && value !== undefined) {
          updateFields.push(`${field} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      }

      if (updateFields.length === 0) {
        return await this.findById(userId);
      }

      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(userId);

      const query = `
        UPDATE users 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex} AND deleted_at IS NULL
        RETURNING id, email, full_name, phone, language, currency, credits, is_verified, created_at, updated_at
      `;

      const result = await this.db.query(query, values);
      return result.rows[0] as UserData || null;
    } catch (error) {
      logger.error('Error updating profile', { userId, updates, error });
      return null;
    }
  }

  // Check if user exists by email (for registration)
  async existsByEmail(email: string): Promise<boolean> {
    try {
      const result = await this.db.query(
        'SELECT 1 FROM users WHERE email = $1 AND deleted_at IS NULL LIMIT 1',
        [email.toLowerCase().trim()]
      );
      return result.rows.length > 0;
    } catch (error) {
      logger.error('Error checking if user exists by email', { email, error });
      return false;
    }
  }

  // Get user statistics
  async getUserStats(userId: number): Promise<any> {
    try {
      const [userStats, generationStats, creditStats] = await Promise.all([
        this.db.query(
          'SELECT created_at, last_login, is_verified FROM users WHERE id = $1',
          [userId]
        ),
        this.db.query(
          `SELECT 
             COUNT(*) as total_generations,
             COUNT(*) FILTER (WHERE created_at > CURRENT_DATE - INTERVAL '30 days') as generations_last_30_days,
             COUNT(*) FILTER (WHERE created_at > CURRENT_DATE - INTERVAL '7 days') as generations_last_7_days
           FROM generations WHERE user_id = $1`,
          [userId]
        ),
        this.db.query(
          `SELECT 
             SUM(CASE WHEN type = 'purchase' THEN amount ELSE 0 END) as total_purchased,
             SUM(CASE WHEN type = 'usage' THEN amount ELSE 0 END) as total_used
           FROM credit_transactions WHERE user_id = $1`,
          [userId]
        )
      ]);

      return {
        user: userStats.rows[0] || {},
        generations: generationStats.rows[0] || {},
        credits: creditStats.rows[0] || { total_purchased: 0, total_used: 0 }
      };
    } catch (error) {
      logger.error('Error getting user statistics', { userId, error });
      return {};
    }
  }
}