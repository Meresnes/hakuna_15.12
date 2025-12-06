-- Migration: 002-create-settings
-- Description: Create settings table for application configuration
-- Created: 2024

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(64) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO settings (key, value) VALUES
    ('code', '8375'),
    ('target_count', '110'),
    ('brightness_min', '0.1'),
    ('brightness_max', '1.10')
ON CONFLICT (key) DO NOTHING;

COMMENT ON TABLE settings IS 'Application configuration key-value store';
COMMENT ON COLUMN settings.key IS 'Setting identifier';
COMMENT ON COLUMN settings.value IS 'Setting value as text';
COMMENT ON COLUMN settings.updated_at IS 'Last update timestamp';

