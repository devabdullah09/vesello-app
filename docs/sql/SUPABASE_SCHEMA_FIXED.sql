-- Supabase Database Schema (Fixed for permissions)
-- Run this in your Supabase SQL Editor

-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create events table
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  www_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  couple_names TEXT NOT NULL,
  date DATE,
  event_date DATE,
  venue TEXT,
  description TEXT,
  organizer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('planned', 'active', 'completed', 'cancelled')) DEFAULT 'planned',
  gallery_enabled BOOLEAN DEFAULT false,
  rsvp_enabled BOOLEAN DEFAULT false,
  settings JSONB DEFAULT '{}'::jsonb,
  section_visibility JSONB DEFAULT '{}'::jsonb,
  section_content JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint for organizer_id to user_profiles
ALTER TABLE events 
ADD CONSTRAINT events_organizer_id_fkey 
FOREIGN KEY (organizer_id) REFERENCES user_profiles(id) ON DELETE SET NULL;

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
  custom_responses JSONB DEFAULT '{}'::jsonb,
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

-- Create rsvp_form_questions table for custom RSVP questions
CREATE TABLE rsvp_form_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('yes_no', 'multiple_choice', 'text', 'attendance', 'food_preference')),
  title TEXT NOT NULL,
  description TEXT,
  options JSONB DEFAULT '[]'::jsonb,
  required BOOLEAN DEFAULT true,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_events_www_id ON events(www_id);
CREATE INDEX idx_events_organizer_id ON events(organizer_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_event_date ON events(event_date);
CREATE INDEX idx_invitation_rsvps_event_id ON invitation_rsvps(event_id);
CREATE INDEX idx_invitation_rsvps_submitted_at ON invitation_rsvps(submitted_at);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_event_id ON user_profiles(event_id);
CREATE INDEX idx_gallery_content_event_id ON gallery_content(event_id);
CREATE INDEX idx_rsvp_form_questions_event_id ON rsvp_form_questions(event_id);
CREATE INDEX idx_rsvp_form_questions_order ON rsvp_form_questions(event_id, order_index);

-- Row Level Security Policies

-- Events policies
CREATE POLICY "Organizers can view their own events" ON events
  FOR SELECT USING (
    organizer_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

CREATE POLICY "Organizers can update their own events" ON events
  FOR UPDATE USING (
    organizer_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

CREATE POLICY "Superadmins can create events" ON events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

CREATE POLICY "Superadmins can delete events" ON events
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

CREATE POLICY "Service role can manage all events" ON events
  FOR ALL USING (auth.role() = 'service_role');

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Superadmins can view all profiles" ON user_profiles
  FOR SELECT USING (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.id = auth.uid() AND up.role = 'superadmin'
    )
  );

CREATE POLICY "Superadmins can create profiles" ON user_profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

CREATE POLICY "Superadmins can update profiles" ON user_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

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

-- RSVP form questions policies
CREATE POLICY "Service role can manage all RSVP form questions" ON rsvp_form_questions
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

