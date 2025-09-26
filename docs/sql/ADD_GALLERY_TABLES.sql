-- Add Gallery Tables for Photo Management
-- Run this in your Supabase SQL Editor

-- Create gallery_albums table
CREATE TABLE gallery_albums (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gallery_images table
CREATE TABLE gallery_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  album_id UUID REFERENCES gallery_albums(id) ON DELETE CASCADE,
  event_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  original_filename TEXT,
  file_size INTEGER,
  mime_type TEXT,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_approved BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_gallery_albums_event_id ON gallery_albums(event_id);
CREATE INDEX idx_gallery_images_event_id ON gallery_images(event_id);
CREATE INDEX idx_gallery_images_album_id ON gallery_images(album_id);
CREATE INDEX idx_gallery_images_uploaded_by ON gallery_images(uploaded_by);
CREATE INDEX idx_gallery_images_is_approved ON gallery_images(is_approved);
CREATE INDEX idx_gallery_images_created_at ON gallery_images(created_at);

-- Add foreign key constraint for event_id in gallery_albums
ALTER TABLE gallery_albums 
ADD CONSTRAINT gallery_albums_event_id_fkey 
FOREIGN KEY (event_id) REFERENCES events(www_id) ON DELETE CASCADE;

-- Add foreign key constraint for event_id in gallery_images
ALTER TABLE gallery_images 
ADD CONSTRAINT gallery_images_event_id_fkey 
FOREIGN KEY (event_id) REFERENCES events(www_id) ON DELETE CASCADE;

-- Row Level Security Policies for gallery_albums
CREATE POLICY "Service role can manage all gallery albums" ON gallery_albums
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Organizers can view their event albums" ON gallery_albums
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE www_id = gallery_albums.event_id 
      AND organizer_id = auth.uid()
    )
  );

CREATE POLICY "Organizers can manage their event albums" ON gallery_albums
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE www_id = gallery_albums.event_id 
      AND organizer_id = auth.uid()
    )
  );

-- Row Level Security Policies for gallery_images
CREATE POLICY "Service role can manage all gallery images" ON gallery_images
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Organizers can view their event images" ON gallery_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE www_id = gallery_images.event_id 
      AND organizer_id = auth.uid()
    )
  );

CREATE POLICY "Organizers can manage their event images" ON gallery_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE www_id = gallery_images.event_id 
      AND organizer_id = auth.uid()
    )
  );

-- Enable RLS on both tables
ALTER TABLE gallery_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
