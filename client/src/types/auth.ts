// Authentication related types

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  language: 'en' | 'uk';
  currency: 'USD' | 'EUR' | 'UAH';
  credits: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  language?: 'en' | 'uk';
  currency?: 'USD' | 'EUR' | 'UAH';
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  subscribeNewsletter?: boolean;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number; // seconds
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  details?: ValidationError[];
  code?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ForgotPasswordData {
  email: string;
  language?: 'en' | 'uk';
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
}

export interface UpdateProfileData {
  full_name?: string;
  phone?: string;
  language?: 'en' | 'uk';
  currency?: 'USD' | 'EUR' | 'UAH';
}

// Auth context state
export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Auth actions
export type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; tokens: AuthTokens } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'UPDATE_TOKENS'; payload: AuthTokens }
  | { type: 'CLEAR_ERROR' };

// Route protection
export interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireVerified?: boolean;
  fallback?: React.ReactNode;
}

export interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

// Form validation schemas
export interface LoginFormData {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  full_name: string;
  phone?: string;
  language: 'en' | 'uk';
  currency: 'USD' | 'EUR' | 'UAH';
  termsAccepted: boolean;
}

export interface ProfileFormData {
  full_name: string;
  phone?: string;
  language: 'en' | 'uk';
  currency: 'USD' | 'EUR' | 'UAH';
}

export interface PasswordFormData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// Session management
export interface UserSession {
  id: string;
  device: string;
  ip: string;
  lastActive: string;
  current: boolean;
}

export interface SessionResponse {
  success: boolean;
  sessions: UserSession[];
}