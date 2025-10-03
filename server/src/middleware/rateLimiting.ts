import { Request, Response, NextFunction } from 'express';
import { SecurityLogger } from '../services/LoggingService';
import { TokenBucket } from '../utils/tokens';

interface RateLimitConfig {
  windowMs: number;          // Time window in milliseconds
  maxRequests: number;       // Maximum requests per window
  message?: string;          // Custom error message
  statusCode?: number;       // HTTP status code for rate limit exceeded
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
  skip?: (req: Request) => boolean;
  onLimitReached?: (req: Request) => void;
}

interface RateLimitInfo {
  requests: number;
  resetTime: number;
  windowStart: number;
}

// In-memory store (in production, use Redis)
const store = new Map<string, RateLimitInfo>();

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, info] of store.entries()) {
    if (now > info.resetTime) {
      store.delete(key);
    }
  }
}, 60000); // Clean up every minute

export function rateLimiter(config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    message = 'Too many requests, please try again later.',
    statusCode = 429,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    keyGenerator = (req) => req.ip || 'unknown',
    skip = () => false,
    onLimitReached
  } = config;

  return (req: Request, res: Response, next: NextFunction) => {
    if (skip(req)) {
      return next();
    }

    const key = keyGenerator(req);
    const now = Date.now();
    
    // Get or create rate limit info
    let info = store.get(key);
    if (!info || now > info.resetTime) {
      info = {
        requests: 0,
        resetTime: now + windowMs,
        windowStart: now
      };
      store.set(key, info);
    }

    // Check if we should count this request
    const shouldSkip = () => {
      if (skipSuccessfulRequests && res.statusCode < 400) return true;
      if (skipFailedRequests && res.statusCode >= 400) return true;
      return false;
    };

    // Increment request count
    info.requests++;
    
    // Set rate limit headers
    const remaining = Math.max(0, maxRequests - info.requests);
    const resetTime = Math.ceil(info.resetTime / 1000);
    
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetTime);
    res.setHeader('X-RateLimit-Window', Math.ceil(windowMs / 1000));

    // Check if limit exceeded
    if (info.requests > maxRequests) {
      SecurityLogger.rateLimitViolation(req.ip, req.path, info.requests);
      
      if (onLimitReached) {
        onLimitReached(req);
      }

      return res.status(statusCode).json({
        success: false,
        error: message,
        retryAfter: Math.ceil((info.resetTime - now) / 1000)
      });
    }

    // Add cleanup logic on response
    const originalSend = res.send;
    res.send = function(data) {
      if (shouldSkip()) {
        info!.requests--;
      }
      return originalSend.call(this, data);
    };

    next();
  };
}

// Predefined rate limiters for different endpoints
export const authRateLimit = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  keyGenerator: (req) => `auth:${req.ip}`,
  skipSuccessfulRequests: true
});

export const registerRateLimit = rateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3, // limit each IP to 3 registration attempts per hour
  message: 'Too many registration attempts, please try again later.',
  keyGenerator: (req) => `register:${req.ip}`
});

export const passwordResetRateLimit = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 3, // limit each IP to 3 password reset requests per 15 minutes
  message: 'Too many password reset attempts, please try again later.',
  keyGenerator: (req) => `password-reset:${req.body.email || req.ip}`
});

export const apiRateLimit = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // limit each IP to 100 API requests per windowMs
  message: 'API rate limit exceeded, please try again later.',
  keyGenerator: (req) => `api:${req.ip}`
});

export const aiGenerationRateLimit = rateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 50, // limit each user to 50 AI generations per hour
  message: 'AI generation rate limit exceeded. Please upgrade your plan or try again later.',
  keyGenerator: (req) => `ai:${req.user?.id || req.ip}`,
  onLimitReached: (req) => {
    SecurityLogger.suspiciousActivity(
      req.user?.id,
      'AI generation rate limit exceeded',
      req.ip,
      req.get('User-Agent')
    );
  }
});

// Credit-based rate limiting for premium features
export function creditBasedRateLimit(creditsRequired: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (user.credits < creditsRequired) {
      return res.status(402).json({
        success: false,
        error: 'Insufficient credits',
        required: creditsRequired,
        available: user.credits
      });
    }

    next();
  };
}

// User-specific rate limiting with token bucket
const userTokenBuckets = new Map<number, TokenBucket>();

export function userRateLimit(capacity: number, refillRate: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    
    if (!userId) {
      return next();
    }

    let bucket = userTokenBuckets.get(userId);
    if (!bucket) {
      bucket = new TokenBucket(capacity, refillRate);
      userTokenBuckets.set(userId, bucket);
    }

    if (!bucket.consume(1)) {
      const availableTokens = bucket.getAvailableTokens();
      
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded for your account',
        availableTokens,
        capacity
      });
    }

    res.setHeader('X-RateLimit-User-Remaining', bucket.getAvailableTokens());
    res.setHeader('X-RateLimit-User-Capacity', capacity);

    next();
  };
}

// Adaptive rate limiting based on server load
let serverLoad = 0;

export function adaptiveRateLimit(baseConfig: RateLimitConfig) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Adjust limits based on server load
    const loadMultiplier = Math.max(0.1, 1 - (serverLoad / 100));
    const adjustedMaxRequests = Math.floor(baseConfig.maxRequests * loadMultiplier);
    
    const adaptedConfig = {
      ...baseConfig,
      maxRequests: adjustedMaxRequests
    };
    
    return rateLimiter(adaptedConfig)(req, res, next);
  };
}

// Monitor server load (simplified)
setInterval(() => {
  const memUsage = process.memoryUsage();
  const memPercentage = (memUsage.heapUsed / memUsage.heapTotal) * 100;
  serverLoad = Math.min(100, memPercentage);
}, 10000); // Check every 10 seconds

// IP whitelist for internal services
const whitelistedIPs = new Set([
  '127.0.0.1',
  '::1',
  ...(process.env.WHITELISTED_IPS?.split(',') || [])
]);

export function ipWhitelistBypass(req: Request): boolean {
  return whitelistedIPs.has(req.ip);
}

// Geographic rate limiting
export function geoRateLimit(config: RateLimitConfig & { allowedCountries?: string[] }) {
  return (req: Request, res: Response, next: NextFunction) => {
    // This would require a GeoIP service integration
    // For now, we'll use a simplified approach
    
    const country = req.get('CF-IPCountry'); // Cloudflare header
    
    if (config.allowedCountries && country && !config.allowedCountries.includes(country)) {
      return res.status(403).json({
        success: false,
        error: 'Service not available in your region'
      });
    }
    
    return rateLimiter(config)(req, res, next);
  };
}

// Exponential backoff rate limiting
const backoffMultipliers = new Map<string, number>();

export function exponentialBackoffRateLimit(baseConfig: RateLimitConfig) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = baseConfig.keyGenerator ? baseConfig.keyGenerator(req) : req.ip;
    const multiplier = backoffMultipliers.get(key) || 1;
    
    const adjustedConfig = {
      ...baseConfig,
      windowMs: baseConfig.windowMs * multiplier,
      onLimitReached: (req) => {
        // Increase backoff for this key
        backoffMultipliers.set(key, Math.min(16, multiplier * 2));
        
        // Reset backoff after some time
        setTimeout(() => {
          backoffMultipliers.delete(key);
        }, baseConfig.windowMs * 4);
        
        baseConfig.onLimitReached?.(req);
      }
    };
    
    return rateLimiter(adjustedConfig)(req, res, next);
  };
}

// Sliding window rate limiting (more accurate than fixed window)
interface SlidingWindowInfo {
  requests: { timestamp: number; success: boolean }[];
}

const slidingWindowStore = new Map<string, SlidingWindowInfo>();

export function slidingWindowRateLimit(config: RateLimitConfig) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = config.keyGenerator ? config.keyGenerator(req) : req.ip;
    const now = Date.now();
    const windowStart = now - config.windowMs;
    
    let info = slidingWindowStore.get(key);
    if (!info) {
      info = { requests: [] };
      slidingWindowStore.set(key, info);
    }
    
    // Remove old requests outside the window
    info.requests = info.requests.filter(req => req.timestamp > windowStart);
    
    // Count valid requests
    const validRequests = info.requests.filter(req => {
      if (config.skipSuccessfulRequests && req.success) return false;
      if (config.skipFailedRequests && !req.success) return false;
      return true;
    });
    
    if (validRequests.length >= config.maxRequests) {
      const oldestRequest = Math.min(...info.requests.map(r => r.timestamp));
      const retryAfter = Math.ceil((oldestRequest + config.windowMs - now) / 1000);
      
      res.setHeader('Retry-After', retryAfter);
      
      return res.status(config.statusCode || 429).json({
        success: false,
        error: config.message || 'Rate limit exceeded',
        retryAfter
      });
    }
    
    // Add current request
    info.requests.push({ timestamp: now, success: true });
    
    // Update success status after response
    res.on('finish', () => {
      const lastRequest = info.requests[info.requests.length - 1];
      if (lastRequest && lastRequest.timestamp === now) {
        lastRequest.success = res.statusCode < 400;
      }
    });
    
    // Set headers
    const remaining = Math.max(0, config.maxRequests - validRequests.length - 1);
    res.setHeader('X-RateLimit-Limit', config.maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Window', Math.ceil(config.windowMs / 1000));
    
    next();
  };
}

// Clean up stores periodically
setInterval(() => {
  const now = Date.now();
  
  // Clean up sliding window store
  for (const [key, info] of slidingWindowStore.entries()) {
    info.requests = info.requests.filter(req => req.timestamp > now - 24 * 60 * 60 * 1000); // Keep last 24 hours
    if (info.requests.length === 0) {
      slidingWindowStore.delete(key);
    }
  }
  
  // Clean up user token buckets for inactive users
  if (userTokenBuckets.size > 10000) {
    userTokenBuckets.clear();
  }
}, 5 * 60 * 1000); // Every 5 minutes