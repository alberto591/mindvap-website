# API Specification - MindVap Authentication

## Overview
This document defines the complete API specification for the MindVap authentication system. All endpoints follow RESTful conventions and include comprehensive security measures.

## Base Configuration
- **Base URL**: `https://myaujlsahkendspiloet.supabase.co/functions/v1/auth`
- **Authentication**: JWT Bearer tokens (for protected endpoints)
- **Content-Type**: `application/json`
- **Rate Limiting**: 100 requests per minute per IP

## Authentication Endpoints

### POST /register
Register a new user account with age verification.

**Request Body:**
```typescript
interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO 8601 date
  phone?: string;
  marketingConsent: boolean;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  dataProcessingConsent: boolean;
}
```

**Response:**
```typescript
interface RegisterResponse {
  success: boolean;
  message: string;
  userId: string;
  emailVerificationRequired: boolean;
  ageVerificationRequired: boolean;
  verificationToken?: string; // For email verification
}
```

**Example:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1995-05-15",
  "phone": "+1234567890",
  "marketingConsent": true,
  "termsAccepted": true,
  "privacyAccepted": true,
  "dataProcessingConsent": true
}
```

### POST /login
Authenticate user and receive access/refresh tokens.

**Request Body:**
```typescript
interface LoginRequest {
  email: string;
  password: string;
  deviceInfo: {
    fingerprint: string;
    userAgent: string;
  };
}
```

**Response:**
```typescript
interface LoginResponse {
  success: boolean;
  message: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    ageVerified: boolean;
    emailVerified: boolean;
  };
}
```

### POST /logout
Invalidate current session and refresh token.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```typescript
interface LogoutResponse {
  success: boolean;
  message: string;
}
```

### POST /refresh
Get new access token using refresh token.

**Headers:**
```
Authorization: Bearer <refresh_token>
```

**Response:**
```typescript
interface RefreshResponse {
  success: boolean;
  accessToken: string;
  expiresIn: number;
  newRefreshToken: string;
}
```

### POST /forgot-password
Request password reset email.

**Request Body:**
```typescript
interface ForgotPasswordRequest {
  email: string;
}
```

**Response:**
```typescript
interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}
```

### POST /reset-password
Reset password using reset token.

**Request Body:**
```typescript
interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}
```

**Response:**
```typescript
interface ResetPasswordResponse {
  success: boolean;
  message: string;
}
```

### POST /verify-email
Verify email address using verification token.

**Request Body:**
```typescript
interface VerifyEmailRequest {
  token: string;
}
```

**Response:**
```typescript
interface VerifyEmailResponse {
  success: boolean;
  message: string;
}
```

### POST /resend-verification
Resend email verification token.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```typescript
interface ResendVerificationResponse {
  success: boolean;
  message: string;
}
```

## User Management Endpoints

### GET /profile
Get current user profile information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```typescript
interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth: string;
  ageVerified: boolean;
  emailVerified: boolean;
  marketingConsent: boolean;
  status: 'active' | 'suspended' | 'deleted';
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}
```

### PUT /profile
Update user profile information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```typescript
interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
}
```

**Response:**
```typescript
interface UpdateProfileResponse {
  success: boolean;
  message: string;
  user: UserProfile;
}
```

### PUT /change-password
Change user password.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```typescript
interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
```

**Response:**
```typescript
interface ChangePasswordResponse {
  success: boolean;
  message: string;
}
```

### PUT /update-email
Update user email address (requires verification).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```typescript
interface UpdateEmailRequest {
  newEmail: string;
  password: string; // Confirm identity
}
```

**Response:**
```typescript
interface UpdateEmailResponse {
  success: boolean;
  message: string;
  verificationToken?: string;
}
```

### POST /age-verification
Submit age verification documents.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Request Body:**
```typescript
interface AgeVerificationRequest {
  documentType: 'drivers_license' | 'passport' | 'state_id';
  documentImage: File; // Base64 encoded or multipart
  selfieImage?: File; // For enhanced verification
}
```

**Response:**
```typescript
interface AgeVerificationResponse {
  success: boolean;
  message: string;
  verificationId: string;
  status: 'pending' | 'approved' | 'rejected';
}
```

## Session Management Endpoints

### GET /sessions
Get all active user sessions.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```typescript
interface UserSession {
  id: string;
  deviceFingerprint: string;
  userAgent: string;
  ipAddress: string;
  location?: {
    country: string;
    city: string;
  };
  lastUsedAt: string;
  isActive: boolean;
}

interface SessionsResponse {
  sessions: UserSession[];
  currentSessionId: string;
}
```

### DELETE /sessions/:id
Terminate a specific session.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```typescript
interface SessionResponse {
  success: boolean;
  message: string;
}
```

### DELETE /sessions/all
Terminate all sessions except current.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```typescript
interface SessionResponse {
  success: boolean;
  message: string;
  terminatedSessions: number;
}
```

## Address Management Endpoints

### GET /addresses
Get all user addresses.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```typescript
interface UserAddress {
  id: string;
  type: 'billing' | 'shipping' | 'both';
  isDefault: boolean;
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}
```

### POST /addresses
Add a new address.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```typescript
interface CreateAddressRequest {
  type: 'billing' | 'shipping' | 'both';
  isDefault?: boolean;
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  phone?: string;
}
```

**Response:**
```typescript
interface AddressResponse {
  success: boolean;
  message: string;
  address: UserAddress;
}
```

### PUT /addresses/:id
Update an existing address.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```typescript
interface AddressResponse {
  success: boolean;
  message: string;
  address: UserAddress;
}
```

### DELETE /addresses/:id
Delete an address.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```typescript
interface AddressResponse {
  success: boolean;
  message: string;
}
```

## Email Preferences Endpoints

### GET /email-preferences
Get user's email notification preferences.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```typescript
interface EmailPreferences {
  marketingEmails: boolean;
  orderUpdates: boolean;
  newsletter: boolean;
  abandonedCart: boolean;
  priceAlerts: boolean;
  securityAlerts: boolean;
  lastUpdated: string;
}
```

### PUT /email-preferences
Update email notification preferences.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```typescript
interface UpdateEmailPreferencesRequest {
  marketingEmails?: boolean;
  orderUpdates?: boolean;
  newsletter?: boolean;
  abandonedCart?: boolean;
  priceAlerts?: boolean;
}
```

**Response:**
```typescript
interface EmailPreferencesResponse {
  success: boolean;
  message: string;
  preferences: EmailPreferences;
}
```

## GDPR Compliance Endpoints

### GET /export-data
Request a complete export of user data.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```typescript
interface DataExportResponse {
  success: boolean;
  message: string;
  exportId: string;
  downloadUrl?: string; // Available immediately for small exports
  processingTime?: number; // For large exports (seconds)
}
```

### POST /delete-account
Request account deletion (right to be forgotten).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```typescript
interface DeleteAccountRequest {
  reason: string;
  password: string; // Confirm identity
}
```

**Response:**
```typescript
interface DeleteAccountResponse {
  success: boolean;
  message: string;
  deletionScheduledFor: string; // 30 days from now
  dataRetentionUntil: string;
}
```

### GET /consent-history
Get user's consent history.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```typescript
interface ConsentRecord {
  id: string;
  consentType: 'terms' | 'privacy' | 'marketing' | 'data_processing';
  policyVersion: string;
  accepted: boolean;
  acceptedAt: string;
  ipAddress: string;
  consentMethod: string;
}

interface ConsentHistoryResponse {
  consents: ConsentRecord[];
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}
```

**Common Error Codes:**
- `VALIDATION_ERROR`: Request validation failed
- `INVALID_CREDENTIALS`: Email or password incorrect
- `EMAIL_ALREADY_EXISTS`: Email address already registered
- `WEAK_PASSWORD`: Password doesn't meet requirements
- `AGE_VERIFICATION_REQUIRED`: User must verify age before continuing
- `EMAIL_VERIFICATION_REQUIRED`: User must verify email before continuing
- `ACCOUNT_LOCKED`: Account temporarily locked due to failed attempts
- `TOKEN_EXPIRED`: Authentication token has expired
- `TOKEN_INVALID`: Authentication token is invalid

### 401 Unauthorized
```typescript
interface UnauthorizedResponse {
  success: false;
  error: {
    code: 'UNAUTHORIZED';
    message: 'Authentication required';
  };
}
```

### 403 Forbidden
```typescript
interface ForbiddenResponse {
  success: false;
  error: {
    code: 'FORBIDDEN';
    message: 'Insufficient permissions';
  };
}
```

### 429 Too Many Requests
```typescript
interface RateLimitResponse {
  success: false;
  error: {
    code: 'RATE_LIMIT_EXCEEDED';
    message: string;
    retryAfter: number; // seconds
  };
}
```

### 500 Internal Server Error
```typescript
interface ServerErrorResponse {
  success: false;
  error: {
    code: 'INTERNAL_ERROR';
    message: 'An unexpected error occurred';
  };
}
```

## Rate Limiting

### Rate Limits by Endpoint
- **Authentication endpoints** (login, register): 5 requests per 15 minutes per IP
- **Password reset**: 3 requests per hour per IP
- **Email verification**: 3 requests per hour per IP
- **General API**: 100 requests per minute per IP
- **Session management**: 10 requests per minute per user

### Rate Limit Headers
All responses include rate limit information:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
X-RateLimit-Window: 60
```

## Security Headers

All responses include security headers:
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

## Webhook Notifications

The system can send webhooks for security events:

### POST /webhooks/security-alert
```typescript
interface SecurityAlertWebhook {
  type: 'failed_login' | 'suspicious_activity' | 'password_reset' | 'account_locked';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  ipAddress: string;
  timestamp: string;
  details: Record<string, any>;
}
```

## Testing

### Test Endpoints
For development/testing environments:

### POST /test/reset
Reset all test data (development only).
```typescript
interface TestResetResponse {
  success: boolean;
  message: string;
}
```

### POST /test/generate-test-user
Generate a test user account.
```typescript
interface GenerateTestUserResponse {
  success: boolean;
  message: string;
  user: {
    email: string;
    password: string;
    id: string;
  };
}
```

## Implementation Notes

### Request Validation
All endpoints validate:
- Required fields are present
- Field formats are correct (email, phone, etc.)
- Password strength requirements
- Age verification for age-restricted content
- Email format validation

### Logging
All API requests are logged with:
- User ID (if authenticated)
- IP address
- User agent
- Request/response status
- Security-relevant events

### Monitoring
Key metrics to monitor:
- Authentication success/failure rates
- Rate limit violations
- Security alert frequency
- API response times
- Error rates by endpoint

---

*This API specification should be implemented with comprehensive error handling, logging, and security measures as outlined in the main authentication architecture document.*