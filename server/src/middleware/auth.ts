import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

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

export interface TokenPayload {
  id: number;
  email: string;
  iat?: number;
  exp?: number;
}

export class AuthService {
  static generateToken(user: { id: number; email: string }): string {
    return jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  static verifyToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch (error) {
      return null;
    }
  }

  static generateRefreshToken(user: { id: number; email: string }): string {
    return jwt.sign(
      { id: user.id, email: user.email, type: 'refresh' },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
  }
}

// Middleware to authenticate requests
export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required',
        code: 'NO_TOKEN'
      });
    }

    const token = authHeader.substring(7);
    const decoded = AuthService.verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }

    // Fetch user from database
    const userModel = new User();
    const user = await userModel.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      language: user.language,
      currency: user.currency,
      is_verified: user.is_verified
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Authentication service error',
      code: 'AUTH_SERVICE_ERROR'
    });
  }
};

// Middleware to check if user is verified
export const requireVerification = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user?.is_verified) {
    return res.status(403).json({ 
      success: false, 
      error: 'Email verification required',
      code: 'EMAIL_NOT_VERIFIED'
    });
  }
  next();
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided - continue without authentication
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = AuthService.verifyToken(token);

    if (decoded) {
      const userModel = new User();
      const user = await userModel.findById(decoded.id);
      
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          language: user.language,
          currency: user.currency,
          is_verified: user.is_verified
        };
      }
    }

    next();
  } catch (error) {
    // Ignore authentication errors in optional auth
    next();
  }
};

// Middleware to check credits before AI generation
export const checkCredits = (requiredCredits: number) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        // Allow demo mode for unauthenticated users
        return next();
      }

      const userModel = new User();
      const balance = await userModel.getCreditsBalance(req.user.id);

      if (balance < requiredCredits) {
        return res.status(402).json({ 
          success: false, 
          error: `Insufficient credits. Required: ${requiredCredits}, Available: ${balance}`,
          code: 'INSUFFICIENT_CREDITS',
          required_credits: requiredCredits,
          available_credits: balance
        });
      }

      next();
    } catch (error) {
      console.error('Credits check error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Credits verification failed',
        code: 'CREDITS_CHECK_ERROR'
      });
    }
  };
};

// Rate limiting middleware
export const rateLimiter = (maxRequests: number, windowMs: number) => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const identifier = req.user?.id.toString() || req.ip;
    const now = Date.now();
    
    const userRequests = requests.get(identifier);
    
    if (!userRequests || now > userRequests.resetTime) {
      requests.set(identifier, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (userRequests.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED',
        retry_after: Math.ceil((userRequests.resetTime - now) / 1000)
      });
    }
    
    userRequests.count++;
    next();
  };
};