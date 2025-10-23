-- Debug script to check events table
-- Run this in Supabase SQL Editor to see what events exist

-- Check all events in the database
SELECT id, www_id, title, couple_names, status, created_at 
FROM events 
ORDER BY created_at DESC;

-- Check if AFWYTLX exists
SELECT id, www_id, title, couple_names, status 
FROM events 
WHERE www_id = 'AFWYTLX';

-- Check all www_ids to see what's available
SELECT DISTINCT www_id, title, couple_names 
FROM events 
ORDER BY www_id;
