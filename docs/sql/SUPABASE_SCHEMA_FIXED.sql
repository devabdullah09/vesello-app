-- Supabase Database Schema (Fixed for permissions)
-- Run this in your Supabase SQL Editor

-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create user_profiles table
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('superadmin', 'organizer', 'guest')) DEFAULT 'guest',
  event_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invitation_rsvps table
CREATE TABLE invitation_rsvps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT NOT NULL,
  main_guest JSONB NOT NULL,
  additional_guests JSONB DEFAULT '[]'::jsonb,
  wedding_day_attendance JSONB DEFAULT '{}'::jsonb,
  after_party_attendance JSONB DEFAULT '{}'::jsonb,
  food_preferences JSONB DEFAULT '{}'::jsonb,
  accommodation_needed JSONB DEFAULT '{}'::jsonb,
  transportation_needed JSONB DEFAULT '{}'::jsonb,
  notes JSONB DEFAULT '{}'::jsonb,
  email TEXT,
  send_email_confirmation BOOLEAN DEFAULT true,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled')) DEFAULT 'pending'
);

-- Create gallery_content table for custom gallery content
CREATE TABLE gallery_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id)
);

-- Create indexes for better performance
CREATE INDEX idx_invitation_rsvps_event_id ON invitation_rsvps(event_id);
CREATE INDEX idx_invitation_rsvps_submitted_at ON invitation_rsvps(submitted_at);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_gallery_content_event_id ON gallery_content(event_id);

-- Row Level Security Policies

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role can manage all profiles" ON user_profiles
  FOR ALL USING (auth.role() = 'service_role');

-- RSVP policies
CREATE POLICY "Anyone can create RSVPs" ON invitation_rsvps
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read RSVPs" ON invitation_rsvps
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage all RSVPs" ON invitation_rsvps
  FOR ALL USING (auth.role() = 'service_role');

-- Gallery content policies
CREATE POLICY "Service role can manage all gallery content" ON gallery_content
  FOR ALL USING (auth.role() = 'service_role');

-- Function to automatically create user profile on signup
-- This will be called manually in our auth code instead of using a trigger
CREATE OR REPLACE FUNCTION public.handle_new_user(
  user_id UUID,
  user_email TEXT,
  user_display_name TEXT DEFAULT ''
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, display_name, role, created_at, last_login)
  VALUES (
    user_id,
    user_email,
    COALESCE(user_display_name, ''),
    'guest',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.handle_new_user TO authenticated;

