# Setup Test Data for Dashboard

## Step 1: Create Gallery Tables

1. Go to your Supabase SQL Editor
2. Run this SQL to create the gallery tables:

```sql
-- Create gallery_albums table
CREATE TABLE IF NOT EXISTS gallery_albums (
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
CREATE TABLE IF NOT EXISTS gallery_images (
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_gallery_albums_event_id ON gallery_albums(event_id);
CREATE INDEX IF NOT EXISTS idx_gallery_images_event_id ON gallery_images(event_id);
CREATE INDEX IF NOT EXISTS idx_gallery_images_album_id ON gallery_images(album_id);

-- Enable RLS
ALTER TABLE gallery_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Service role can manage all gallery albums" ON gallery_albums
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all gallery images" ON gallery_images
  FOR ALL USING (auth.role() = 'service_role');
```

## Step 2: Update Event Statuses

Run this to set some events as active:

```sql
-- Update some events to active status
UPDATE events
SET status = 'active'
WHERE id IN (
  SELECT id FROM events
  ORDER BY created_at DESC
  LIMIT 3
);
```

## Step 3: Add Test RSVPs

Run this to add some test RSVPs:

```sql
-- Insert test RSVPs
INSERT INTO invitation_rsvps (event_id, main_guest, status)
SELECT
  www_id,
  '{"name": "Test Guest", "email": "test@example.com"}'::jsonb,
  'pending'
FROM events
WHERE status = 'active'
LIMIT 2;
```

## Step 4: Add Test Gallery Data

Run this to add some test gallery data:

```sql
-- Insert test gallery album
INSERT INTO gallery_albums (event_id, name, description)
SELECT
  www_id,
  'Wedding Photos',
  'Main wedding photo album'
FROM events
WHERE status = 'active'
LIMIT 1;

-- Insert test gallery images
INSERT INTO gallery_images (album_id, event_id, filename, image_url, is_approved)
SELECT
  ga.id,
  ga.event_id,
  'test-photo-' || generate_random_uuid()::text,
  'https://example.com/test-photo.jpg',
  true
FROM gallery_albums ga
LIMIT 3;
```

## Step 5: Test the Dashboard

1. Visit `http://localhost:3000/dashboard`
2. Check the browser console for debug logs
3. The statistics should now show real data

## Debug Endpoint

You can also visit `http://localhost:3000/api/debug/dashboard` to see raw data from the database.
