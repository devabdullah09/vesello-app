-- Create gallery_image_status table for default albums (wedding-day, party-day)
-- This table stores status information for files that are stored in Bunny.net
-- but don't have entries in the gallery_images table

CREATE TABLE IF NOT EXISTS gallery_image_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    album_id VARCHAR(255) NOT NULL,
    file_name VARCHAR(500) NOT NULL,
    is_published BOOLEAN DEFAULT TRUE,
    is_hidden BOOLEAN DEFAULT FALSE,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique combination of event, album, and file
    CONSTRAINT unique_file_status UNIQUE (event_id, album_id, file_name)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_gallery_image_status_event_album 
ON gallery_image_status(event_id, album_id);

CREATE INDEX IF NOT EXISTS idx_gallery_image_status_status 
ON gallery_image_status(event_id, album_id, is_published, is_hidden, is_favorite);

-- Add RLS policies
ALTER TABLE gallery_image_status ENABLE ROW LEVEL SECURITY;

-- Policy for reading statuses
CREATE POLICY "Users can read statuses for their events" ON gallery_image_status
    FOR SELECT USING (
        event_id IN (
            SELECT id FROM events 
            WHERE organizer_id = auth.uid()
        )
    );

-- Policy for inserting statuses
CREATE POLICY "Users can insert statuses for their events" ON gallery_image_status
    FOR INSERT WITH CHECK (
        event_id IN (
            SELECT id FROM events 
            WHERE organizer_id = auth.uid()
        )
    );

-- Policy for updating statuses
CREATE POLICY "Users can update statuses for their events" ON gallery_image_status
    FOR UPDATE USING (
        event_id IN (
            SELECT id FROM events 
            WHERE organizer_id = auth.uid()
        )
    );

-- Policy for deleting statuses
CREATE POLICY "Users can delete statuses for their events" ON gallery_image_status
    FOR DELETE USING (
        event_id IN (
            SELECT id FROM events 
            WHERE organizer_id = auth.uid()
        )
    );

-- Add comments for documentation
COMMENT ON TABLE gallery_image_status IS 'Stores status information (published/hidden/favorite) for default album files stored in Bunny.net';
COMMENT ON COLUMN gallery_image_status.event_id IS 'Reference to the event this file belongs to';
COMMENT ON COLUMN gallery_image_status.album_id IS 'Album identifier (wedding-day, party-day, etc.)';
COMMENT ON COLUMN gallery_image_status.file_name IS 'Original filename of the file in Bunny.net';
COMMENT ON COLUMN gallery_image_status.is_published IS 'Whether the file is visible to guests on the public gallery';
COMMENT ON COLUMN gallery_image_status.is_hidden IS 'Whether the file is hidden from guests but visible to admin/organizer';
COMMENT ON COLUMN gallery_image_status.is_favorite IS 'Whether the file is marked as favorite by admin/organizer';
