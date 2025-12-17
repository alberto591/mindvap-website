-- Migration 001: Create Users Table
-- This script creates the main users table with comprehensive authentication fields

-- Create users table with comprehensive authentication fields
CREATE TABLE IF NOT EXISTS users (
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
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_deletion_scheduled ON users(deletion_scheduled_at);
CREATE INDEX IF NOT EXISTS idx_users_age_verified ON users(age_verified) WHERE age_verified = TRUE;
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified) WHERE email_verified = FALSE;

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

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add function to check user age
CREATE OR REPLACE FUNCTION check_user_age(birth_date DATE, required_age INTEGER DEFAULT 21)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (CURRENT_DATE - birth_date) >= (required_age * 365);
END;
$$ language 'plpgsql';

-- Add trigger to automatically verify age on registration
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

COMMENT ON TABLE users IS 'Main users table with comprehensive authentication and GDPR compliance fields';
COMMENT ON COLUMN users.password_hash IS 'Hashed password using Argon2id';
COMMENT ON COLUMN users.password_salt IS 'Salt used for password hashing';
COMMENT ON COLUMN users.age_verified IS 'Whether the user has verified they are 21+ years old';
COMMENT ON COLUMN users.email_verification_token IS 'Token for email verification';
COMMENT ON COLUMN users.deletion_scheduled_at IS 'When user data deletion is scheduled (30 days after request)';