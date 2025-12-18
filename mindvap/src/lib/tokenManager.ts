// JWT Token Management System
// Handles access tokens, refresh tokens, and session management

export interface JWTPayload {
  sub: string;           // User ID
  email: string;
  role: string;
  iat: number;
  exp: number;
  jti: string;           // JWT ID for refresh tracking
  device: string;        // Device fingerprint
  sessionId: string;     // Session ID
  type: 'access' | 'refresh';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface TokenValidationResult {
  valid: boolean;
  payload?: JWTPayload;
  error?: string;
}

export class TokenManager {
  private static readonly ACCESS_TOKEN_SECRET = import.meta.env.VITE_JWT_ACCESS_SECRET || 'fallback-access-secret';
  private static readonly REFRESH_TOKEN_SECRET = import.meta.env.VITE_JWT_REFRESH_SECRET || 'fallback-refresh-secret';
  private static readonly ACCESS_TOKEN_EXPIRY = parseInt(import.meta.env.VITE_JWT_ACCESS_EXPIRY || '900'); // 15 minutes
  private static readonly REFRESH_TOKEN_EXPIRY = parseInt(import.meta.env.VITE_JWT_REFRESH_EXPIRY || '604800'); // 7 days

  /**
   * Generate a new access token
   */
  static async generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp' | 'jti' | 'type'>): Promise<{
    token: string;
    expiresIn: number;
  }> {
    try {
      const jti = this.generateJTI();
      const now = Math.floor(Date.now() / 1000);
      const exp = now + this.ACCESS_TOKEN_EXPIRY;

      const tokenPayload: JWTPayload = {
        ...payload,
        iat: now,
        exp,
        jti,
        type: 'access'
      };

      const token = await this.signToken(tokenPayload, this.ACCESS_TOKEN_SECRET);
      
      return {
        token,
        expiresIn: this.ACCESS_TOKEN_EXPIRY
      };
    } catch (error) {
      console.error('Failed to generate access token:', error);
      throw new Error('Failed to generate access token');
    }
  }

  /**
   * Generate a new refresh token
   */
  static async generateRefreshToken(payload: {sub: string; sessionId: string}): Promise<{
    token: string;
    expiresIn: number;
  }> {
    try {
      const now = Math.floor(Date.now() / 1000);
      const exp = now + this.REFRESH_TOKEN_EXPIRY;

      const tokenPayload: JWTPayload = {
        sub: payload.sub,
        email: '', // Will be filled when used
        role: '',
        iat: now,
        exp,
        jti: this.generateJTI(),
        device: '',
        sessionId: payload.sessionId,
        type: 'refresh'
      };

      const token = await this.signToken(tokenPayload, this.REFRESH_TOKEN_SECRET);
      
      return {
        token,
        expiresIn: this.REFRESH_TOKEN_EXPIRY
      };
    } catch (error) {
      console.error('Failed to generate refresh token:', error);
      throw new Error('Failed to generate refresh token');
    }
  }

  /**
   * Verify and decode an access token
   */
  static async verifyAccessToken(token: string): Promise<TokenValidationResult> {
    try {
      const payload = await this.verifyToken(token, this.ACCESS_TOKEN_SECRET) as JWTPayload;
      
      if (payload.type !== 'access') {
        return {
          valid: false,
          error: 'Invalid token type'
        };
      }

      // Check if token is expired
      if (payload.exp < Math.floor(Date.now() / 1000)) {
        return {
          valid: false,
          error: 'Token has expired'
        };
      }

      return {
        valid: true,
        payload
      };
    } catch (error) {
      return {
        valid: false,
        error: 'Invalid or malformed token'
      };
    }
  }

  /**
   * Verify and decode a refresh token
   */
  static async verifyRefreshToken(token: string): Promise<TokenValidationResult> {
    try {
      const payload = await this.verifyToken(token, this.REFRESH_TOKEN_SECRET) as JWTPayload;
      
      if (payload.type !== 'refresh') {
        return {
          valid: false,
          error: 'Invalid token type'
        };
      }

      // Check if token is expired
      if (payload.exp < Math.floor(Date.now() / 1000)) {
        return {
          valid: false,
          error: 'Refresh token has expired'
        };
      }

      return {
        valid: true,
        payload
      };
    } catch (error) {
      return {
        valid: false,
        error: 'Invalid or malformed refresh token'
      };
    }
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authHeader: string | null): string | null {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }

  /**
   * Check if token needs refresh (within threshold)
   */
  static async shouldRefreshToken(token: string, thresholdMinutes: number = 5): Promise<boolean> {
    try {
      const payload = await this.verifyToken(token, this.ACCESS_TOKEN_SECRET) as JWTPayload;
      const now = Math.floor(Date.now() / 1000);
      const threshold = thresholdMinutes * 60;
      
      return (payload.exp - now) < threshold;
    } catch (error) {
      return true; // If we can't verify, assume it needs refresh
    }
  }

  /**
   * Generate a device fingerprint for tracking
   */
  static async generateDeviceFingerprint(userAgent: string, screenResolution?: string, timezone?: string): Promise<string> {
    const components = [
      userAgent,
      screenResolution || '',
      timezone || '',
      navigator?.platform || '',
      navigator?.language || ''
    ].join('|');
    
    try {
      // Use the static method directly
      return await TokenManager.hashString(components);
    } catch (error) {
      console.error('Failed to generate device fingerprint, using fallback:', error);
      // Fallback to simple hash if crypto API fails
      return TokenManager.simpleHash(components);
    }
  }

  /**
   * Simple fallback hash function when crypto API is not available
   */
  private static simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Create a session ID
   */
  static generateSessionId(): string {
    return crypto.randomUUID();
  }

  /**
   * Validate session data
   */
  static validateSessionData(accessPayload: JWTPayload, refreshPayload: JWTPayload): boolean {
    return (
      accessPayload.sub === refreshPayload.sub &&
      accessPayload.sessionId === refreshPayload.sessionId &&
      accessPayload.jti !== refreshPayload.jti // Different JWT IDs
    );
  }

  /**
   * Get token expiration time in milliseconds
   */
  static getTokenExpirationTime(exp: number): number {
    return exp * 1000; // Convert to milliseconds
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(exp: number): boolean {
    return exp < Math.floor(Date.now() / 1000);
  }

  /**
   * Get time until token expiration
   */
  static getTimeUntilExpiration(exp: number): number {
    return Math.max(0, (exp * 1000) - Date.now());
  }

  private static async signToken(payload: any, secret: string): Promise<string> {
    // In a real implementation, you would use the jsonwebtoken library
    // For now, we'll simulate JWT signing using Web Crypto API
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));
    
    const signatureInput = `${encodedHeader}.${encodedPayload}`;
    const signature = await this.generateHMAC(signatureInput, secret);
    
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  private static async verifyToken(token: string, secret: string): Promise<any> {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }

      const [encodedHeader, encodedPayload, signature] = parts;
      
      // Verify signature
      const signatureInput = `${encodedHeader}.${encodedPayload}`;
      const expectedSignature = await this.generateHMAC(signatureInput, secret);
      
      if (signature !== expectedSignature) {
        throw new Error('Invalid signature');
      }

      // Decode payload
      const payload = JSON.parse(this.base64UrlDecode(encodedPayload));
      return payload;
    } catch (error) {
      throw new Error('Token verification failed');
    }
  }

  private static generateJTI(): string {
    return crypto.randomUUID();
  }

  static async hashString(str: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    
    const buffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(buffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private static async generateHMAC(data: string, secret: string): Promise<string> {
    // Simulate HMAC generation
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(data);
    
    // In production, you would use crypto.subtle.importKey and crypto.subtle.sign
    // For now, we'll create a simple hash
    const combined = data + secret;
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(combined));
    
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private static base64UrlEncode(str: string): string {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const base64 = btoa(String.fromCharCode(...data));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  private static base64UrlDecode(str: string): string {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    
    return new TextDecoder().decode(bytes);
  }
}

// Export utility functions
export const generateAccessToken = TokenManager.generateAccessToken;
export const generateRefreshToken = TokenManager.generateRefreshToken;
export const verifyAccessToken = TokenManager.verifyAccessToken;
export const verifyRefreshToken = TokenManager.verifyRefreshToken;
export const extractTokenFromHeader = TokenManager.extractTokenFromHeader;
export const shouldRefreshToken = TokenManager.shouldRefreshToken;
export const generateDeviceFingerprint = TokenManager.generateDeviceFingerprint;
export const generateSessionId = TokenManager.generateSessionId;