-- Create a sample event for testing if none exists
-- Run this in Supabase SQL Editor if the event doesn't exist

-- Check if AFWYTLX event exists
SELECT id, www_id, title, couple_names, status 
FROM events 
WHERE www_id = 'AFWYTLX';

-- If the above returns no rows, create the event
INSERT INTO events (
    www_id, 
    title, 
    couple_names, 
    event_date, 
    status, 
    gallery_enabled,
    organizer_id
) VALUES (
    'AFWYTLX',
    'Wedding - Astor & Canon',
    'Astor & Canon',
    CURRENT_DATE,
    'active',
    true,
    (SELECT id FROM auth.users LIMIT 1) -- Use first user as organizer
) ON CONFLICT (www_id) DO NOTHING;

-- Verify the event was created
SELECT id, www_id, title, couple_names, status 
FROM events 
WHERE www_id = 'AFWYTLX';
