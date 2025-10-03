-- Fix for webhook user creation
-- Run this in your Supabase SQL Editor

-- First, let's check the current constraint
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE constraint_type = 'FOREIGN KEY' AND tc.table_name='user_profiles';

-- Temporarily drop the foreign key constraint to allow webhook users
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;

-- Add a new constraint that allows NULL or valid auth.users references
-- We'll handle this at the application level for now

-- Test inserting a webhook user
INSERT INTO user_profiles (id, email, display_name, role, subscription_status)
VALUES ('webhook-test-123', 'webhook-test@example.com', 'Webhook Test User', 'organizer', 'active')
ON CONFLICT (id) DO NOTHING;

-- Check if it worked
SELECT * FROM user_profiles WHERE email = 'webhook-test@example.com';

-- Clean up test data
DELETE FROM user_profiles WHERE email = 'webhook-test@example.com';
