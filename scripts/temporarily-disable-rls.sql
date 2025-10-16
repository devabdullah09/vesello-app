-- Temporarily disable RLS for testing
-- This will allow us to see if the data is accessible without RLS restrictions

-- Disable RLS on gallery_albums table
ALTER TABLE gallery_albums DISABLE ROW LEVEL SECURITY;

-- Disable RLS on gallery_images table  
ALTER TABLE gallery_images DISABLE ROW LEVEL SECURITY;

-- Note: This is temporary for testing only!
-- Re-enable RLS after confirming the data is accessible:
-- ALTER TABLE gallery_albums ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
