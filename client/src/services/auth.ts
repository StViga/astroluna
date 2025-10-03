import ApiService from './api';
import {
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  ForgotPasswordData,
  ResetPasswordData,
  ChangePasswordData,
  UpdateProfileData,
  ApiResponse,
  UserSession,
  SessionResponse
} from '@/types/auth';

class AuthService {
  // Register new user
  static async register(data: RegisterData): Promise<AuthResponse> {
    const response = await ApiService.post<User>('/auth/register', data);
    
    if (!response.success) {
      throw new Error(response.error || 'Registration failed');
    }
    
    // The response should include user and tokens
    return response as unknown as AuthResponse;
  }

  // Login user
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await ApiService.post<User>('/auth/login', credentials);
    
    if (!response.success) {
      throw new Error(response.error || 'Login failed');
    }
    
    return response as unknown as AuthResponse;
  }

  // Logout user
  static async logout(): Promise<void> {
    try {
      await ApiService.post('/auth/logout');
    } catch (error) {
      // Even if logout fails on server, we should clear local tokens
      console.warn('Server logout failed:', error);
    }
  }

  // Logout from all devices
  static async logoutAll(): Promise<void> {
    const response = await ApiService.post('/auth/logout-all');
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to logout from all devices');
    }
  }

  // Get current user profile
  static async getProfile(): Promise<User> {
    const response = await ApiService.get<{ user: User }>('/auth/me');
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch profile');
    }
    
    return response.data.user;
  }

  // Update user profile
  static async updateProfile(data: UpdateProfileData): Promise<User> {
    const response = await ApiService.put<{ user: User }>('/auth/me', data);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update profile');
    }
    
    return response.data.user;
  }

  // Change password
  static async changePassword(data: ChangePasswordData): Promise<void> {
    const response = await ApiService.post('/auth/change-password', data);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to change password');
    }
  }

  // Forgot password
  static async forgotPassword(data: ForgotPasswordData): Promise<void> {
    const response = await ApiService.post('/auth/forgot-password', data);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to send password reset email');
    }
  }

  // Reset password
  static async resetPassword(data: ResetPasswordData): Promise<void> {
    const response = await ApiService.post('/auth/reset-password', data);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to reset password');
    }
  }

  // Verify email
  static async verifyEmail(token: string): Promise<User> {
    const response = await ApiService.post<{ user: User }>('/auth/verify-email', { token });
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Email verification failed');
    }
    
    return response.data.user;
  }

  // Resend verification email
  static async resendVerification(email: string): Promise<void> {
    const response = await ApiService.post('/auth/resend-verification', { email });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to resend verification email');
    }
  }

  // Refresh access token
  static async refreshToken(refreshToken: string): Promise<{ access_token: string; expires_in: number }> {
    const response = await ApiService.post<{ access_token: string; expires_in: number }>(
      '/auth/refresh-token', 
      { refresh_token: refreshToken }
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to refresh token');
    }
    
    return response.data;
  }

  // Verify token validity
  static async verifyToken(): Promise<User> {
    const response = await ApiService.get<{ user: User }>('/auth/verify-token');
    
    if (!response.success || !response.data) {
      throw new Error('Token is invalid');
    }
    
    return response.data.user;
  }

  // Get user sessions (debug endpoint)
  static async getUserSessions(): Promise<UserSession[]> {
    const response = await ApiService.get<SessionResponse>('/auth/sessions');
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch user sessions');
    }
    
    return response.data.sessions;
  }

  // Delete account
  static async deleteAccount(password: string): Promise<void> {
    const response = await ApiService.delete('/auth/delete-account', {
      data: { password }
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete account');
    }
  }

  // Check if email exists (for registration)
  static async checkEmailExists(email: string): Promise<boolean> {
    try {
      const response = await ApiService.post('/auth/check-email', { email });
      return response.data?.exists || false;
    } catch (error) {
      // If endpoint doesn't exist, return false to allow registration attempt
      return false;
    }
  }

  // Validate password strength
  static validatePassword(password: string): { 
    isValid: boolean; 
    errors: string[];
    strength: 'weak' | 'medium' | 'strong';
  } {
    const errors: string[] = [];
    let score = 0;

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    } else {
      score += 1;
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    } else {
      score += 1;
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    } else {
      score += 1;
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    } else {
      score += 1;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password should contain at least one special character');
    } else {
      score += 1;
    }

    if (password.length >= 12) {
      score += 1;
    }

    let strength: 'weak' | 'medium' | 'strong';
    if (score < 3) {
      strength = 'weak';
    } else if (score < 5) {
      strength = 'medium';
    } else {
      strength = 'strong';
    }

    return {
      isValid: errors.length === 0,
      errors,
      strength
    };
  }

  // Validate email format
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Generate secure random password
  static generatePassword(length: number = 12): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*';
    
    const allChars = lowercase + uppercase + numbers + symbols;
    let password = '';
    
    // Ensure at least one character from each category
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill remaining length with random characters
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  // Check if user needs to verify email
  static needsEmailVerification(user: User): boolean {
    return !user.is_verified;
  }

  // Get auth status for debugging
  static async getAuthStatus(): Promise<{
    hasAccessToken: boolean;
    hasRefreshToken: boolean;
    isTokenExpired: boolean;
    tokenExpiresAt: string | null;
  }> {
    const { TokenManager } = await import('./api');
    
    const expiresAt = localStorage.getItem('astroluna_token_expires');
    
    return {
      hasAccessToken: !!TokenManager.getAccessToken(),
      hasRefreshToken: !!TokenManager.getRefreshToken(),
      isTokenExpired: TokenManager.isTokenExpired(),
      tokenExpiresAt: expiresAt ? new Date(parseInt(expiresAt)).toISOString() : null,
    };
  }

  // Clear all auth data (for logout)
  static async clearAuthData(): Promise<void> {
    const { TokenManager } = await import('./api');
    TokenManager.clearTokens();
  }

  // Set auth tokens (for login)
  static async setAuthTokens(tokens: { access_token: string; refresh_token: string; expires_in: number }): Promise<void> {
    const { TokenManager } = await import('./api');
    TokenManager.setTokens(tokens);
  }
}

export default AuthService;