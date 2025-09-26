-- Simple migration to add section_visibility and section_content columns to events table
-- Run this in your Supabase SQL Editor

-- Add section_visibility column
ALTER TABLE events ADD COLUMN IF NOT EXISTS section_visibility JSONB DEFAULT '{}'::jsonb;

-- Add section_content column  
ALTER TABLE events ADD COLUMN IF NOT EXISTS section_content JSONB DEFAULT '{}'::jsonb;

-- Add comments
COMMENT ON COLUMN events.section_visibility IS 'Controls which sections are visible on the event website';
COMMENT ON COLUMN events.section_content IS 'Contains the content for all sections of the event website';
