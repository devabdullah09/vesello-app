-- Fix Gallery Tables - Change event_id to TEXT to match www_id
-- Run this in your Supabase SQL Editor

-- Drop existing foreign key constraints
ALTER TABLE gallery_albums DROP CONSTRAINT IF EXISTS gallery_albums_event_id_fkey;
ALTER TABLE gallery_images DROP CONSTRAINT IF EXISTS gallery_images_event_id_fkey;

-- Alter the columns to be TEXT instead of UUID
ALTER TABLE gallery_albums ALTER COLUMN event_id TYPE TEXT;
ALTER TABLE gallery_images ALTER COLUMN event_id TYPE TEXT;

-- Recreate foreign key constraints pointing to events.www_id
ALTER TABLE gallery_albums 
ADD CONSTRAINT gallery_albums_event_id_fkey 
FOREIGN KEY (event_id) REFERENCES events(www_id) ON DELETE CASCADE;

ALTER TABLE gallery_images 
ADD CONSTRAINT gallery_images_event_id_fkey 
FOREIGN KEY (event_id) REFERENCES events(www_id) ON DELETE CASCADE;

-- Update the indexes
DROP INDEX IF EXISTS idx_gallery_albums_event_id;
DROP INDEX IF EXISTS idx_gallery_images_event_id;

CREATE INDEX idx_gallery_albums_event_id ON gallery_albums(event_id);
CREATE INDEX idx_gallery_images_event_id ON gallery_images(event_id);
