-- Migration 004: Create Security Tables
-- This script creates security-related tables for login attempts, password reset, and audit logging

-- Create login attempts log for security monitoring
CREATE TABLE IF NOT EXISTS login_attempts (
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

-- Create password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
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

-- Create email verification tokens table
CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL, -- Email being verified
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create audit log for compliance
CREATE TABLE IF NOT EXISTS audit_log (
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

-- Create security alerts table for monitoring
CREATE TABLE IF NOT EXISTS security_alerts (
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

-- Create consent records table for GDPR compliance
CREATE TABLE IF NOT EXISTS consent_records (
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

-- Create indexes for security monitoring
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email, created_at);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address, created_at);
CREATE INDEX IF NOT EXISTS idx_login_attempts_failed ON login_attempts(success, created_at) WHERE success = FALSE;
CREATE INDEX IF NOT EXISTS idx_login_attempts_blocked ON login_attempts(blocked, created_at) WHERE blocked = TRUE;
CREATE INDEX IF NOT EXISTS idx_login_attempts_risk_score ON login_attempts(risk_score, created_at) WHERE risk_score >= 5;

CREATE INDEX IF NOT EXISTS idx_password_reset_token ON password_reset_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_password_reset_user ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_expires ON password_reset_tokens(expires_at) WHERE used_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_email_verification_token ON email_verification_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_email_verification_user ON email_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verification_expires ON email_verification_tokens(expires_at) WHERE used_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_operation ON audit_log(table_name, operation, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_request_id ON audit_log(request_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_risk_score ON audit_log(risk_score, created_at) WHERE risk_score >= 5;

CREATE INDEX IF NOT EXISTS idx_security_alerts_type_severity ON security_alerts(type, severity, created_at);
CREATE INDEX IF NOT EXISTS idx_security_alerts_user_id ON security_alerts(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_security_alerts_unresolved ON security_alerts(resolved, created_at) WHERE resolved = FALSE;
CREATE INDEX IF NOT EXISTS idx_security_alerts_critical ON security_alerts(severity, created_at) WHERE severity = 'critical';

CREATE INDEX IF NOT EXISTS idx_consent_records_user_id ON consent_records(user_id, consent_type, accepted_at);
CREATE INDEX IF NOT EXISTS idx_consent_records_type ON consent_records(consent_type, accepted_at);
CREATE INDEX IF NOT EXISTS idx_consent_records_version ON consent_records(policy_version, accepted_at);

-- Enable RLS only for consent records (others are system-managed)
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for consent records
CREATE POLICY "Users can view own consent records" ON consent_records
    FOR SELECT USING (auth.uid() = user_id);

-- Ensure one active consent record per type per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_consent_records_unique_active 
ON consent_records(user_id, consent_type) 
WHERE accepted = TRUE AND accepted_at IS NOT NULL;

-- Function to hash tokens securely
CREATE OR REPLACE FUNCTION hash_token(token TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN encode(digest(token, 'sha256'), 'hex');
END;
$$ language 'plpgsql';

-- Function to clean up expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
    -- Clean up expired password reset tokens
    DELETE FROM password_reset_tokens 
    WHERE expires_at < NOW();
    
    -- Clean up expired email verification tokens
    DELETE FROM email_verification_tokens 
    WHERE expires_at < NOW();
    
    RAISE NOTICE 'Cleaned up expired tokens at %', NOW();
END;
$$ language 'plpgsql';

-- Function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
    event_type VARCHAR(50),
    event_severity VARCHAR(20),
    user_uuid UUID,
    ip_addr INET,
    event_details JSONB
)
RETURNS UUID AS $$
DECLARE
    alert_id UUID;
BEGIN
    INSERT INTO security_alerts (type, severity, user_id, ip_address, details)
    VALUES (event_type, event_severity, user_uuid, ip_addr, event_details)
    RETURNING id INTO alert_id;
    
    RETURN alert_id;
END;
$$ language 'plpgsql';

COMMENT ON TABLE login_attempts IS 'Log of all login attempts for security monitoring';
COMMENT ON TABLE password_reset_tokens IS 'Password reset tokens with expiration and usage tracking';
COMMENT ON TABLE email_verification_tokens IS 'Email verification tokens for account activation';
COMMENT ON TABLE audit_log IS 'Comprehensive audit log for GDPR compliance and security';
COMMENT ON TABLE security_alerts IS 'Security alerts and notifications for monitoring';
COMMENT ON TABLE consent_records IS 'GDPR consent records with version tracking';