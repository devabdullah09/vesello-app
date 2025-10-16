-- Debug query to check what's in the gallery_albums table
-- Run this in Supabase SQL Editor to see what albums exist

-- Check all albums in the gallery_albums table
SELECT 
  ga.id,
  ga.event_id,
  ga.name,
  ga.description,
  ga.created_at,
  e.www_id,
  e.title,
  e.organizer_id
FROM gallery_albums ga
LEFT JOIN events e ON e.id = ga.event_id
ORDER BY ga.created_at DESC;

-- Check what events exist and their IDs
SELECT 
  id,
  www_id,
  title,
  organizer_id,
  created_at
FROM events 
WHERE www_id = 'AFWYTLX'
ORDER BY created_at DESC;
