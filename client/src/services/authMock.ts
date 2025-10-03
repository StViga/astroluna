import { 
  User, 
  AuthResponse, 
  LoginCredentials, 
  RegisterData 
} from '@/types/auth';

// Mock user data for demo
const mockUser: User = {
  id: 1,
  email: 'demo@astroluna.com',
  full_name: 'Demo User',
  language: 'en',
  currency: 'USD',
  credits: 50,
  is_verified: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  last_login: new Date().toISOString()
};

// Mock authentication service for demo purposes
class MockAuthService {
  // Simulate network delay
  private static delay(ms: number = 1000): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Mock register
  static async register(data: RegisterData): Promise<AuthResponse> {
    await this.delay(1500); // Simulate API call

    // Simulate validation
    if (!data.email || !data.password || !data.fullName) {
      throw new Error('All required fields must be filled');
    }

    if (data.email === 'test@error.com') {
      throw new Error('Email already exists');
    }

    // Create mock user from registration data
    const newUser: User = {
      ...mockUser,
      email: data.email,
      full_name: data.fullName,
      language: data.language || 'en',
      currency: data.currency || 'USD',
    };

    return {
      success: true,
      message: 'Account created successfully!',
      user: newUser,
      access_token: 'mock_access_token_' + Date.now(),
      refresh_token: 'mock_refresh_token_' + Date.now(),
      expires_in: 3600, // 1 hour
    };
  }

  // Mock login
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await this.delay(800);

    // Demo credentials
    const validCredentials = [
      { email: 'demo@astroluna.com', password: 'demo123' },
      { email: 'test@example.com', password: 'test123' },
      { email: 'user@demo.com', password: 'password' }
    ];

    const isValid = validCredentials.some(
      cred => cred.email === credentials.email && cred.password === credentials.password
    );

    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    const user: User = {
      ...mockUser,
      email: credentials.email,
      last_login: new Date().toISOString()
    };

    return {
      success: true,
      message: 'Login successful!',
      user,
      access_token: 'mock_access_token_' + Date.now(),
      refresh_token: 'mock_refresh_token_' + Date.now(),
      expires_in: 3600,
    };
  }

  // Mock logout
  static async logout(): Promise<void> {
    await this.delay(300);
    // Mock logout always succeeds
  }

  // Mock logout all
  static async logoutAll(): Promise<void> {
    await this.delay(500);
    // Mock logout all always succeeds
  }

  // Mock get profile
  static async getProfile(): Promise<User> {
    await this.delay(400);
    return mockUser;
  }

  // Mock update profile
  static async updateProfile(data: any): Promise<User> {
    await this.delay(800);
    return {
      ...mockUser,
      ...data,
      updated_at: new Date().toISOString()
    };
  }

  // Mock change password
  static async changePassword(data: any): Promise<void> {
    await this.delay(1000);
    
    if (data.current_password !== 'demo123') {
      throw new Error('Current password is incorrect');
    }
    
    // Mock success
  }

  // Mock verify email
  static async verifyEmail(token: string): Promise<User> {
    await this.delay(600);
    return {
      ...mockUser,
      is_verified: true
    };
  }

  // Mock resend verification
  static async resendVerification(email: string): Promise<void> {
    await this.delay(800);
    // Mock success
  }

  // Mock forgot password
  static async forgotPassword(data: any): Promise<void> {
    await this.delay(1200);
    // Mock success
  }

  // Mock reset password
  static async resetPassword(data: any): Promise<void> {
    await this.delay(1000);
    // Mock success
  }

  // Mock refresh token
  static async refreshToken(refreshToken: string): Promise<{ access_token: string; expires_in: number }> {
    await this.delay(300);
    return {
      access_token: 'mock_new_access_token_' + Date.now(),
      expires_in: 3600
    };
  }

  // Mock verify token
  static async verifyToken(): Promise<User> {
    await this.delay(200);
    return mockUser;
  }

  // Mock get user sessions
  static async getUserSessions(): Promise<any[]> {
    await this.delay(500);
    return [
      {
        id: '1',
        device: 'Chrome Browser',
        ip: '192.168.1.1',
        lastActive: new Date().toISOString(),
        current: true
      }
    ];
  }

  // Mock delete account
  static async deleteAccount(password: string): Promise<void> {
    await this.delay(1500);
    
    if (password !== 'demo123') {
      throw new Error('Password is incorrect');
    }
    
    // Mock success
  }

  // Mock check email exists
  static async checkEmailExists(email: string): Promise<boolean> {
    await this.delay(300);
    
    // Simulate some emails already exist
    const existingEmails = ['test@exists.com', 'user@taken.com'];
    return existingEmails.includes(email);
  }

  // Pass through utility methods from real AuthService
  static validatePassword = (password: string) => {
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

    let strength: 'weak' | 'medium' | 'strong';
    if (score < 2) {
      strength = 'weak';
    } else if (score < 4) {
      strength = 'medium';
    } else {
      strength = 'strong';
    }

    return {
      isValid: errors.length === 0,
      errors,
      strength
    };
  };

  static validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  static needsEmailVerification = (user: User): boolean => {
    return !user.is_verified;
  };
}

export default MockAuthService;