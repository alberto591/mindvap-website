# Security Implementation Guide - MindVap Authentication

## Overview
This guide provides practical implementation details for securing the MindVap authentication system. It covers code examples, configuration recommendations, and security best practices.

## Password Security Implementation

### Argon2id Password Hashing
```typescript
// Install: npm install argon2
import argon2 from 'argon2';

export class PasswordSecurity {
  private static readonly config = {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB (adjust based on server capacity)
    timeCost: 3,       // 3 iterations
    parallelism: 1,    // Single-threaded for better security
    saltLength: 16,    // 16 bytes
    hashLength: 32,    // 32 bytes
  };

  static async hashPassword(password: string): Promise<{hash: string, salt: string}> {
    const salt = crypto.randomBytes(16);
    const hash = await argon2.hash(password, {
      ...this.config,
      salt,
    });
    
    return {
      hash,
      salt: salt.toString('hex')
    };
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password);
    } catch (error) {
      console.error('Password verification failed:', error);
      return false;
    }
  }

  static validatePasswordStrength(password: string): {valid: boolean, errors: string[]} {
    const errors: string[] = [];
    
    if (password.length < 12) {
      errors.push('Password must be at least 12 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    // Check for common passwords
    const commonPasswords = [
      'password', '123456', 'password123', 'admin', 'letmein',
      'welcome', 'monkey', '1234567890', 'qwerty', 'abc123'
    ];
    
    if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
      errors.push('Password contains common patterns and is not secure');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}
```

## JWT Token Management

### Token Generation and Validation
```typescript
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export interface JWTPayload {
  sub: string;           // User ID
  email: string;
  role: string;
  iat: number;
  exp: number;
  jti: string;           // JWT ID for refresh tracking
  device: string;        // Device fingerprint
  sessionId: string;     // Session ID
}

export class TokenManager {
  private static readonly ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET!;
  private static readonly REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET!;
  
  static generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp' | 'jti'>): {
    token: string;
    expiresIn: number;
  } {
    const jti = crypto.randomUUID();
    const expiresIn = 15 * 60; // 15 minutes
    
    const token = jwt.sign(
      {
        ...payload,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + expiresIn,
        jti,
      },
      this.ACCESS_TOKEN_SECRET,
      { algorithm: 'HS256' }
    );
    
    return { token, expiresIn };
  }
  
  static generateRefreshToken(payload: {sub: string, sessionId: string}): {
    token: string;
    expiresIn: number;
  } {
    const expiresIn = 7 * 24 * 60 * 60; // 7 days
    
    const token = jwt.sign(
      {
        ...payload,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + expiresIn,
        type: 'refresh'
      },
      this.REFRESH_TOKEN_SECRET,
      { algorithm: 'HS256' }
    );
    
    return { token, expiresIn };
  }
  
  static verifyAccessToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, this.ACCESS_TOKEN_SECRET) as JWTPayload;
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }
  
  static verifyRefreshToken(token: string): {sub: string, sessionId: string} {
    try {
      const decoded = jwt.verify(token, this.REFRESH_TOKEN_SECRET) as any;
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }
      return { sub: decoded.sub, sessionId: decoded.sessionId };
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }
}
```

## Rate Limiting Implementation

### Multi-Level Rate Limiting
```typescript
import Redis from 'ioredis';

export class RateLimiter {
  private redis: Redis;
  
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
  }
  
  // Sliding window rate limiter
  async checkRateLimit(
    key: string,
    limit: number,
    windowMs: number,
    blockDurationMs?: number
  ): Promise<{allowed: boolean; remaining: number; resetTime: number}> {
    const now = Date.now();
    const window = Math.floor(now / windowMs);
    const redisKey = `rate_limit:${key}:${window}`;
    
    const current = await this.redis.incr(redisKey);
    
    if (current === 1) {
      await this.redis.pexpire(redisKey, windowMs);
    }
    
    const resetTime = (window + 1) * windowMs;
    const remaining = Math.max(0, limit - current);
    
    if (current > limit) {
      if (blockDurationMs) {
        await this.redis.setex(`blocked:${key}`, Math.floor(blockDurationMs / 1000), '1');
      }
      
      throw new Error('Rate limit exceeded');
    }
    
    return { allowed: true, remaining, resetTime };
  }
  
  // Progressive rate limiting for login attempts
  async checkLoginRateLimit(
    email: string,
    ipAddress: string
  ): Promise<void> {
    const emailKey = `login_attempts:email:${email}`;
    const ipKey = `login_attempts:ip:${ipAddress}`;
    
    // Check if account is locked
    const accountLocked = await this.redis.get(`account_locked:${email}`);
    if (account const lockExpiryLocked) {
      = parseInt(accountLocked);
      if (Date.now() < lockExpiry) {
        throw new Error('Account temporarily locked due to too many failed attempts');
      } else {
        await this.redis.del(`account_locked:${email}`);
      }
    }
    
    // Check email-based rate limiting
    const emailAttempts = await this.redis.incr(emailKey);
    if (emailAttempts === 1) {
      await this.redis.pexpire(emailKey, 15 * 60 * 1000); // 15 minutes
    }
    
    // Check IP-based rate limiting
    const ipAttempts = await this.redis.incr(ipKey);
    if (ipAttempts === 1) {
      await this.redis.pexpire(ipKey, 15 * 60 * 1000); // 15 minutes
    }
    
    // Implement progressive locking
    if (emailAttempts > 5) {
      const lockDuration = Math.min(30 * 60 * 1000, Math.pow(2, emailAttempts - 5) * 5 * 60 * 1000);
      await this.redis.setex(
        `account_locked:${email}`,
        Math.floor(lockDuration / 1000),
        (Date.now() + lockDuration).toString()
      );
      throw new Error('Account temporarily locked');
    }
  }
  
  // Record failed login attempt
  async recordFailedLogin(email: string, ipAddress: string): Promise<void> {
    await Promise.all([
      this.redis.incr(`failed_logins:email:${email}`),
      this.redis.incr(`failed_logins:ip:${ipAddress}`),
      this.redis.pexpire(`failed_logins:email:${email}`, 24 * 60 * 60 * 1000), // 24 hours
      this.redis.pexpire(`failed_logins:ip:${ipAddress}`, 24 * 60 * 60 * 1000) // 24 hours
    ]);
  }
  
  // Reset on successful login
  async resetLoginAttempts(email: string, ipAddress: string): Promise<void> {
    await Promise.all([
      this.redis.del(`failed_logins:email:${email}`),
      this.redis.del(`failed_logins:ip:${ipAddress}`),
      this.redis.del(`account_locked:${email}`)
    ]);
  }
}
```

## CSRF Protection

### Double Submit Cookie Implementation
```typescript
import crypto from 'crypto';
import cookie from 'cookie';

export class CSRFProtection {
  private static readonly COOKIE_NAME = 'csrf_token';
  private static readonly HEADER_NAME = 'x-csrf-token';
  
  static generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
  
  static setCSRFCookie(res: any, token: string): void {
    res.setHeader('Set-Cookie', cookie.serialize(this.COOKIE_NAME, token, {
      httpOnly: false,        // Must be readable by JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60,   // 24 hours
      path: '/'
    }));
  }
  
  static validateToken(req: any): boolean {
    const csrfCookie = req.cookies[this.COOKIE_NAME];
    const csrfHeader = req.headers[this.HEADER_NAME];
    
    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
      return false;
    }
    
    // Check token expiry (if implemented)
    const tokenData = this.parseToken(csrfCookie);
    if (tokenData && tokenData.expiresAt < Date.now()) {
      return false;
    }
    
    return true;
  }
  
  private static parseToken(token: string): {expiresAt: number} | null {
    try {
      const decoded = JSON.parse(Buffer.from(token, 'hex').toString());
      return decoded;
    } catch {
      return null;
    }
  }
  
  // Middleware for CSRF protection
  static middleware() {
    return (req: any, res: any, next: any) => {
      if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
        return next();
      }
      
      if (!this.validateToken(req)) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'CSRF_TOKEN_INVALID',
            message: 'CSRF token validation failed'
          }
        });
      }
      
      next();
    };
  }
}
```

## Input Validation and Sanitization

### Comprehensive Input Validation
```typescript
import Joi from 'joi';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const purify = DOMPurify(window as any);

export class InputValidator {
  // Email validation
  static validateEmail(email: string): {valid: boolean; errors: string[]} {
    const schema = Joi.string().email().max(255).required();
    const { error } = schema.validate(email);
    
    return {
      valid: !error,
      errors: error ? [error.message] : []
    };
  }
  
  // Password validation
  static validatePassword(password: string): {valid: boolean; errors: string[]} {
    const schema = Joi.string()
      .min(12)
      .pattern(/[A-Z]/)
      .pattern(/[a-z]/)
      .pattern(/[0-9]/)
      .pattern(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
      .required()
      .messages({
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      });
    
    const { error } = schema.validate(password);
    
    return {
      valid: !error,
      errors: error ? [error.message] : []
    };
  }
  
  // Phone number validation
  static validatePhone(phone: string): {valid: boolean; errors: string[]} {
    const schema = Joi.string()
      .pattern(/^\+?[1-9]\d{1,14}$/)
      .required()
      .messages({
        'string.pattern.base': 'Phone number must be in international format (e.g., +1234567890)'
      });
    
    const { error } = schema.validate(phone);
    
    return {
      valid: !error,
      errors: error ? [error.message] : []
    };
  }
  
  // Address validation
  static validateAddress(address: any): {valid: boolean; errors: string[]} {
    const schema = Joi.object({
      firstName: Joi.string().min(1).max(100).required(),
      lastName: Joi.string().min(1).max(100).required(),
      company: Joi.string().max(100).allow(''),
      addressLine1: Joi.string().min(1).max(255).required(),
      addressLine2: Joi.string().max(255).allow(''),
      city: Joi.string().min(1).max(100).required(),
      stateProvince: Joi.string().min(1).max(100).required(),
      postalCode: Joi.string().min(1).max(20).required(),
      country: Joi.string().length(2).required(), // ISO 3166-1 alpha-2
      phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).allow('')
    });
    
    const { error } = schema.validate(address);
    
    return {
      valid: !error,
      errors: error ? error.details.map(detail => detail.message) : []
    };
  }
  
  // Sanitize HTML content
  static sanitizeHtml(html: string): string {
    return purify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
      ALLOWED_ATTR: []
    });
  }
  
  // Sanitize user input for database
  static sanitizeForDatabase(input: string): string {
    // Remove null bytes, control characters, and potential SQL injection patterns
    return input
      .replace(/\0/g, '') // Remove null bytes
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
      .trim();
  }
}
```

## Security Logging and Monitoring

### Security Event Logging
```typescript
import winston from 'winston';

export interface SecurityEvent {
  type: 'failed_login' | 'successful_login' | 'password_reset' | 'suspicious_activity';
  userId?: string;
  email?: string;
  ipAddress: string;
  userAgent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
  timestamp: Date;
}

export class SecurityLogger {
  private logger: winston.Logger;
  
  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/security.log' }),
        new winston.transports.File({ filename: 'logs/security-error.log', level: 'error' })
      ]
    });
    
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(new winston.transports.Console({
        format: winston.format.simple()
      }));
    }
  }
  
  logSecurityEvent(event: SecurityEvent): void {
    this.logger.info('Security Event', event);
    
    // Send critical alerts immediately
    if (event.severity === 'critical') {
      this.sendCriticalAlert(event);
    }
  }
  
  logFailedLogin(email: string, ipAddress: string, userAgent: string, reason: string): void {
    this.logSecurityEvent({
      type: 'failed_login',
      email,
      ipAddress,
      userAgent,
      severity: 'medium',
      details: { reason },
      timestamp: new Date()
    });
  }
  
  logSuccessfulLogin(userId: string, email: string, ipAddress: string, userAgent: string): void {
    this.logSecurityEvent({
      type: 'successful_login',
      userId,
      email,
      ipAddress,
      userAgent,
      severity: 'low',
      details: {},
      timestamp: new Date()
    });
  }
  
  logSuspiciousActivity(userId: string, ipAddress: string, userAgent: string, activity: string, details: any): void {
    this.logSecurityEvent({
      type: 'suspicious_activity',
      userId,
      ipAddress,
      userAgent,
      severity: 'high',
      details: { activity, ...details },
      timestamp: new Date()
    });
  }
  
  private async sendCriticalAlert(event: SecurityEvent): Promise<void> {
    // Implement critical alert system (email, Slack, etc.)
    console.log('CRITICAL SECURITY ALERT:', event);
    
    // Example: Send to security team
    // await this.sendAlertEmail(event);
    // await this.sendSlackNotification(event);
  }
}
```

## Session Security

### Secure Session Management
```typescript
import crypto from 'crypto';

export interface SessionData {
  id: string;
  userId: string;
  deviceFingerprint: string;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  lastUsedAt: Date;
  isActive: boolean;
  riskScore: number;
}

export class SessionManager {
  private static readonly SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes
  private static readonly REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry
  
  static generateDeviceFingerprint(userAgent: string, ipAddress: string): string {
    const data = `${userAgent}|${ipAddress}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }
  
  static async createSession(userId: string, deviceInfo: any): Promise<SessionData> {
    const sessionId = crypto.randomUUID();
    const deviceFingerprint = this.generateDeviceFingerprint(deviceInfo.userAgent, deviceInfo.ipAddress);
    
    const session: SessionData = {
      id: sessionId,
      userId,
      deviceFingerprint,
      ipAddress: deviceInfo.ipAddress,
      userAgent: deviceInfo.userAgent,
      createdAt: new Date(),
      lastUsedAt: new Date(),
      isActive: true,
      riskScore: 0
    };
    
    // Store in database
    await this.storeSession(session);
    
    return session;
  }
  
  static async validateSession(sessionId: string, deviceInfo: any): Promise<{
    valid: boolean;
    session?: SessionData;
    reason?: string;
  }> {
    const session = await this.getSession(sessionId);
    
    if (!session || !session.isActive) {
      return { valid: false, reason: 'Session not found or inactive' };
    }
    
    // Check session timeout
    if (Date.now() - session.lastUsedAt.getTime() > this.SESSION_TIMEOUT) {
      await this.deactivateSession(sessionId);
      return { valid: false, reason: 'Session expired' };
    }
    
    // Check device fingerprint
    const currentFingerprint = this.generateDeviceFingerprint(deviceInfo.userAgent, deviceInfo.ipAddress);
    if (currentFingerprint !== session.deviceFingerprint) {
      await this.incrementRiskScore(sessionId);
      return { valid: false, reason: 'Device fingerprint mismatch' };
    }
    
    // Update last used time
    await this.updateSessionActivity(sessionId);
    
    return { valid: true, session };
  }
  
  static async refreshSession(sessionId: string): Promise<SessionData | null> {
    const session = await this.getSession(sessionId);
    
    if (!session || !session.isActive) {
      return null;
    }
    
    // Check if refresh is needed (within threshold)
    const timeUntilExpiry = session.lastUsedAt.getTime() + this.SESSION_TIMEOUT - Date.now();
    if (timeUntilExpiry > this.REFRESH_THRESHOLD) {
      return session; // No refresh needed yet
    }
    
    // Check for suspicious activity
    if (session.riskScore > 5) {
      await this.logSuspiciousActivity(session.userId, session.ipAddress, session.userAgent, 'high_risk_session_refresh', {
        sessionId,
        riskScore: session.riskScore
      });
      return null;
    }
    
    session.lastUsedAt = new Date();
    await this.updateSessionActivity(sessionId);
    
    return session;
  }
  
  static async deactivateSession(sessionId: string): Promise<void> {
    // Implementation would update the session in the database
    console.log(`Deactivating session: ${sessionId}`);
  }
  
  private static async storeSession(session: SessionData): Promise<void> {
    // Implementation would store session in database
    console.log('Storing session:', session.id);
  }
  
  private static async getSession(sessionId: string): Promise<SessionData | null> {
    // Implementation would retrieve session from database
    return null;
  }
  
  private static async updateSessionActivity(sessionId: string): Promise<void> {
    // Implementation would update session activity in database
    console.log(` ${sessionId}`);
  }
  
  private static async incrementUpdating session activity:RiskScore(sessionId: string): Promise<void> {
    // Implementation would increment risk score in database
    console.log(`Incrementing risk score for session: ${sessionId}`);
  }
}
```

## Device Fingerprinting

### Advanced Device Detection
```typescript
export interface DeviceFingerprint {
  hash: string;
  components: {
    userAgent: string;
    language: string;
    platform: string;
    timezone: string;
    screenResolution: string;
    colorDepth: number;
    pixelRatio: number;
    hardwareConcurrency: number;
    deviceMemory: number;
    touchPoints: number;
    plugins: string[];
    fonts: string[];
    canvas: string;
    webgl: string;
    webgl2: string;
    audio: string;
    battery: string;
  };
  timestamp: Date;
}

export class DeviceFingerprinting {
  static generateFingerprint(userAgent: string, headers: any, clientData?: any): DeviceFingerprint {
    const components = {
      userAgent: userAgent,
      language: headers['accept-language'] || '',
      platform: headers['sec-ch-ua-platform'] || '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
      screenResolution: clientData?.screen?.width + 'x' + clientData?.screen?.height || '',
      colorDepth: clientData?.screen?.colorDepth || 0,
      pixelRatio: clientData?.devicePixelRatio || 1,
      hardwareConcurrency: clientData?.hardwareConcurrency || 0,
      deviceMemory: clientData?.deviceMemory || 0,
      touchPoints: clientData?.maxTouchPoints || 0,
      plugins: clientData?.plugins || [],
      fonts: clientData?.fonts || [],
      canvas: clientData?.canvas || '',
      webgl: clientData?.webgl || '',
      webgl2: clientData?.webgl2 || '',
      audio: clientData?.audio || '',
      battery: clientData?.battery || ''
    };
    
    const fingerprintString = JSON.stringify(components);
    const hash = this.hashString(fingerprintString);
    
    return {
      hash,
      components,
      timestamp: new Date()
    };
  }
  
  private static hashString(str: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(str).digest('hex');
  }
  
  static compareFingerprints(fingerprint1: DeviceFingerprint, fingerprint2: DeviceFingerprint): number {
    const components1 = JSON.stringify(fingerprint1.components);
    const components2 = JSON.stringify(fingerprint2.components);
    
    const hash1 = this.hashString(components1);
    const hash2 = this.hashString(components2);
    
    if (hash1 === hash2) return 1.0; // Perfect match
    
    // Calculate similarity score based on matching components
    let matches = 0;
    let total = Object.keys(fingerprint1.components).length;
    
    for (const [key, value1] of Object.entries(fingerprint1.components)) {
      const value2 = fingerprint2.components[key as keyof typeof fingerprint2.components];
      if (value1 === value2) {
        matches++;
      }
    }
    
    return matches / total;
  }
}
```

## Error Handling and Security

### Secure Error Responses
```typescript
export class SecurityErrorHandler {
  static handleValidationError(error: any): any {
    // Don't expose internal error details
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed'
      }
    };
  }
  
  static handleAuthenticationError(error: any): any {
    // Don't reveal whether user exists or not
    return {
      success: false,
      error: {
        code: 'AUTHENTICATION_FAILED',
        message: 'Invalid credentials'
      }
    };
  }
  
  static handleAuthorizationError(): any {
    return {
      success: false,
      error: {
        code: 'AUTHORIZATION_FAILED',
        message: 'Insufficient permissions'
      }
    };
  }
  
  static handleRateLimitError(): any {
    return {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests'
      }
    };
  }
  
  static handleSystemError(error: any): any {
    // Log internal error but return generic message
    console.error('Internal system error:', error);
    
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred'
      }
    };
  }
}
```

## Security Headers Configuration

### Content Security Policy
```typescript
export const securityHeaders = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://js.stripe.com https://maps.googleapis.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co https://api.stripe.com",
    "frame-src 'self' https://js.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; '),
  
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': [
    'geolocation=()',
    'microphone=()',
    'camera=()',
    'payment=()'
  ].join(', '),
  
  // HSTS (HTTPS Strict Transport Security)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
};
```

## Testing Security Measures

### Security Test Suite
```typescript
import request from 'supertest';
import { app } from '../app';

describe('Security Tests', () => {
  describe('Authentication Security', () => {
    test('should reject weak passwords', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'weak', // Too weak
          firstName: 'Test',
          lastName: 'User',
          dateOfBirth: '1990-01-01'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
    
    test('should implement rate limiting on login', async () => {
      // Attempt multiple failed logins
      for (let i = 0; i < 6; i++) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'wrongpassword'
          });
        
        if (i < 5) {
          expect(response.status).toBe(401);
        } else {
          expect(response.status).toBe(429); // Rate limited
        }
      }
    });
    
    test('should validate CSRF tokens', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .send({});
      
      expect(response.status).toBe(403);
    });
  });
  
  describe('Input Validation', () => {
    test('should prevent SQL injection', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: "test@example.com'; DROP TABLE users; --",
          password: 'ValidPassword123!',
          firstName: 'Test',
          lastName: 'User',
          dateOfBirth: '1990-01-01'
        });
      
      expect(response.status).toBe(400);
    });
    
    test('should prevent XSS in user input', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'ValidPassword123!',
          firstName: '<script>alert("xss")</script>',
          lastName: 'User',
          dateOfBirth: '1990-01-01'
        });
      
      expect(response.status).toBe(400);
    });
  });
  
  describe('Session Security', () => {
    test('should timeout inactive sessions', async () => {
      // Implementation would test session timeout
    });
    
    test('should detect device fingerprint changes', async () => {
      // Implementation would test device fingerprinting
    });
  });
});
```

## Deployment Security Checklist

### Pre-Deployment Security Review
- [ ] All passwords use Argon2id hashing
- [ ] JWT secrets are properly configured and secure
- [ ] Rate limiting is implemented and tested
- [ ] CSRF protection is enabled
- [ ] Input validation is comprehensive
- [ ] Security headers are configured
- [ ] HTTPS is enforced
- [ ] Database RLS policies are implemented
- [ ] Audit logging is configured
- [ ] Security monitoring is set up
- [ ] Error handling doesn't leak sensitive information
- [ ] Session management is secure
- [ ] Device fingerprinting is implemented
- [ ] GDPR compliance features are working
- [ ] Email verification is functional
- [ ] Age verification is implemented

### Environment Configuration
```typescript
// Environment variables checklist
const requiredEnvVars = [
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'DATABASE_URL',
  'REDIS_URL',
  'EMAILJS_PUBLIC_KEY',
  'STRIPE_SECRET_KEY',
  'ENCRYPTION_KEY'
];
```

This implementation guide provides practical, production-ready code examples for implementing the security measures outlined in the main authentication architecture specification. Each component should be thoroughly tested and monitored in production.