import { Request } from 'express';

// User data interface
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
  credits?: number;
  created_at: Date;
  updated_at: Date;
}

// Authenticated request interface
export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    full_name: string;
    language: string;
    currency: string;
    is_verified: boolean;
  };
}

// JWT payload interface
export interface JWTPayload {
  userId: number;
  email: string;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

// Login credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

// Registration data
export interface CreateUserData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  language?: string;
  currency?: string;
}