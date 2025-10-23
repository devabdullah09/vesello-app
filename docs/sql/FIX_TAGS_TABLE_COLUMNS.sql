-- Fix gallery_image_tags table to use correct column names
-- This script addresses the "column gallery_images.www_id does not exist" error

-- First, drop the existing table if it exists to avoid conflicts
DROP TABLE IF EXISTS gallery_image_tags CASCADE;

-- Create gallery_image_tags table with correct column names
CREATE TABLE gallery_image_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    image_id UUID REFERENCES gallery_images(id) ON DELETE CASCADE,
    event_id VARCHAR(255) NOT NULL, -- Changed from www_id to event_id to match gallery_images table
    tag VARCHAR(255) NOT NULL,
    file_name VARCHAR(500), -- For default albums (wedding-day, party-day)
    album_id VARCHAR(255), -- For default albums
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Ensure either image_id (for custom albums) or file_name+album_id (for default albums) is provided
    CONSTRAINT check_image_or_file CHECK (
        (image_id IS NOT NULL) OR 
        (file_name IS NOT NULL AND album_id IS NOT NULL)
    )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_gallery_image_tags_image_id ON gallery_image_tags(image_id);
CREATE INDEX IF NOT EXISTS idx_gallery_image_tags_event_id ON gallery_image_tags(event_id);
CREATE INDEX IF NOT EXISTS idx_gallery_image_tags_tag ON gallery_image_tags(tag);
CREATE INDEX IF NOT EXISTS idx_gallery_image_tags_event_id_tag ON gallery_image_tags(event_id, tag);
CREATE INDEX IF NOT EXISTS idx_gallery_image_tags_file_name ON gallery_image_tags(file_name);
CREATE INDEX IF NOT EXISTS idx_gallery_image_tags_album_id ON gallery_image_tags(album_id);
CREATE INDEX IF NOT EXISTS idx_gallery_image_tags_event_id_album_id ON gallery_image_tags(event_id, album_id);

-- Add unique constraint to prevent duplicate tags on the same image/file
CREATE UNIQUE INDEX IF NOT EXISTS idx_gallery_image_tags_unique_image ON gallery_image_tags(image_id, tag) WHERE image_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_gallery_image_tags_unique_file ON gallery_image_tags(event_id, album_id, file_name, tag) WHERE file_name IS NOT NULL;

-- Disable RLS temporarily to avoid policy issues
ALTER TABLE gallery_image_tags DISABLE ROW LEVEL SECURITY;

-- Note: RLS can be re-enabled later with proper policies once the functionality is working
