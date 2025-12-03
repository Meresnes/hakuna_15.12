-- Migration: 001-create-votes
-- Description: Create votes table for storing user selections
-- Created: 2024

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) NOT NULL,
    choice SMALLINT NOT NULL CHECK (choice BETWEEN 1 AND 4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries by created_at (for last50)
CREATE INDEX IF NOT EXISTS idx_votes_created_at ON votes (created_at DESC);

-- Create index for counting by choice
CREATE INDEX IF NOT EXISTS idx_votes_choice ON votes (choice);

COMMENT ON TABLE votes IS 'Stores user votes/selections for good deeds';
COMMENT ON COLUMN votes.id IS 'Unique identifier for the vote';
COMMENT ON COLUMN votes.name IS 'Name of the person who voted';
COMMENT ON COLUMN votes.choice IS 'Selected option (1-4)';
COMMENT ON COLUMN votes.created_at IS 'Timestamp when the vote was cast';

