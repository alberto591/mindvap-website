# Database Migration Scripts - MindVap Authentication

## Overview
This document contains all database migration scripts needed to implement the MindVap authentication system. These scripts should be executed in order to set up the complete authentication infrastructure.

## Migration 001: Create Users Table
```sql
-- Create users table with comprehensive authentication fields
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
    deletion_completed_at TIMESTAMPTZ,
    deletion_reason TEXT
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_deletion_scheduled ON users(deletion_scheduled_at);
CREATE INDEX idx_users_age_verified ON users(age_verified) WHERE age_verified = TRUE;
CREATE INDEX idx_users_email_verified ON users(email_verified) WHERE email_verified = FALSE;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- No direct deletion - soft delete only
CREATE POLICY "No direct user deletion" ON users
    FOR DELETE USING (false);
```

## Migration 002: Create User Sessions Table
```sql
-- Create user sessions table for refresh token management
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
    risk_score INTEGER DEFAULT 0,
    failed_refresh_attempts INTEGER DEFAULT 0,
    last_failed_refresh TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_refresh_token ON user_sessions(refresh_token_hash);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active, refresh_token_expires) WHERE is_active = TRUE;
CREATE INDEX idx_user_sessions_device ON user_sessions(device_fingerprint);

-- Enable RLS
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sessions
CREATE POLICY "Users can manage own sessions" ON user_sessions
    FOR ALL USING (auth.uid() = user_id);
```

## Migration 003: Create User Addresses Table
```sql
-- Create user addresses table for shipping and billing addresses
CREATE TABLE user_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('billing', 'shipping', 'both')),
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

-- Create indexes
CREATE INDEX idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX idx_user_addresses_default ON user_addresses(user_id, is_default) WHERE is_default = TRUE;
CREATE INDEX idx_user_addresses_type ON user_addresses(user_id, type);

-- Ensure only one default address per type per user
CREATE UNIQUE INDEX idx_user_addresses_unique_default 
ON user_addresses(user_id, type) 
WHERE is_default = TRUE AND is_deleted = FALSE;

-- Enable RLS
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for addresses
CREATE POLICY "Users can manage own addresses" ON user_addresses
    FOR ALL USING (auth.uid() = user_id AND is_deleted = FALSE);
```

## Migration 004: Create Login Attempts Log
```sql
-- Create login attempts log for security monitoring
CREATE TABLE login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    ip_address INET NOT NULL,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    failure_reason VARCHAR(100),
    risk_score INTEGER DEFAULT 0,
    location_country VARCHAR(2),
    location_city VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Additional security fields
    device_fingerprint VARCHAR(255),
    request_id UUID, -- For correlating with other security events
    blocked BOOLEAN DEFAULT FALSE
);

-- Create indexes for security monitoring
CREATE INDEX idx_login_attempts_email ON login_attempts(email, created_at);
CREATE INDEX idx_login_attempts_ip ON login_attempts(ip_address, created_at);
CREATE INDEX idx_login_attempts_failed ON login_attempts(success, created_at) WHERE success = FALSE;
CREATE INDEX idx_login_attempts_blocked ON login_attempts(blocked, created_at) WHERE blocked = TRUE;
CREATE INDEX idx_login_attempts_risk_score ON login_attempts(risk_score, created_at) WHERE risk_score >= 5;

-- No RLS for login attempts - these are for security monitoring
```

## Migration 005: Create Password Reset Tokens Table
```sql
-- Create password reset tokens table
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Security tracking
    request_id UUID, -- For correlating with security events
    attempts INTEGER DEFAULT 0
);

-- Create indexes
CREATE INDEX idx_password_reset_token ON password_reset_tokens(token_hash);
CREATE INDEX idx_password_reset_user ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_expires ON password_reset_tokens(expires_at) WHERE used_at IS NULL;

-- No RLS - these are system-managed records
```

## Migration 006: Create Email Verification Tokens Table
```sql
-- Create email verification tokens table
CREATE TABLE email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL, -- Email being verified
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_email_verification_token ON email_verification_tokens(token_hash);
CREATE INDEX idx_email_verification_user ON email_verification_tokens(user_id);
CREATE INDEX idx_email_verification_expires ON email_verification_tokens(expires_at) WHERE used_at IS NULL;

-- No RLS - these are system-managed records
```

## Migration 007: Create Audit Log Table
```sql
-- Create comprehensive audit log for compliance
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    table_name VARCHAR(100) NOT NULL,
    operation VARCHAR(10) NOT NULL, -- INSERT, UPDATE, DELETE
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    request_id UUID, -- For correlating related operations
    risk_score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Additional metadata
    session_id UUID, -- Link to user session if applicable
    api_endpoint VARCHAR(255), -- Which API was called
    additional_context JSONB -- Flexible context storage
);

-- Create indexes for efficient querying
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id, created_at);
CREATE INDEX idx_audit_log_table_operation ON audit_log(table_name, operation, created_at);
CREATE INDEX idx_audit_log_request_id ON audit_log(request_id);
CREATE INDEX idx_audit_log_risk_score ON audit_log(risk_score, created_at) WHERE risk_score >= 5;

-- No RLS - audit logs are immutable system records
```

## Migration 008: Create Security Alerts Table
```sql
-- Create security alerts table for monitoring
CREATE TABLE security_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL, -- failed_login, password_reset, suspicious_session, data_access
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    user_id UUID REFERENCES users(id),
    ip_address INET,
    details JSONB NOT NULL, -- Flexible JSON storage for alert details
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES users(id), -- Admin who resolved
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Additional tracking
    alert_count INTEGER DEFAULT 1, -- For aggregating similar alerts
    last_occurrence TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_security_alerts_type_severity ON security_alerts(type, severity, created_at);
CREATE INDEX idx_security_alerts_user_id ON security_alerts(user_id, created_at);
CREATE INDEX idx_security_alerts_unresolved ON security_alerts(resolved, created_at) WHERE resolved = FALSE;
CREATE INDEX idx_security_alerts_critical ON security_alerts(severity, created_at) WHERE severity = 'critical';

-- No RLS - security alerts are system-managed
```

## Migration 009: Create Consent Records Table
```sql
-- Create consent records table for GDPR compliance
CREATE TABLE consent_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    consent_type VARCHAR(50) NOT NULL, -- terms, privacy, marketing, data_processing
    policy_version VARCHAR(20) NOT NULL,
    accepted BOOLEAN NOT NULL,
    accepted_at TIMESTAMPTZ NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Additional metadata
    consent_method VARCHAR(50), -- web_form, email_response, api_call
    consent_context JSONB -- Flexible context storage
);

-- Create indexes
CREATE INDEX idx_consent_records_user_id ON consent_records(user_id, consent_type, accepted_at);
CREATE INDEX idx_consent_records_type ON consent_records(consent_type, accepted_at);
CREATE INDEX idx_consent_records_version ON consent_records(policy_version, accepted_at);

-- Ensure one active consent record per type per user
CREATE UNIQUE INDEX idx_consent_records_unique_active 
ON consent_records(user_id, consent_type) 
WHERE accepted = TRUE AND accepted_at IS NOT NULL;

-- Enable RLS
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for consent records
CREATE POLICY "Users can view own consent records" ON consent_records
    FOR SELECT USING (auth.uid() = user_id);
```

## Migration 010: Create Functions and Triggers
```sql
-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to ensure only one default address per type
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default = TRUE THEN
        UPDATE user_addresses 
        SET is_default = FALSE 
        WHERE user_id = NEW.user_id 
        AND type = NEW.type 
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID);
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to check if user is over required age
CREATE OR REPLACE FUNCTION check_user_age(birth_date DATE, required_age INTEGER DEFAULT 21)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (CURRENT_DATE - birth_date) >= (required_age * 365);
END;
$$ language 'plpgsql';

-- Function to hash tokens securely
CREATE OR REPLACE FUNCTION hash_token(token TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN encode(digest(token, 'sha256'), 'hex');
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON user_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_addresses_updated_at BEFORE UPDATE ON user_addresses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for default address enforcement
CREATE TRIGGER enforce_single_default_address 
    BEFORE INSERT OR UPDATE ON user_addresses
    FOR EACH ROW EXECUTE FUNCTION ensure_single_default_address();

-- Function to automatically verify age on registration
CREATE OR REPLACE FUNCTION verify_age_on_registration()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-verify age if user meets requirements
    IF check_user_age(NEW.date_of_birth, 21) THEN
        NEW.age_verified = TRUE;
        NEW.age_verified_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER verify_age_trigger 
    BEFORE INSERT ON users
    FOR EACH ROW EXECUTE FUNCTION verify_age_on_registration();
```

## Migration 011: Create Views for Common Queries
```sql
-- View for active users with verification status
CREATE VIEW active_users_verification
WITH (security_invoker = true) AS
SELECT 
    id,
    email,
    first_name,
    last_name,
    date_of_birth,
    age_verified,
    email_verified,
    status,
    created_at,
    last_login,
    CASE 
        WHEN age_verified AND email_verified THEN 'fully_verified'
        WHEN age_verified THEN 'age_only'
        WHEN email_verified THEN 'email_only'
        ELSE 'unverified'
    END as verification_status
FROM users 
WHERE status = 'active';

-- View for user security summary
CREATE VIEW user_security_summary
WITH (security_invoker = true) AS
SELECT 
    u.id,
    u.email,
    u.failed_login_attempts,
    u.account_locked_until,
    u.last_login,
    COUNT(la.id) as total_login_attempts,
    COUNT(la.id) FILTER (WHERE la.success = FALSE) as failed_login_count,
    MAX(la.created_at) as last_login_attempt,
    COUNT(us.id) as active_sessions
FROM users u
LEFT JOIN login_attempts la ON u.email = la.email
LEFT JOIN user_sessions us ON u.id = us.user_id AND us.is_active = TRUE
GROUP BY u.id, u.email, u.failed_login_attempts, u.account_locked_until, u.last_login;

-- View for GDPR compliance summary
CREATE VIEW gdpr_compliance_summary
WITH (security_invoker = true) AS
SELECT 
    u.id,
    u.email,
    u.data_processing_consent,
    u.data_processing_consent_at,
    u.deletion_requested_at,
    u.deletion_scheduled_at,
    u.deletion_completed_at,
    CASE 
        WHEN u.deletion_completed_at IS NOT NULL THEN 'deleted'
        WHEN u.deletion_scheduled_at IS NOT NULL THEN 'deletion_scheduled'
        WHEN u.deletion_requested_at IS NOT NULL THEN 'deletion_requested'
        WHEN u.data_processing_consent = TRUE THEN 'consented'
        ELSE 'no_consent'
    END as data_status,
    (u.data_retention_period - (CURRENT_DATE - u.created_at::date)) as days_until_deletion
FROM users u;
```

## Migration 012: Insert Initial Data
```sql
-- Insert default age verification settings
INSERT INTO system_settings (key, value, description) VALUES
('min_age_required', '21', 'Minimum age required for vaping products'),
('age_verification_method', 'self_attestation_plus_payment', 'Method for age verification'),
('email_verification_required', 'true', 'Whether email verification is required'),
('password_min_length', '12', 'Minimum password length'),
('password_require_special', 'true', 'Whether passwords require special characters'),
('session_timeout_minutes', '15', 'Session timeout in minutes'),
('refresh_token_days', '7', 'Refresh token validity in days'),
('max_login_attempts', '5', 'Maximum login attempts before lockout'),
('login_attempt_window_minutes', '15', 'Window for login attempt counting');

-- Insert default consent text versions
INSERT INTO consent_versions (version, consent_type, text, effective_date) VALUES
('1.0', 'terms', 'Terms of Service v1.0', CURRENT_DATE),
('1.0', 'privacy', 'Privacy Policy v1.0', CURRENT_DATE),
('1.0', 'marketing', 'Marketing Consent v1.0', CURRENT_DATE),
('1.0', 'data_processing', 'Data Processing Consent v1.0', CURRENT_DATE);
```

## Running the Migrations

### Using Supabase CLI
```bash
# Create new migration
supabase migration new authentication_system

# Apply migrations
supabase db reset

# Apply specific migration
supabase migration up
```

### Using SQL Editor in Supabase Dashboard
1. Go to SQL Editor in Supabase Dashboard
2. Copy and paste each migration script in order
3. Execute each script individually
4. Verify tables are created correctly

### Verification Queries
```sql
-- Verify all tables are created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'users', 'user_sessions', 'user_addresses', 'login_attempts', 
    'password_reset_tokens', 'email_verification_tokens', 
    'audit_log', 'security_alerts', 'consent_records'
);

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN (
    'users', 'user_sessions', 'user_addresses', 'consent_records'
);

-- Verify indexes
SELECT indexname, tablename, indexdef
FROM pg_indexes 
WHERE tablename IN (
    'users', 'user_sessions', 'user_addresses', 'login_attempts'
);
```

## Rollback Strategy

If you need to rollback these migrations:

```sql
-- Drop in reverse order (careful with foreign keys)
DROP VIEW IF EXISTS gdpr_compliance_summary;
DROP VIEW IF EXISTS user_security_summary;
DROP VIEW IF EXISTS active_users_verification;

DROP TABLE IF EXISTS consent_records CASCADE;
DROP TABLE IF EXISTS security_alerts CASCADE;
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS email_verification_tokens CASCADE;
DROP TABLE IF EXISTS password_reset_tokens CASCADE;
DROP TABLE IF EXISTS login_attempts CASCADE;
DROP TABLE IF EXISTS user_addresses CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS ensure_single_default_address();
DROP FUNCTION IF EXISTS check_user_age(INTEGER);
DROP FUNCTION IF EXISTS hash_token(TEXT);
DROP FUNCTION IF EXISTS verify_age_on_registration();
```

## Security Considerations

1. **Row Level Security**: All user tables have RLS enabled
2. **Audit Trail**: All data3. **Data changes are logged
 Encryption**: Sensitive fields should be encrypted at rest
4. **Access Control**: API endpoints should validate user permissions
5. **Rate Limiting**: Implement at both database and application levels
6. **Monitoring**: Set up alerts for suspicious activities

## Next Steps

After running these migrations:

1. Create database functions for authentication logic
2. Set up Row Level Security policies
3. Create API endpoints that use these tables
4. Implement the frontend authentication flow
5. Set up monitoring and alerting for security events

---

*This migration script should be executed in a development environment first to ensure all components work correctly before applying to production.*