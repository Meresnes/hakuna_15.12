-- Migration: 003-update-brightness-min
-- Description: Update brightness_min to make initial planet background dimmer
-- Created: 2024

-- Update brightness_min from 0.2 to 0.1 for dimmer initial state
UPDATE settings 
SET value = '0.1', updated_at = NOW()
WHERE key = 'brightness_min' AND value = '0.2';
