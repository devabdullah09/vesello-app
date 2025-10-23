-- Debug script to check the actual structure of the events table
-- Run this in Supabase SQL Editor to see what's in your events table

-- First, let's see the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'events' 
ORDER BY ordinal_position;

-- Check what events exist
SELECT id, www_id, title, couple_names, status, created_at 
FROM events 
ORDER BY created_at DESC 
LIMIT 10;

-- Check specifically for AFWYTLX
SELECT id, www_id, title, couple_names, status 
FROM events 
WHERE www_id = 'AFWYTLX';

-- Check all www_ids to see what's available
SELECT DISTINCT www_id, title, couple_names 
FROM events 
ORDER BY www_id;

-- Check if there are any events at all
SELECT COUNT(*) as total_events FROM events;
