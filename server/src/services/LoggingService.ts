import winston from 'winston';
import path from 'path';

// Define log levels and colors
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'cyan'
};

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(info => {
    const { timestamp, level, message, ...meta } = info;
    const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level}]: ${message} ${metaString}`;
  })
);

// Create logger instance
export const logger = winston.createLogger({
  levels: logLevels,
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: consoleFormat,
      silent: process.env.NODE_ENV === 'test'
    }),
    
    // File transport for errors
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 10
    })
  ],
  
  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'exceptions.log')
    })
  ],
  
  // Handle unhandled rejections
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'rejections.log')
    })
  ]
});

// Add colors to winston
winston.addColors(logColors);

// Helper functions for structured logging
export class Logger {
  static info(message: string, meta?: object) {
    logger.info(message, meta);
  }
  
  static error(message: string, error?: Error | object) {
    if (error instanceof Error) {
      logger.error(message, {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        }
      });
    } else {
      logger.error(message, { error });
    }
  }
  
  static warn(message: string, meta?: object) {
    logger.warn(message, meta);
  }
  
  static debug(message: string, meta?: object) {
    logger.debug(message, meta);
  }
  
  static http(message: string, meta?: object) {
    logger.http(message, meta);
  }
}

// Specific loggers for different domains
export class AuthLogger {
  static loginAttempt(email: string, success: boolean, ip?: string) {
    logger.info('Login attempt', {
      domain: 'auth',
      action: 'login',
      email,
      success,
      ip,
      timestamp: new Date().toISOString()
    });
  }
  
  static registrationAttempt(email: string, success: boolean, ip?: string) {
    logger.info('Registration attempt', {
      domain: 'auth',
      action: 'register',
      email,
      success,
      ip,
      timestamp: new Date().toISOString()
    });
  }
  
  static emailVerification(email: string, success: boolean) {
    logger.info('Email verification', {
      domain: 'auth',
      action: 'verify_email',
      email,
      success,
      timestamp: new Date().toISOString()
    });
  }
  
  static passwordReset(email: string, success: boolean, ip?: string) {
    logger.info('Password reset', {
      domain: 'auth',
      action: 'password_reset',
      email,
      success,
      ip,
      timestamp: new Date().toISOString()
    });
  }
  
  static tokenRefresh(userId: number, success: boolean) {
    logger.info('Token refresh', {
      domain: 'auth',
      action: 'token_refresh',
      userId,
      success,
      timestamp: new Date().toISOString()
    });
  }
  
  static logout(userId: number, ip?: string) {
    logger.info('User logout', {
      domain: 'auth',
      action: 'logout',
      userId,
      ip,
      timestamp: new Date().toISOString()
    });
  }
}

export class AILogger {
  static generationRequest(userId: number, serviceType: string, success: boolean, creditsUsed?: number) {
    logger.info('AI generation request', {
      domain: 'ai',
      action: 'generate',
      userId,
      serviceType,
      success,
      creditsUsed,
      timestamp: new Date().toISOString()
    });
  }
  
  static generationError(userId: number, serviceType: string, error: string) {
    logger.error('AI generation failed', {
      domain: 'ai',
      action: 'generate_error',
      userId,
      serviceType,
      error,
      timestamp: new Date().toISOString()
    });
  }
  
  static rateLimitHit(userId: number, serviceType: string, ip?: string) {
    logger.warn('AI generation rate limit hit', {
      domain: 'ai',
      action: 'rate_limit',
      userId,
      serviceType,
      ip,
      timestamp: new Date().toISOString()
    });
  }
}

export class BillingLogger {
  static creditPurchase(userId: number, amount: number, currency: string, transactionId: string) {
    logger.info('Credit purchase', {
      domain: 'billing',
      action: 'purchase_credits',
      userId,
      amount,
      currency,
      transactionId,
      timestamp: new Date().toISOString()
    });
  }
  
  static creditDeduction(userId: number, amount: number, reason: string, remainingCredits: number) {
    logger.info('Credit deduction', {
      domain: 'billing',
      action: 'deduct_credits',
      userId,
      amount,
      reason,
      remainingCredits,
      timestamp: new Date().toISOString()
    });
  }
  
  static paymentFailed(userId: number, amount: number, currency: string, error: string) {
    logger.error('Payment failed', {
      domain: 'billing',
      action: 'payment_failed',
      userId,
      amount,
      currency,
      error,
      timestamp: new Date().toISOString()
    });
  }
}

export class LibraryLogger {
  static itemSaved(userId: number, itemId: number, title: string) {
    logger.info('Library item saved', {
      domain: 'library',
      action: 'save_item',
      userId,
      itemId,
      title,
      timestamp: new Date().toISOString()
    });
  }
  
  static itemDeleted(userId: number, itemId: number) {
    logger.info('Library item deleted', {
      domain: 'library',
      action: 'delete_item',
      userId,
      itemId,
      timestamp: new Date().toISOString()
    });
  }
  
  static itemExported(userId: number, itemId: number, format: string) {
    logger.info('Library item exported', {
      domain: 'library',
      action: 'export_item',
      userId,
      itemId,
      format,
      timestamp: new Date().toISOString()
    });
  }
}

export class SecurityLogger {
  static suspiciousActivity(userId?: number, activity: string, ip?: string, userAgent?: string) {
    logger.warn('Suspicious activity detected', {
      domain: 'security',
      action: 'suspicious_activity',
      userId,
      activity,
      ip,
      userAgent,
      timestamp: new Date().toISOString()
    });
  }
  
  static rateLimitViolation(ip: string, endpoint: string, attempts: number) {
    logger.warn('Rate limit violation', {
      domain: 'security',
      action: 'rate_limit_violation',
      ip,
      endpoint,
      attempts,
      timestamp: new Date().toISOString()
    });
  }
  
  static invalidToken(token: string, reason: string, ip?: string) {
    logger.warn('Invalid token used', {
      domain: 'security',
      action: 'invalid_token',
      tokenHash: token ? token.substring(0, 10) + '...' : 'null',
      reason,
      ip,
      timestamp: new Date().toISOString()
    });
  }
}

export class SystemLogger {
  static serverStart(port: number) {
    logger.info('Server started', {
      domain: 'system',
      action: 'server_start',
      port,
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  }
  
  static databaseConnection(success: boolean, error?: string) {
    if (success) {
      logger.info('Database connected successfully', {
        domain: 'system',
        action: 'db_connect',
        success: true,
        timestamp: new Date().toISOString()
      });
    } else {
      logger.error('Database connection failed', {
        domain: 'system',
        action: 'db_connect',
        success: false,
        error,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  static apiError(endpoint: string, method: string, statusCode: number, error: string, userId?: number) {
    logger.error('API error', {
      domain: 'system',
      action: 'api_error',
      endpoint,
      method,
      statusCode,
      error,
      userId,
      timestamp: new Date().toISOString()
    });
  }
  
  static performanceWarning(operation: string, duration: number, threshold: number) {
    logger.warn('Performance warning', {
      domain: 'system',
      action: 'performance_warning',
      operation,
      duration,
      threshold,
      timestamp: new Date().toISOString()
    });
  }
  
  static aiGeneration(userId: number, service: string, creditsUsed: number, processingTime: number) {
    logger.info('AI generation completed', {
      domain: 'ai',
      action: 'generation_complete',
      userId,
      service,
      creditsUsed,
      processingTime,
      timestamp: new Date().toISOString()
    });
  }
}

// Request logging middleware
export function requestLogger(req: any, res: any, next: any) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, url, ip, headers } = req;
    const { statusCode } = res;
    
    logger.http('HTTP Request', {
      method,
      url,
      statusCode,
      duration,
      ip,
      userAgent: headers['user-agent'],
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    });
    
    // Log slow requests
    if (duration > 5000) {
      SystemLogger.performanceWarning(`${method} ${url}`, duration, 5000);
    }
  });
  
  next();
}

// Error logging middleware
export function errorLogger(error: Error, req: any, res: any, next: any) {
  const { method, url, ip, headers } = req;
  
  SystemLogger.apiError(
    url,
    method,
    res.statusCode || 500,
    error.message,
    req.user?.id
  );
  
  logger.error('Unhandled API error', {
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name
    },
    request: {
      method,
      url,
      ip,
      userAgent: headers['user-agent'],
      userId: req.user?.id
    },
    timestamp: new Date().toISOString()
  });
  
  next(error);
}

// Create logs directory if it doesn't exist
import fs from 'fs';
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

export default logger;