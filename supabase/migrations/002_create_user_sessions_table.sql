-- Migration 002: Create User Sessions Table
-- This script creates the user sessions table for refresh token management

-- Create user sessions table for refresh token management
CREATE TABLE IF NOT EXISTS user_sessions (
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
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_refresh_token ON user_sessions(refresh_token_hash);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active, refresh_token_expires) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_sessions_device ON user_sessions(device_fingerprint);

-- Enable RLS
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sessions
CREATE POLICY "Users can manage own sessions" ON user_sessions
    FOR ALL USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_user_sessions_updated_at 
    BEFORE UPDATE ON user_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    -- Mark expired sessions as inactive
    UPDATE user_sessions 
    SET is_active = FALSE 
    WHERE is_active = TRUE 
    AND refresh_token_expires < NOW();
    
    -- Log the cleanup
    RAISE NOTICE 'Cleaned up expired sessions at %', NOW();
END;
$$ language 'plpgsql';

-- Function to get active session count for a user
CREATE OR REPLACE FUNCTION get_active_session_count(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    session_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO session_count
    FROM user_sessions 
    WHERE user_id = user_uuid 
    AND is_active = TRUE 
    AND refresh_token_expires > NOW();
    
    RETURN session_count;
END;
$$ language 'plpgsql';

COMMENT ON TABLE user_sessions IS 'User sessions table for managing refresh tokens and device tracking';
COMMENT ON COLUMN user_sessions.refresh_token_hash IS 'Hashed refresh token for security';
COMMENT ON COLUMN user_sessions.device_fingerprint IS 'Browser/device fingerprint for security';
COMMENT ON COLUMN user_sessions.risk_score IS 'Risk score based on suspicious activity (0-10)';