-- Add foreign key constraint for organizer_id to user_profiles
-- Run this in your Supabase SQL Editor after running the main schema

-- First, check if the constraint already exists
DO $$ 
BEGIN
    -- Try to add the constraint
    BEGIN
        ALTER TABLE events 
        ADD CONSTRAINT events_organizer_id_fkey 
        FOREIGN KEY (organizer_id) REFERENCES user_profiles(id) ON DELETE SET NULL;
        
        RAISE NOTICE 'Foreign key constraint added successfully';
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE 'Foreign key constraint already exists';
        WHEN OTHERS THEN
            RAISE NOTICE 'Error adding foreign key constraint: %', SQLERRM;
    END;
END $$;
