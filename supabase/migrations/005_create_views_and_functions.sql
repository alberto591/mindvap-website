-- Migration 005: Create Views and Functions
-- This script creates useful views and additional functions for the authentication system

-- View for active users with verification status
CREATE OR REPLACE VIEW active_users_verification AS
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
CREATE OR REPLACE VIEW user_security_summary AS
SELECT 
    u.id,
    u.email,
    u.failed_login_attempts,
    u.account_locked_until,
    u.last_login,
    COUNT(la.id) as total_login_attempts,
    COUNT(la.id) FILTER (WHERE la.success = FALSE) as failed_login_count,
    MAX(la.created_at) as last_login_attempt,
    COUNT(us.id) as active_sessions,
    u.age_verified,
    u.email_verified
FROM users u
LEFT JOIN login_attempts la ON u.email = la.email
LEFT JOIN user_sessions us ON u.id = us.user_id AND us.is_active = TRUE
GROUP BY u.id, u.email, u.failed_login_attempts, u.account_locked_until, u.last_login, u.age_verified, u.email_verified;

-- View for GDPR compliance summary
CREATE OR REPLACE VIEW gdpr_compliance_summary AS
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
    (u.data_retention_period - (CURRENT_DATE - u.created_at::date)) as days_until_deletion,
    COUNT(cr.id) as total_consent_records
FROM users u
LEFT JOIN consent_records cr ON u.id = cr.user_id
GROUP BY u.id, u.email, u.data_processing_consent, u.data_processing_consent_at, 
         u.deletion_requested_at, u.deletion_scheduled_at, u.deletion_completed_at, 
         u.data_retention_period, u.created_at;

-- Function to check account lock status
CREATE OR REPLACE FUNCTION is_account_locked(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    lock_until TIMESTAMPTZ;
BEGIN
    SELECT account_locked_until INTO lock_until
    FROM users 
    WHERE email = user_email;
    
    -- Check if account is locked and lock hasn't expired
    IF lock_until IS NOT NULL AND lock_until > NOW() THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ language 'plpgsql';

-- Function to increment failed login attempts
CREATE OR REPLACE FUNCTION increment_failed_login_attempts(user_email TEXT, ip_addr INET)
RETURNS void AS $$
DECLARE
    current_attempts INTEGER;
    lock_duration INTERVAL;
BEGIN
    -- Get current failed attempts
    SELECT failed_login_attempts INTO current_attempts
    FROM users 
    WHERE email = user_email;
    
    IF current_attempts IS NULL THEN
        current_attempts := 0;
    END IF;
    
    -- Increment attempts
    current_attempts := current_attempts + 1;
    
    -- Calculate lock duration (exponential backoff)
    lock_duration := LEAST(
        INTERVAL '30 minutes',
        INTERVAL '5 minutes' * (2 ^ GREATEST(current_attempts - 5, 0))
    );
    
    -- Update user record
    UPDATE users 
    SET 
        failed_login_attempts = current_attempts,
        last_failed_login = NOW(),
        account_locked_until = CASE 
            WHEN current_attempts >= 5 THEN NOW() + lock_duration
            ELSE NULL
        END
    WHERE email = user_email;
    
    -- Log the failed attempt
    INSERT INTO login_attempts (email, ip_address, success, failure_reason, risk_score)
    VALUES (user_email, ip_addr, FALSE, 'invalid_credentials', 
            CASE WHEN current_attempts >= 5 THEN 8 ELSE current_attempts END);
            
    -- Create security alert for multiple failures
    IF current_attempts >= 5 THEN
        PERFORM log_security_event(
            'multiple_failed_logins',
            'high',
            (SELECT id FROM users WHERE email = user_email),
            ip_addr,
            jsonb_build_object(
                'attempts', current_attempts,
                'lock_duration', lock_duration
            )
        );
    END IF;
END;
$$ language 'plpgsql';

-- Function to reset failed login attempts on successful login
CREATE OR REPLACE FUNCTION reset_failed_login_attempts(user_email TEXT, ip_addr INET)
RETURNS void AS $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Get user ID
    SELECT id INTO user_uuid FROM users WHERE email = user_email;
    
    -- Reset failed attempts and update last login
    UPDATE users 
    SET 
        failed_login_attempts = 0,
        account_locked_until = NULL,
        last_login = NOW()
    WHERE email = user_email;
    
    -- Log successful login
    INSERT INTO login_attempts (email, ip_address, success, risk_score)
    VALUES (user_email, ip_addr, TRUE, 0);
    
    -- Log security event
    PERFORM log_security_event(
        'successful_login',
        'low',
        user_uuid,
        ip_addr,
        jsonb_build_object('method', 'password')
    );
END;
$$ language 'plpgsql';

-- Function to schedule user data deletion (GDPR right to be forgotten)
CREATE OR REPLACE FUNCTION schedule_user_deletion(user_uuid UUID, reason TEXT)
RETURNS void AS $$
BEGIN
    -- Schedule deletion after 30-day grace period
    UPDATE users 
    SET 
        deletion_requested_at = NOW(),
        deletion_scheduled_at = NOW() + INTERVAL '30 days',
        deletion_reason = reason,
        status = 'suspended'
    WHERE id = user_uuid;
    
    -- Log the deletion request
    PERFORM log_security_event(
        'data_deletion_requested',
        'medium',
        user_uuid,
        NULL,
        jsonb_build_object(
            'reason', reason,
            'scheduled_for', NOW() + INTERVAL '30 days'
        )
    );
END;
$$ language 'plpgsql';

-- Function to execute scheduled deletions
CREATE OR REPLACE FUNCTION execute_scheduled_deletions()
RETURNS INTEGER AS $$
DECLARE
    deletion_count INTEGER := 0;
    user_record RECORD;
BEGIN
    -- Anonymize users whose deletion is scheduled
    FOR user_record IN 
        SELECT id, email FROM users 
        WHERE deletion_scheduled_at <= NOW() 
        AND deletion_completed_at IS NULL
    LOOP
        -- Anonymize user data
        UPDATE users 
        SET 
            email = 'deleted_' || id || '@mindvap.com',
            first_name = 'Deleted',
            last_name = 'User',
            phone = NULL,
            date_of_birth = NULL,
            password_hash = 'deleted',
            password_salt = 'deleted',
            deletion_completed_at = NOW(),
            status = 'deleted'
        WHERE id = user_record.id;
        
        -- Anonymize related orders (keep for legal/tax purposes)
        UPDATE orders 
        SET customer_email = 'deleted_' || user_record.id || '@mindvap.com'
        WHERE user_id = user_record.id;
        
        deletion_count := deletion_count + 1;
        
        -- Log the deletion
        PERFORM log_security_event(
            'data_deletion_executed',
            'medium',
            user_record.id,
            NULL,
            jsonb_build_object('deletion_count', deletion_count)
        );
    END LOOP;
    
    RAISE NOTICE 'Executed % scheduled deletions at %', deletion_count, NOW();
    RETURN deletion_count;
END;
$$ language 'plpgsql';

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION cleanup_expired_sessions() TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_tokens() TO authenticated;
GRANT EXECUTE ON FUNCTION execute_scheduled_deletions() TO authenticated;

-- Create a scheduled job to clean up expired data (this would be configured in Supabase)
-- SELECT cron.schedule('cleanup-expired-data', '0 2 * * *', 'SELECT cleanup_expired_sessions(); SELECT cleanup_expired_tokens();');

COMMENT ON VIEW active_users_verification IS 'Active users with their verification status summary';
COMMENT ON VIEW user_security_summary IS 'Security summary for all users including login attempts and sessions';
COMMENT ON VIEW gdpr_compliance_summary IS 'GDPR compliance status for all users';
COMMENT ON FUNCTION is_account_locked(TEXT) IS 'Check if a user account is currently locked';
COMMENT ON FUNCTION increment_failed_login_attempts(TEXT, INET) IS 'Increment failed login attempts and handle account locking';
COMMENT ON FUNCTION reset_failed_login_attempts(TEXT, INET) IS 'Reset failed login attempts on successful authentication';
COMMENT ON FUNCTION schedule_user_deletion(UUID, TEXT) IS 'Schedule user data deletion for GDPR compliance';
COMMENT ON FUNCTION execute_scheduled_deletions() IS 'Execute scheduled user data deletions';