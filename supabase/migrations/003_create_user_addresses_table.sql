-- Migration 003: Create User Addresses Table
-- This script creates the user addresses table for shipping and billing addresses

-- Create user addresses table for shipping and billing addresses
CREATE TABLE IF NOT EXISTS user_addresses (
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
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_default ON user_addresses(user_id, is_default) WHERE is_default = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_addresses_type ON user_addresses(user_id, type);

-- Ensure only one default address per type per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_addresses_unique_default 
ON user_addresses(user_id, type) 
WHERE is_default = TRUE AND is_deleted = FALSE;

-- Enable RLS
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for addresses
CREATE POLICY "Users can manage own addresses" ON user_addresses
    FOR ALL USING (auth.uid() = user_id AND is_deleted = FALSE);

-- Add trigger for updated_at
CREATE TRIGGER update_user_addresses_updated_at 
    BEFORE UPDATE ON user_addresses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to ensure only one default address per type
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default = TRUE THEN
        UPDATE user_addresses 
        SET is_default = FALSE 
        WHERE user_id = NEW.user_id 
        AND type = NEW.type 
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
        AND is_deleted = FALSE;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for default address enforcement
CREATE TRIGGER enforce_single_default_address 
    BEFORE INSERT OR UPDATE ON user_addresses
    FOR EACH ROW EXECUTE FUNCTION ensure_single_default_address();

COMMENT ON TABLE user_addresses IS 'User addresses table for shipping and billing addresses';
COMMENT ON COLUMN user_addresses.type IS 'Address type: billing, shipping, or both';
COMMENT ON COLUMN user_addresses.is_default IS 'Whether this is the default address for the type';
COMMENT ON COLUMN user_addresses.country IS 'ISO 3166-1 alpha-2 country code (e.g., US, CA)';