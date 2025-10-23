-- Create gallery_image_tags table for storing photo tags
CREATE TABLE IF NOT EXISTS gallery_image_tags (
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

-- Add RLS (Row Level Security) policies
ALTER TABLE gallery_image_tags ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read tags for their events
CREATE POLICY "Users can read tags for their events" ON gallery_image_tags
    FOR SELECT USING (
        event_id IN (
            SELECT www_id FROM events 
            WHERE organizer_id = auth.uid()
        )
    );

-- Policy to allow users to insert tags for their events
CREATE POLICY "Users can insert tags for their events" ON gallery_image_tags
    FOR INSERT WITH CHECK (
        event_id IN (
            SELECT www_id FROM events 
            WHERE organizer_id = auth.uid()
        )
    );

-- Policy to allow users to update tags for their events
CREATE POLICY "Users can update tags for their events" ON gallery_image_tags
    FOR UPDATE USING (
        event_id IN (
            SELECT www_id FROM events 
            WHERE organizer_id = auth.uid()
        )
    );

-- Policy to allow users to delete tags for their events
CREATE POLICY "Users can delete tags for their events" ON gallery_image_tags
    FOR DELETE USING (
        event_id IN (
            SELECT www_id FROM events 
            WHERE organizer_id = auth.uid()
        )
    );

-- Additional policy to allow service role to bypass RLS for API operations
CREATE POLICY "Service role can manage all tags" ON gallery_image_tags
    FOR ALL USING (true)
    WITH CHECK (true);
