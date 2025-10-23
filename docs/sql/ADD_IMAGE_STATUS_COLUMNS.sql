-- Add image status columns to gallery_images table
-- These columns track whether images are published, hidden, or favorited

-- Add the new columns
ALTER TABLE gallery_images 
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_gallery_images_status 
ON gallery_images(event_id, album_id, is_published, is_hidden, is_favorite);

-- Update existing records to have default values
UPDATE gallery_images 
SET 
  is_published = COALESCE(is_published, TRUE),
  is_hidden = COALESCE(is_hidden, FALSE),
  is_favorite = COALESCE(is_favorite, FALSE)
WHERE is_published IS NULL OR is_hidden IS NULL OR is_favorite IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN gallery_images.is_published IS 'Whether the image is visible to guests on the public gallery';
COMMENT ON COLUMN gallery_images.is_hidden IS 'Whether the image is hidden from guests but visible to admin/organizer';
COMMENT ON COLUMN gallery_images.is_favorite IS 'Whether the image is marked as favorite by admin/organizer';
