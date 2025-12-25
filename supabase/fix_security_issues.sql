-- SECURITY FIX SCRIPT: MindVap Database (V2 - Includes Table Creation)
-- This script creates missing tables, resolves SECURITY DEFINER warnings, and enables RLS.

-- 1. Create Missing E-commerce Tables (if not exist)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    stripe_payment_intent_id TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'usd',
    shipping_address JSONB,
    billing_address JSONB,
    customer_email TEXT,
    order_number TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price_at_time DECIMAL(10, 2) NOT NULL,
    product_name TEXT NOT NULL,
    product_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Resolve SECURITY DEFINER issues for Views
-- -----------------------------------------------------------------------------

-- active_users_verification
DROP VIEW IF EXISTS active_users_verification;
CREATE VIEW active_users_verification 
WITH (security_invoker = true) AS
SELECT 
    id, email, first_name, last_name, date_of_birth, age_verified, email_verified, status, created_at, last_login,
    CASE 
        WHEN age_verified AND email_verified THEN 'fully_verified'
        WHEN age_verified THEN 'age_only'
        WHEN email_verified THEN 'email_only'
        ELSE 'unverified'
    END as verification_status
FROM users 
WHERE status = 'active';

-- user_security_summary
DROP VIEW IF EXISTS user_security_summary;
CREATE VIEW user_security_summary 
WITH (security_invoker = true) AS
SELECT 
    u.id, u.email, u.failed_login_attempts, u.account_locked_until, u.last_login,
    COUNT(la.id) as total_login_attempts,
    COUNT(la.id) FILTER (WHERE la.success = FALSE) as failed_login_count,
    MAX(la.created_at) as last_login_attempt,
    COUNT(us.id) as active_sessions,
    u.age_verified, u.email_verified
FROM users u
LEFT JOIN login_attempts la ON u.email = la.email
LEFT JOIN user_sessions us ON u.id = us.user_id AND us.is_active = TRUE
GROUP BY u.id, u.email, u.failed_login_attempts, u.account_locked_until, u.last_login, u.age_verified, u.email_verified;

-- gdpr_compliance_summary
DROP VIEW IF EXISTS gdpr_compliance_summary;
CREATE VIEW gdpr_compliance_summary 
WITH (security_invoker = true) AS
SELECT 
    u.id, u.email, u.data_processing_consent, u.data_processing_consent_at,
    u.deletion_requested_at, u.deletion_scheduled_at, u.deletion_completed_at,
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

-- Restore comments
COMMENT ON VIEW active_users_verification IS 'Active users with their verification status summary';
COMMENT ON VIEW user_security_summary IS 'Security summary for all users including login attempts and sessions';
COMMENT ON VIEW gdpr_compliance_summary IS 'GDPR compliance status for all users';


-- 3. Enable Row Level Security (RLS) on all tables
-- -----------------------------------------------------------------------------

-- Audit and Security Tables
ALTER TABLE IF EXISTS login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS email_verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS security_alerts ENABLE ROW LEVEL SECURITY;

-- E-commerce Tables
ALTER TABLE IF EXISTS orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_items ENABLE ROW LEVEL SECURITY;

-- 4. Add Ownership Policies for E-commerce tables
-- -----------------------------------------------------------------------------

-- For orders: users see their own orders based on ID or Email
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id OR customer_email = auth.jwt() ->> 'email');

-- For order items: users see items belonging to their orders
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
CREATE POLICY "Users can view own order items" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND (orders.user_id = auth.uid() OR orders.customer_email = auth.jwt() ->> 'email')
        )
    );

-- 5. Final verification loop (ensures all tables have RLS)
-- -----------------------------------------------------------------------------
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN ('login_attempts', 'password_reset_tokens', 'email_verification_tokens', 'audit_log', 'security_alerts', 'orders', 'order_items', 'semantic_cache')
    LOOP
        EXECUTE 'ALTER TABLE ' || quote_ident(t) || ' ENABLE ROW LEVEL SECURITY;';
    END LOOP;
END $$;
