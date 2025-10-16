-- Safe fix for Gallery Tables Foreign Key and RLS Issues
-- This version handles existing policies gracefully

-- Drop the incorrect foreign key constraint
ALTER TABLE gallery_albums 
DROP CONSTRAINT IF EXISTS gallery_albums_event_id_fkey;

ALTER TABLE gallery_images 
DROP CONSTRAINT IF EXISTS gallery_images_event_id_fkey;

-- Add the correct foreign key constraints (using events.id, not events.www_id)
ALTER TABLE gallery_albums 
ADD CONSTRAINT gallery_albums_event_id_fkey 
FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;

ALTER TABLE gallery_images 
ADD CONSTRAINT gallery_images_event_id_fkey 
FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;

-- Drop ALL existing policies (safer approach)
DROP POLICY IF EXISTS "Service role can manage all gallery albums" ON gallery_albums;
DROP POLICY IF EXISTS "Organizers can view their event albums" ON gallery_albums;
DROP POLICY IF EXISTS "Organizers can manage their event albums" ON gallery_albums;
DROP POLICY IF EXISTS "Admins can manage all gallery albums" ON gallery_albums;

DROP POLICY IF EXISTS "Service role can manage all gallery images" ON gallery_images;
DROP POLICY IF EXISTS "Organizers can view their event images" ON gallery_images;
DROP POLICY IF EXISTS "Organizers can manage their event images" ON gallery_images;
DROP POLICY IF EXISTS "Admins can manage all gallery images" ON gallery_images;

-- Create the correct RLS policies (using events.id, not events.www_id)
CREATE POLICY "Service role can manage all gallery albums" ON gallery_albums
  FOR ALL USING (auth.role() = 'service_role');

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

CREATE POLICY "Admins can manage all gallery albums" ON gallery_albums
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Service role can manage all gallery images" ON gallery_images
  FOR ALL USING (auth.role() = 'service_role');

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

CREATE POLICY "Admins can manage all gallery images" ON gallery_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );
