import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserData } from '../types/auth';

export interface JWTTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface JWTPayload {
  userId: number;
  email: string;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

export class TokenService {
  private static readonly ACCESS_TOKEN_EXPIRES_IN = '15m';  // 15 minutes
  private static readonly REFRESH_TOKEN_EXPIRES_IN = '7d';  // 7 days
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
  private static readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key';

  /**
   * Generate access and refresh tokens for a user
   */
  static generateTokens(user: UserData): JWTTokens {
    const payload = {
      userId: user.id,
      email: user.email
    };

    // Generate access token
    const access_token = jwt.sign(
      { ...payload, type: 'access' },
      this.JWT_SECRET,
      { 
        expiresIn: this.ACCESS_TOKEN_EXPIRES_IN,
        issuer: 'astroluna',
        audience: 'astroluna-users'
      }
    );

    // Generate refresh token
    const refresh_token = jwt.sign(
      { ...payload, type: 'refresh' },
      this.JWT_REFRESH_SECRET,
      { 
        expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
        issuer: 'astroluna',
        audience: 'astroluna-users'
      }
    );

    return {
      access_token,
      refresh_token,
      expires_in: 15 * 60 // 15 minutes in seconds
    };
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET, {
        issuer: 'astroluna',
        audience: 'astroluna-users'
      }) as JWTPayload;

      if (decoded.type !== 'access') {
        return null;
      }

      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, this.JWT_REFRESH_SECRET, {
        issuer: 'astroluna',
        audience: 'astroluna-users'
      }) as JWTPayload;

      if (decoded.type !== 'refresh') {
        return null;
      }

      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Generate a new access token from a valid refresh token
   */
  static refreshAccessToken(refreshToken: string): string | null {
    const decoded = this.verifyRefreshToken(refreshToken);
    if (!decoded) {
      return null;
    }

    const newAccessToken = jwt.sign(
      { 
        userId: decoded.userId, 
        email: decoded.email, 
        type: 'access' 
      },
      this.JWT_SECRET,
      { 
        expiresIn: this.ACCESS_TOKEN_EXPIRES_IN,
        issuer: 'astroluna',
        audience: 'astroluna-users'
      }
    );

    return newAccessToken;
  }

  /**
   * Generate secure random token for email verification and password reset
   */
  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate UUID v4
   */
  static generateUUID(): string {
    return crypto.randomUUID();
  }

  /**
   * Hash a token for storage (for email verification, password reset)
   */
  static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Verify a token against its hash
   */
  static verifyTokenHash(token: string, hash: string): boolean {
    const tokenHash = this.hashToken(token);
    return crypto.timingSafeEqual(
      Buffer.from(tokenHash, 'hex'),
      Buffer.from(hash, 'hex')
    );
  }

  /**
   * Generate API key for external integrations
   */
  static generateApiKey(): string {
    const prefix = 'astr_';
    const randomPart = crypto.randomBytes(24).toString('base64url');
    return prefix + randomPart;
  }

  /**
   * Extract user ID from token without verification (for logging purposes)
   */
  static extractUserIdUnsafe(token: string): number | null {
    try {
      const decoded = jwt.decode(token) as JWTPayload;
      return decoded?.userId || null;
    } catch {
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as JWTPayload;
      if (!decoded?.exp) return true;
      
      return Date.now() >= decoded.exp * 1000;
    } catch {
      return true;
    }
  }

  /**
   * Get token expiration time
   */
  static getTokenExpiration(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as JWTPayload;
      if (!decoded?.exp) return null;
      
      return new Date(decoded.exp * 1000);
    } catch {
      return null;
    }
  }

  /**
   * Generate session token for additional security
   */
  static generateSessionToken(): string {
    return crypto.randomBytes(32).toString('base64url');
  }

  /**
   * Create a signed cookie value
   */
  static signCookie(value: string, secret?: string): string {
    const cookieSecret = secret || process.env.COOKIE_SECRET || 'cookie-signing-secret';
    const signature = crypto
      .createHmac('sha256', cookieSecret)
      .update(value)
      .digest('base64url');
    
    return `${value}.${signature}`;
  }

  /**
   * Verify a signed cookie value
   */
  static verifyCookie(signedValue: string, secret?: string): string | null {
    const cookieSecret = secret || process.env.COOKIE_SECRET || 'cookie-signing-secret';
    const [value, signature] = signedValue.split('.');
    
    if (!value || !signature) {
      return null;
    }

    const expectedSignature = crypto
      .createHmac('sha256', cookieSecret)
      .update(value)
      .digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    return value;
  }

  /**
   * Generate CSRF token
   */
  static generateCSRFToken(): string {
    return crypto.randomBytes(24).toString('base64url');
  }

  /**
   * Validate token format
   */
  static isValidTokenFormat(token: string): boolean {
    // JWT tokens have 3 parts separated by dots
    const parts = token.split('.');
    return parts.length === 3 && parts.every(part => part.length > 0);
  }

  /**
   * Generate time-limited one-time code (for 2FA, etc.)
   */
  static generateTimeCode(length: number = 6, expiresInMs: number = 5 * 60 * 1000): { code: string; expires: Date } {
    const characters = '0123456789';
    let code = '';
    
    for (let i = 0; i < length; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    const expires = new Date(Date.now() + expiresInMs);
    
    return { code, expires };
  }

  /**
   * Verify time-limited code
   */
  static verifyTimeCode(providedCode: string, storedCode: string, expires: Date): boolean {
    if (Date.now() > expires.getTime()) {
      return false;
    }
    
    return crypto.timingSafeEqual(
      Buffer.from(providedCode),
      Buffer.from(storedCode)
    );
  }
}

// Rate limiting token bucket
export class TokenBucket {
  private tokens: number;
  private lastRefill: number;
  
  constructor(
    private capacity: number,
    private refillRate: number, // tokens per second
    private refillInterval: number = 1000 // milliseconds
  ) {
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }
  
  consume(tokensRequested: number = 1): boolean {
    this.refill();
    
    if (this.tokens >= tokensRequested) {
      this.tokens -= tokensRequested;
      return true;
    }
    
    return false;
  }
  
  private refill(): void {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd = Math.floor(timePassed / this.refillInterval) * this.refillRate;
    
    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
      this.lastRefill = now;
    }
  }
  
  getAvailableTokens(): number {
    this.refill();
    return this.tokens;
  }
}

// Token blacklist for logout functionality
export class TokenBlacklist {
  private static blacklistedTokens = new Set<string>();
  
  static blacklistToken(token: string): void {
    // Extract token ID or use the full token
    const tokenId = this.extractTokenId(token);
    this.blacklistedTokens.add(tokenId);
    
    // Clean up expired tokens periodically
    if (this.blacklistedTokens.size > 10000) {
      this.cleanup();
    }
  }
  
  static isBlacklisted(token: string): boolean {
    const tokenId = this.extractTokenId(token);
    return this.blacklistedTokens.has(tokenId);
  }
  
  private static extractTokenId(token: string): string {
    // For JWT, we can use the signature part as ID
    const parts = token.split('.');
    return parts[2] || token;
  }
  
  private static cleanup(): void {
    // In production, this should be stored in Redis with TTL
    // For now, we'll just clear old entries if size gets too big
    if (this.blacklistedTokens.size > 50000) {
      this.blacklistedTokens.clear();
    }
  }
  
  static getBlacklistSize(): number {
    return this.blacklistedTokens.size;
  }
}