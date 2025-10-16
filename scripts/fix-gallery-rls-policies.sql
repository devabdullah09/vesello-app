-- Fix Row Level Security Policies for gallery_albums table
-- The policies were checking www_id but should check the database id

-- Drop existing policies
DROP POLICY IF EXISTS "Organizers can view their event albums" ON gallery_albums;
DROP POLICY IF EXISTS "Organizers can manage their event albums" ON gallery_albums;

-- Create new policies that work with database IDs
CREATE POLICY "Organizers can view their event albums" ON gallery_albums
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE id = gallery_albums.event_id 
      AND organizer_id = auth.uid()
    )
  );

CREATE POLICY "Organizers can manage their event albums" ON gallery_albums
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE id = gallery_albums.event_id 
      AND organizer_id = auth.uid()
    )
  );

-- Also fix gallery_images policies
DROP POLICY IF EXISTS "Organizers can view their event images" ON gallery_images;
DROP POLICY IF EXISTS "Organizers can manage their event images" ON gallery_images;

CREATE POLICY "Organizers can view their event images" ON gallery_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE id = gallery_images.event_id 
      AND organizer_id = auth.uid()
    )
  );

CREATE POLICY "Organizers can manage their event images" ON gallery_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE id = gallery_images.event_id 
      AND organizer_id = auth.uid()
    )
  );

-- Enable RLS on both tables
ALTER TABLE gallery_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
