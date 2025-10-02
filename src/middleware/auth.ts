// Authentication middleware for AstroLuna

import type { Context, Next } from 'hono';
import { verifyToken } from '../utils/database';

export interface AuthContext {
  userId: number;
  user?: any; // Will be populated if needed
}

// Middleware to verify JWT token and add user context
export async function authMiddleware(c: Context, next: Next) {
  try {
    // Extract JWT token from Authorization header
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const jwtSecret = c.env?.JWT_SECRET || process.env.JWT_SECRET || 'dev_secret_key_change_in_production';
    
    // Verify token
    const decoded = verifyToken(token, jwtSecret);
    
    if (!decoded) {
      return c.json({ error: 'Invalid or expired token' }, 401);
    }

    // Add user context to the request
    c.set('userId', decoded.userId);
    
    await next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return c.json({ error: 'Authentication failed' }, 401);
  }
}

// Optional middleware that allows both authenticated and unauthenticated requests
export async function optionalAuthMiddleware(c: Context, next: Next) {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const jwtSecret = c.env?.JWT_SECRET || process.env.JWT_SECRET || 'dev_secret_key_change_in_production';
      
      const decoded = verifyToken(token, jwtSecret);
      
      if (decoded) {
        c.set('userId', decoded.userId);
      }
    }
    
    await next();
  } catch (error) {
    // Ignore auth errors for optional middleware
    console.warn('Optional auth middleware warning:', error);
    await next();
  }
}

// CORS middleware for API routes
export async function corsMiddleware(c: Context, next: Next) {
  // Handle preflight requests
  if (c.req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
      }
    });
  }

  // Add CORS headers to actual requests
  c.header('Access-Control-Allow-Origin', '*');
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  await next();
}

// Helper function to get current user from context
export function getCurrentUser(c: Context) {
  const userId = c.get('userId') as number;
  return userId;
}

// Check if user has sufficient credits
export async function checkCredits(
  c: Context<{ Bindings: CloudflareBindings }>, 
  requiredCredits: number
): Promise<{ hasCredits: boolean; currentBalance: number }> {
  const userId = getCurrentUser(c);
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  // Use the same database detection logic as in routes
  let dbService;
  if (c.env.DB) {
    try {
      await c.env.DB.prepare('SELECT COUNT(*) FROM users LIMIT 1').first();
      const { DatabaseService } = await import('../utils/database');
      dbService = new DatabaseService(c.env.DB);
    } catch (error) {
      const { MockDatabaseService } = await import('../utils/mock-database');
      await MockDatabaseService.initialize();
      dbService = new MockDatabaseService();
    }
  } else {
    const { MockDatabaseService } = await import('../utils/mock-database');
    await MockDatabaseService.initialize();
    dbService = new MockDatabaseService();
  }

  const currentBalance = await dbService.getUserCredits(userId);
  
  return {
    hasCredits: currentBalance >= requiredCredits,
    currentBalance
  };
}

// Rate limiting middleware (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) {
  return async (c: Context, next: Next) => {
    const clientIP = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown';
    const now = Date.now();
    
    // Clean up expired entries
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    }
    
    // Check current rate limit
    const current = rateLimitMap.get(clientIP);
    
    if (!current) {
      rateLimitMap.set(clientIP, { count: 1, resetTime: now + windowMs });
    } else if (now > current.resetTime) {
      rateLimitMap.set(clientIP, { count: 1, resetTime: now + windowMs });
    } else if (current.count >= maxRequests) {
      return c.json({ error: 'Too many requests. Please try again later.' }, 429);
    } else {
      current.count++;
    }
    
    await next();
  };
}