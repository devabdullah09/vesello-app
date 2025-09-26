-- Fix Dashboard Data
-- Run this in your Supabase SQL Editor

-- 1. Update some events to active status
UPDATE events 
SET status = 'active' 
WHERE id IN (
  SELECT id FROM events 
  ORDER BY created_at DESC 
  LIMIT 3
);

-- 2. Check RSVP statuses
SELECT 
  id, 
  event_id, 
  main_guest->>'name' as guest_name,
  status,
  submitted_at
FROM invitation_rsvps 
LIMIT 5;

-- 3. Update some RSVPs to pending status if needed
UPDATE invitation_rsvps 
SET status = 'pending' 
WHERE id IN (
  SELECT id FROM invitation_rsvps 
  ORDER BY submitted_at DESC 
  LIMIT 2
);

-- 4. Add some test gallery data
INSERT INTO gallery_albums (event_id, name, description)
SELECT 
  www_id,
  'Wedding Photos',
  'Main wedding photo album'
FROM events 
WHERE status = 'active'
LIMIT 1;

-- 5. Add test gallery images
INSERT INTO gallery_images (album_id, event_id, filename, image_url, is_approved)
SELECT 
  ga.id,
  ga.event_id,
  'test-photo-' || generate_random_uuid()::text,
  'https://example.com/test-photo.jpg',
  true
FROM gallery_albums ga
LIMIT 3;

-- 6. Verify the changes
SELECT 'Events by status:' as info;
SELECT status, COUNT(*) as count FROM events GROUP BY status;

SELECT 'RSVPs by status:' as info;
SELECT status, COUNT(*) as count FROM invitation_rsvps GROUP BY status;

SELECT 'Gallery data:' as info;
SELECT COUNT(*) as album_count FROM gallery_albums;
SELECT COUNT(*) as image_count FROM gallery_images;
