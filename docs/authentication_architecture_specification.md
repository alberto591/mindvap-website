# MindVap Authentication Architecture Specification

## Executive Summary

This document outlines a comprehensive authentication architecture for MindVap, an e-commerce website selling vaping herbs. The architecture prioritizes security, GDPR compliance, and user experience while integrating seamlessly with the existing React/TypeScript/Vite frontend, Supabase backend, Stripe payments, and EmailJS email services.

**Key Design Principles:**
- Security-first approach with defense in depth
- GDPR and age verification compliance (21+ requirement for vaping products)
- Scalable and maintainable architecture
- Integration with existing tech stack
- Minimal friction for legitimate users
- Comprehensive audit trails and monitoring

## 1. Authentication Strategy Analysis

### 1.1 Authentication Approach Recommendation: JWT with Refresh Tokens

**Primary Recommendation: JWT with HTTP-Only Cookies and Refresh Token Rotation**

After analyzing modern authentication approaches for e-commerce, JWT with refresh tokens provides the optimal balance of security, scalability, and user experience.

#### Why JWT with Refresh Tokens?

**Advantages for E-commerce:**
- **Stateless and Scalable**: JWT tokens are self-contained, reducing database lookups
- **Cross-Domain Support**: Easy integration with microservices architecture
- **Mobile-Friendly**: Works well with mobile apps and API consumption
- **Granular Permissions**: Can embed user roles and permissions directly in tokens
- **Offline Capability**: Refresh tokens enable secure offline sessions

**Comparison with Alternatives:**

| Approach | Security | Scalability | User Experience | Complexity |
|----------|----------|-------------|-----------------|------------|
| JWT + Refresh Tokens | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Session-Based | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| OAuth 2.0 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| Magic Links | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

### 1.2 Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Supabase      │    │   EmailJS       │
│   (React/TS)    │    │   (Backend)      │    │   (Email)       │
│                 │    │                  │    │                 │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│ │Auth Context │ │◄──►│ │Auth Functions│ │◄──►│ │Email Service│ │
│ └─────────────┘ │    │ └──────────────┘ │    │ └─────────────┘ │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│ │Auth Pages   │ │    │ │Database      │ │    │ │Templates    │ │
│ └─────────────┘ │    │ │(Users, etc.) │ │    │ └─────────────┘ │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                       │
         │              ┌─────────▼─────────┐             │
         └──────────────►│  Security Layer   │◄────────────┘
                        │                   │
                        │ ┌───────────────┐ │
                        │ │Rate Limiting  │ │
                        │ │CSRF Protection│ │
                        │ │Input Validation│ │
                        │ └───────────────┘ │
                        └───────────────────┘
```

## 2. Security Architecture

### 2.1 Password Security

**Recommendation: Argon2id with OWASP Guidelines**

#### Password Hashing Strategy
```typescript
// Recommended configuration for Argon2id
const passwordConfig = {
  memoryCost: 65536, // 64 MB
  timeCost: 3,       // 3 iterations
  parallelism: 1,    // Single-threaded for memory-hardness
  saltLength: 16,    // 16 bytes random salt
  hashLength: 32     // 32 bytes output
};
```

**Why Argon2id?**
- **Memory-Hard**: Resistant to GPU/ASIC attacks
- **Three-Variant Design**: Uses all three modes (argon2i, argon2d, argon2id)
- **OWASP Recommended**: Latest OWASP guidelines recommend Argon2id
- **Future-Proof**: Designed to remain secure as computing power increases

**Alternative: bcrypt with High Cost Factor**
If Argon2id is not available:
```typescript
const bcryptConfig = {
  cost: 12,          // Adjust based on server performance
  saltLength: 16,    // 16 bytes random salt
  hashLength: 60     // bcrypt hash length
};
```

### 2.2 Rate Limiting Implementation

**Multi-Layer Rate Limiting Strategy**

#### 1. Login Attempt Rate Limiting
```typescript
const rateLimits = {
  login: {
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 5,                    // 5 attempts per window
    message: "Too many login attempts, please try again later"
  },
  passwordReset: {
    windowMs: 60 * 60 * 1000,  // 1 hour
    max: 3,                    // 3 reset requests per hour
    message: "Too many password reset requests"
  },
  registration: {
    windowMs: 60 * 60 * 1000,  // 1 hour
    max: 3,                    // 3 registrations per hour per IP
    message: "Too many registration attempts"
  }
};
```

#### 2. Progressive Rate Limiting
- **Soft Limit**: Warning after 3 attempts
- **Hard Limit**: Block after 5 attempts
- **Cooldown Period**: Exponential backoff (5min, 15min, 1hr, 24hr)
- **Account Lockout**: Temporary lock after multiple violations

### 2.3 CSRF Protection

**Implementation: Double Submit Cookie Pattern**

```typescript
// CSRF Token Generation and Validation
const generateCSRFToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const setCSRFCookie = (res, token) => {
  res.cookie('csrf_token', token, {
    httpOnly: false,        // Must be readable by JavaScript
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000  // 24 hours
  });
};

// Middleware to validate CSRF token
const validateCSRF = (req, res, next) => {
  const csrfCookie = req.cookies.csrf_token;
  const csrfHeader = req.headers['x-csrf-token'];
  
  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return res.status(403).json({ error: 'CSRF token invalid' });
  }
  next();
};
```

### 2.4 XSS Prevention

**Content Security Policy (CSP) Implementation**

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://js.stripe.com;
               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
               img data: https:-src 'self';
               connect-src 'self' https://api.stripe.com https://*.supabase.co;
               font-src 'self' https://fonts.gstatic.com;">
```

**Additional XSS Protections:**
- **Input Sanitization**: Sanitize all user inputs using DOMPurify
- **Output Encoding**: Encode output based on context (HTML, URL, JS, CSS)
- **HTTPOnly Cookies**: Prevent access to session cookies via JavaScript
- **Strict Transport Security**: Force HTTPS connections

### 2.5 SQL Injection Prevention

**Parameterized Queries with Supabase**

```typescript
// Use Supabase's built-in parameterized queries
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('email', email)  // Parameterized automatically
  .single();

// Avoid string concatenation
// ❌ DON'T: `SELECT * FROM users WHERE email = '${email}'`
// ✅ DO: Use Supabase's query builder with proper parameters
```

## 3. Database Design

### 3.1 Core Tables Schema

#### 3.1.1 Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    password_salt VARCHAR(255) NOT NULL,
    password_algo VARCHAR(50) NOT NULL DEFAULT 'argon2id',
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE NOT NULL,
    age_verified BOOLEAN DEFAULT FALSE,
    age_verified_at TIMESTAMPTZ,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    email_verification_expires TIMESTAMPTZ,
    email_verified_at TIMESTAMPTZ,
    marketing_consent BOOLEAN DEFAULT FALSE,
    marketing_consent_at TIMESTAMPTZ,
    terms_accepted BOOLEAN DEFAULT FALSE,
    terms_accepted_at TIMESTAMPTZ,
    privacy_accepted BOOLEAN DEFAULT FALSE,
    privacy_accepted_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'active', -- active, suspended, deleted
    failed_login_attempts INTEGER DEFAULT 0,
    last_failed_login TIMESTAMPTZ,
    account_locked_until TIMESTAMPTZ,
    last_login TIMESTAMPTZ,
    password_changed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- GDPR Compliance Fields
    data_processing_consent BOOLEAN DEFAULT FALSE,
    data_processing_consent_at TIMESTAMPTZ,
    data_retention_period INTEGER DEFAULT 2555, -- 7 years in days
    deletion_requested_at TIMESTAMPTZ,
    deletion_scheduled_at TIMESTAMPTZ,
    deletion_completed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_deletion_scheduled ON users(deletion_scheduled_at);
```

#### 3.1.2 User Sessions Table
```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash VARCHAR(255) NOT NULL,
    refresh_token_expires TIMESTAMPTZ NOT NULL,
    device_fingerprint VARCHAR(255),
    user_agent TEXT,
    ip_address INET,
    location_country VARCHAR(2),
    location_city VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    last_used_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Security tracking
    suspicious_activity BOOLEAN DEFAULT FALSE,
    risk_score INTEGER DEFAULT 0
);

-- Indexes
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_refresh_token ON user_sessions(refresh_token_hash);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active, refresh_token_expires);
```

#### 3.1.3 User Addresses Table
```sql
CREATE TABLE user_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- billing, shipping, both
    is_default BOOLEAN DEFAULT FALSE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    company VARCHAR(100),
    address_line_1 VARCHAR(255) NOT NULL,
    address_line_2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state_province VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(2) NOT NULL, -- ISO 3166-1 alpha-2
    phone VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- GDPR compliance
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX idx_user_addresses_default ON user_addresses(user_id, is_default) WHERE is_default = TRUE;
```

#### 3.1.4 Login Attempts Log Table
```sql
CREATE TABLE login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    ip_address INET NOT NULL,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    failure_reason VARCHAR(100),
    risk_score INTEGER DEFAULT 0,
    location_country VARCHAR(2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for security monitoring
CREATE INDEX idx_login_attempts_email ON login_attempts(email, created_at);
CREATE INDEX idx_login_attempts_ip ON login_attempts(ip_address, created_at);
CREATE INDEX idx_login_attempts_failed ON login_attempts(success, created_at) WHERE success = FALSE;
```

#### 3.1.5 Password Reset Tokens Table
```sql
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_password_reset_token ON password_reset_tokens(token_hash);
CREATE INDEX idx_password_reset_user ON password_reset_tokens(user_id);
```

### 3.2 Security Considerations

#### 3.2.1 Row Level Security (RLS)
```sql
-- Enable RLS on all user-related tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Similar policies for other tables
```

#### 3.2.2 Audit Trail
```sql
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    table_name VARCHAR(100) NOT NULL,
    operation VARCHAR(10) NOT NULL, -- INSERT, UPDATE, DELETE
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 4. GDPR Compliance Requirements

### 4.1 Age Verification System

**Implementation: Multi-Step Age Verification**

#### Age Verification Flow
1. **Initial Age Gate**: 21+ confirmation required before site access
2. **Registration Verification**: Date of birth validation with document upload option
3. **Payment Verification**: Credit card age verification
4. **Ongoing Monitoring**: Regular re-verification for high-value customers

```typescript
interface AgeVerificationResult {
  verified: boolean;
  confidence: 'high' | 'medium' | 'low';
  method: 'self_attestation' | 'document_upload' | 'payment_verification';
  verifiedAt: Date;
  expiresAt?: Date;
}

const verifyAge = async (dateOfBirth: Date): Promise<AgeVerificationResult> => {
  const age = calculateAge(dateOfBirth);
  
  if (age >= 21) {
    return {
      verified: true,
      confidence: 'high',
      method: 'self_attestation',
      verifiedAt: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
    };
  }
  
  return {
    verified: false,
    confidence: 'low',
    method: 'self_attestation',
    verifiedAt: new Date()
  };
};
```

### 4.2 Privacy Policy and Terms Acceptance

**Tracking Consent with Audit Trail**

```typescript
interface ConsentRecord {
  userId: string;
  consentType: 'terms' | 'privacy' | 'marketing' | 'data_processing';
  version: string;
  accepted: boolean;
  acceptedAt: Date;
  ipAddress: string;
  userAgent: string;
}

const recordConsent = async (consent: ConsentRecord) => {
  await supabase.from('consent_records').insert({
    user_id: consent.userId,
    consent_type: consent.consentType,
    policy_version: consent.version,
    accepted: consent.accepted,
    accepted_at: consent.acceptedAt.toISOString(),
    ip_address: consent.ipAddress,
    user_agent: consent.userAgent
  });
};
```

### 4.3 Data Export/Deletion Capabilities

#### 4.3.1 Data Export System
```typescript
interface UserDataExport {
  personalInfo: {
    profile: UserProfile;
    addresses: Address[];
    orders: Order[];
  };
  activityLog: {
    loginHistory: LoginAttempt[];
    orders: Order[];
    preferences: UserPreferences;
  };
  metadata: {
    exportedAt: Date;
    exportVersion: string;
    dataRetentionPeriod: number;
  };
}

const exportUserData = async (userId: string): Promise<UserDataExport> => {
  const [profile, addresses, orders, loginHistory] = await Promise.all([
    getUserProfile(userId),
    getUserAddresses(userId),
    getUserOrders(userId),
    getLoginHistory(userId)
  ]);
  
  return {
    personalInfo: { profile, addresses, orders },
    activityLog: { loginHistory, orders, preferences: {} },
    metadata: {
      exportedAt: new Date(),
      exportVersion: '1.0',
      dataRetentionPeriod: 2555 // 7 years in days
    }
  };
};
```

#### 4.3.2 Right to Erasure (Right to be Forgotten)
```typescript
const deleteUserData = async (userId: string, reason: string) => {
  // 1. Schedule data deletion after 30-day grace period
  await supabase.from('users').update({
    deletion_requested_at: new Date().toISOString(),
    deletion_scheduled_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    deletion_reason: reason
  }).eq('id', userId);
  
  // 2. Immediately anonymize login data and sensitive information
  await supabase.from('users').update({
    email: `deleted_${userId}@mindvap.com`,
    first_name: 'Deleted',
    last_name: 'User',
    phone: null,
    date_of_birth: null
  }).eq('id', userId);
  
  // 3. Anonymize orders (keep for legal/tax purposes)
  await supabase.from('orders').update({
    customer_email: `deleted_${userId}@mindvap.com`
  }).eq('user_id', userId);
  
  // 4. Log the deletion request
  await supabase.from('audit_log').insert({
    user_id: userId,
    table_name: 'users',
    operation: 'DELETE_REQUEST',
    new_values: { reason, scheduled_for: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
  });
};
```

### 4.4 Email Opt-in/Opt-out Management

```typescript
interface EmailPreferences {
  userId: string;
  marketingEmails: boolean;
  orderUpdates: boolean;
  newsletter: boolean;
  abandonedCart: boolean;
  priceAlerts: boolean;
  lastUpdated: Date;
}

const updateEmailPreferences = async (preferences: EmailPreferences) => {
  await supabase.from('users').update({
    marketing_consent: preferences.marketingEmails,
    marketing_consent_at: preferences.lastUpdated.toISOString()
  }).eq('id', preferences.userId);
  
  // Log preference change
  await logEmailPreferenceChange(preferences);
};
```

## 5. Technical Architecture

### 5.1 Session Management Strategy

#### 5.1.1 JWT Token Structure
```typescript
interface JWTPayload {
  sub: string;           // User ID
  email: string;
  role: string;          // User role
  iat: number;           // Issued at
  exp: number;           // Expires at
  jti: string;           // JWT ID for refresh tracking
  device: string;        // Device fingerprint
  location: {            // Location data
    country: string;
    city: string;
  };
}
```

#### 5.1.2 Token Lifecycle Management
```typescript
const tokenConfig = {
  accessToken: {
    expiry: 15 * 60,     // 15 minutes
    issuer: 'mindvap.com',
    algorithm: 'HS256'
  },
  refreshToken: {
    expiry: 7 * 24 * 60 * 60, // 7 days
    rotationEnabled: true,     // Rotate on each use
    reuseDetection: true       // Detect token reuse (potential theft)
  }
};
```

#### 5.1.3 Secure Session Storage
- **Access Tokens**: HTTP-only, secure cookies
- **Refresh Tokens**: HTTP-only, secure cookies with rotation
- **Session Data**: Supabase database with RLS
- **Device Tracking**: Browser fingerprinting for additional security

### 5.2 Supabase Integration

#### 5.2.1 Authentication Functions
```typescript
// supabase/functions/auth/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, ...data } = await req.json()
    
    switch (action) {
      case 'register':
        return await handleRegistration(data)
      case 'login':
        return await handleLogin(data)
      case 'refresh':
        return await handleTokenRefresh(data)
      case 'logout':
        return await handleLogout(data)
      default:
        throw new Error('Invalid action')
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
```

#### 5.2.2 Row Level Security Policies
```sql
-- Users can only access their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Prevent deletion of user accounts (soft delete only)
CREATE POLICY "No direct user deletion" ON users
  FOR DELETE USING (false);

-- Sessions are user-specific
CREATE POLICY "Users can manage own sessions" ON user_sessions
  FOR ALL USING (auth.uid() = user_id);
```

### 5.3 API Endpoint Structure

#### 5.3.1 Authentication Endpoints
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
POST /api/auth/forgot-password
POST /api/auth/reset-password
POST /api/auth/verify-email
POST /api/auth/resend-verification

GET  /api/auth/profile
PUT  /api/auth/profile
PUT  /api/auth/change-password
POST /api/auth/update-email

GET  /api/auth/sessions
DELETE /api/auth/sessions/:id
DELETE /api/auth/sessions/all
```

#### 5.3.2 User Management Endpoints
```
GET    /api/user/addresses
POST   /api/user/addresses
PUT    /api/user/addresses/:id
DELETE /api/user/addresses/:id

GET  /api/user/preferences
PUT  /api/user/preferences

GET    /api/user/export-data
POST   /api/user/delete-account
POST   /api/user/age-verification
```

### 5.4 Frontend Authentication Flow

#### 5.4.1 React Context Provider
```typescript
// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '../types/auth';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateProfile: (data: ProfileUpdate) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize session from stored tokens
    initializeSession();
  }, []);

  const initializeSession = async () => {
    try {
      const storedSession = getStoredSession();
      if (storedSession && !isSessionExpired(storedSession)) {
        setSession(storedSession);
        setUser(storedSession.user);
      }
    } catch (error) {
      console.error('Session initialization failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      login,
      register,
      logout,
      refreshSession,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};
```

#### 5.4.2 Protected Route Component
```typescript
// src/components/ProtectedRoute.tsx
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAgeVerification?: boolean;
  requireEmailVerification?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAgeVerification = false,
  requireEmailVerification = false
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAgeVerification && !user.age_verified) {
    return <Navigate to="/age-verification" replace />;
  }

  if (requireEmailVerification && !user.email_verified) {
    return <Navigate to="/verify-email" replace />;
  }

  return <>{children}</>;
};
```

## 6. Email Integration with EmailJS

### 6.1 Authentication Email Templates

#### 6.1.1 Welcome Email Template
```html
<!-- EmailJS Template: template_welcome -->
Subject: Welcome to MindVap - Your Herbal Wellness Journey Begins

<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome to MindVap</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to MindVap</h1>
        <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your Premium Herbal Wellness Destination</p>
    </div>
    
    <div style="padding: 30px 20px;">
        <h2 style="color: #333;">Hi {{first_name}},</h2>
        <p>Thank you for joining MindVap! We're excited to have you on your journey to natural wellness.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">What's next?</h3>
            <ul style="color: #666;">
                <li>Complete your age verification (required for vaping products)</li>
                <li>Explore our curated herbal blends</li>
                <li>Learn about proper vaporization techniques</li>
                <li>Set up your profile preferences</li>
            </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{verification_link}}" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Verify Your Email
            </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
            If you have any questions, our support team is here to help. 
            <a href="mailto:support@mindvap.com">Contact us anytime</a>.
        </p>
    </div>
    
    <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
        <p>MindVap - Premium Herbal Wellness</p>
        <p>
            <a href="{{privacy_policy_url}}">Privacy Policy</a> | 
            <a href="{{terms_url}}">Terms of Service</a>
        </p>
    </div>
</body>
</html>
```

#### 6.1.2 Password Reset Template
```html
<!-- EmailJS Template: template_password_reset -->
Subject: Reset Your MindVap Password

<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Password Reset - MindVap</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: #dc3545; padding: 40px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset Request</h1>
    </div>
    
    <div style="padding: 30px 20px;">
        <h2 style="color: #333;">Hi {{first_name}},</h2>
        <p>We received a request to reset your password for your MindVap account.</p>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #856404;">
                <strong>Security Notice:</strong> This link will expire in 1 hour. 
                If you didn't request this reset, please ignore this email.
            </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{reset_link}}" 
               style="background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Reset Password
            </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="{{reset_link}}">{{reset_link}}</a>
        </p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        
        <p style="color: #666; font-size: 14px;">
            For security reasons, never share this link with anyone. 
            If you need help, contact our support team at 
            <a href="mailto:support@mindvap.com">support@mindvap.com</a>.
        </p>
    </div>
</body>
</html>
```

#### 6.1.3 EmailJS Service Configuration
```typescript
// src/services/authEmail.ts
import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID = 'service_mindvap_auth'; // Separate service for auth emails
const EMAILJS_PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

export interface AuthEmailData {
  toEmail: string;
  toName: string;
  templateType: 'welcome' | 'password_reset' | 'email_verification' | 'age_verification';
  templateParams: Record<string, string>;
}

export const sendAuthEmail = async (emailData: AuthEmailData): Promise<boolean> => {
  try {
    const templateMap = {
      welcome: 'template_welcome',
      password_reset: 'template_password_reset',
      email_verification: 'template_email_verification',
      age_verification: 'template_age_verification'
    };

    const templateId = templateMap[emailData.templateType];
    
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      templateId,
      {
        to_email: emailData.toEmail,
        to_name: emailData.toName,
        ...emailData.templateParams
      },
      EMAILJS_PUBLIC_KEY
    );

    if (response.status === 200) {
      console.log(`✅ ${emailData.templateType} email sent successfully`);
      return true;
    }
    
    throw new Error(`EmailJS responded with status: ${response.status}`);
  } catch (error) {
    console.error(`❌ Failed to send ${emailData.templateType} email:`, error);
    return false;
  }
};

// Email template generators
export const generateEmailVerificationEmail = (user: User, token: string) => {
  const verificationLink = `${process.env.REACT_APP_URL}/verify-email?token=${token}`;
  
  return sendAuthEmail({
    toEmail: user.email,
    toName: `${user.first_name} ${user.last_name}`,
    templateType: 'email_verification',
    templateParams: {
      verification_link: verificationLink,
      first_name: user.first_name,
      expires_in: '24 hours'
    }
  });
};

export const generatePasswordResetEmail = (user: User, token: string) => {
  const resetLink = `${process.env.REACT_APP_URL}/reset-password?token=${token}`;
  
  return sendAuthEmail({
    toEmail: user.email,
    toName: `${user.first_name} ${user.last_name}`,
    templateType: 'password_reset',
    templateParams: {
      reset_link: resetLink,
      first_name: user.first_name,
      expires_in: '1 hour'
    }
  });
};
```

### 6.2 Email Notification System

#### 6.2.1 Order Confirmation Emails
```typescript
export const sendOrderConfirmationEmail = async (order: Order, user: User) => {
  const templateParams = {
    to_email: user.email,
    to_name: `${user.first_name} ${user.last_name}`,
    order_number: order.id,
    order_date: new Date(order.created_at).toLocaleDateString(),
    total_amount: `$${order.total_amount}`,
    tracking_number: order.tracking_number || 'Pending',
    shipping_address: formatAddress(order.shipping_address),
    items_html: generateOrderItemsHTML(order.items)
  };

  return sendAuthEmail({
    toEmail: user.email,
    toName: `${user.first_name} ${user.last_name}`,
    templateType: 'order_confirmation',
    templateParams
  });
};
```

#### 6.2.2 Marketing Email Management
```typescript
interface EmailCampaign {
  id: string;
  name: string;
  type: 'newsletter' | 'abandoned_cart' | 'price_alert' | 'welcome_series';
  template: string;
  trigger: string;
  delay: number; // hours after trigger
  segment: string; // user segment criteria
}

const emailCampaigns: EmailCampaign[] = [
  {
    id: 'welcome_series_1',
    name: 'Welcome Email Series - Day 1',
    type: 'welcome_series',
    template: 'template_welcome',
    trigger: 'user_registered',
    delay: 0,
    segment: 'all_new_users'
  },
  {
    id: 'abandoned_cart_1',
    name: 'Abandoned Cart Reminder',
    type: 'abandoned_cart',
    template: 'template_abandoned_cart',
    trigger: 'cart_abandoned',
    delay: 2, // 2 hours
    segment: 'cart_abandoners'
  }
];
```

## 7. Implementation Roadmap

### Phase 1: Core Authentication (Weeks 1-2)
- [ ] Set up Supabase database schema
- [ ] Implement basic registration/login flow
- [ ] Create JWT token management
- [ ] Set up basic rate limiting
- [ ] Implement password hashing with Argon2id

### Phase 2: Security Hardening (Weeks 3-4)
- [ ] Implement CSRF protection
- [ ] Add comprehensive rate limiting
- [ ] Set up audit logging
- [ ] Implement session management
- [ ] Add XSS protection measures

### Phase 3: GDPR Compliance (Weeks 5-6)
- [ ] Implement age verification system
- [ ] Create consent management
- [ ] Build data export functionality
- [ ] Implement right to erasure
- [ ] Set up email preference management

### Phase 4: Email Integration (Week 7)
- [ ] Configure EmailJS for authentication emails
- [ ] Create email templates
- [ ] Implement email verification flow
- [ ] Set up password reset emails
- [ ] Build email preference system

### Phase 5: Frontend Integration (Weeks 8-9)
- [ ] Create React authentication context
- [ ] Build login/register components
- [ ] Implement protected routes
- [ ] Create user profile management
- [ ] Add session management UI

### Phase 6: Testing & Optimization (Week 10)
- [ ] Security testing and penetration testing
- [ ] Performance optimization
- [ ] Load testing
- [ ] User acceptance testing
- [ ] Documentation and deployment

## 8. Security Monitoring and Maintenance

### 8.1 Security Metrics
- Failed login attempts per IP/user
- Password reset request patterns
- Suspicious session activities
- Email verification failure rates
- Account lockout frequency

### 8.2 Audit and Compliance Monitoring
```typescript
interface SecurityAlert {
  type: 'failed_login' | 'password_reset' | 'suspicious_session' | 'data_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  ipAddress: string;
  details: Record<string, any>;
  timestamp: Date;
}

const generateSecurityAlert = (alert: SecurityAlert) => {
  // Log to database
  supabase.from('security_alerts').insert(alert);
  
  // Send critical alerts to admin
  if (alert.severity === 'critical') {
    sendCriticalAlert(alert);
  }
};
```

### 8.3 Regular Security Reviews
- Monthly security audit
- Quarterly password policy review
- Annual penetration testing
- GDPR compliance audit
- Incident response testing

## 9. Conclusion

This comprehensive authentication architecture provides a secure, scalable, and compliant foundation for the MindVap e-commerce platform. The design prioritizes:

1. **Security First**: Multiple layers of protection against common attacks
2. **GDPR Compliance**: Built-in privacy controls and user rights
3. **User Experience**: Smooth authentication flow with minimal friction
4. **Scalability**: Architecture that grows with the business
5. **Maintainability**: Clean separation of concerns and comprehensive logging

The implementation should follow the phased approach outlined above, with each phase building upon the previous one while maintaining security standards throughout the development process.

**Next Steps:**
1. Review and approve this specification
2. Set up development environment with Supabase
3. Begin Phase 1 implementation
4. Establish security monitoring from day one
5. Plan for regular security reviews and updates

---

*This document will be updated as the implementation progresses and new requirements emerge.*