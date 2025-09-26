-- Migration to add section_visibility and section_content columns to events table
-- Run this in your Supabase SQL Editor

-- Add section_visibility column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' 
        AND column_name = 'section_visibility'
    ) THEN
        ALTER TABLE events ADD COLUMN section_visibility JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- Add section_content column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' 
        AND column_name = 'section_content'
    ) THEN
        ALTER TABLE events ADD COLUMN section_content JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- Update existing events to have default section visibility
UPDATE events 
SET section_visibility = '{
    "heroSection": true,
    "timelineSection": true,
    "ceremonySection": true,
    "ceremonyVenueSection": true,
    "seatingChartSection": true,
    "menuSection": true,
    "wishesAndGiftsSection": true,
    "teamSection": true,
    "accommodationSection": true,
    "transportationSection": true,
    "additionalInfoSection": true
}'::jsonb
WHERE section_visibility = '{}'::jsonb OR section_visibility IS NULL;

-- Update existing events to have default section content
UPDATE events 
SET section_content = '{
    "heroSection": {
        "coupleNames": "",
        "eventDate": "",
        "venue": "",
        "backgroundImage": "",
        "customMessage": "WE'\''RE GETTING MARRIED!"
    },
    "timelineSection": {
        "title": "Wedding Day",
        "events": [
            {"id": "1", "time": "11:00 AM", "title": "WELCOME TOAST", "description": "", "icon": "/images/toast.png"},
            {"id": "2", "time": "12:00 PM", "title": "CEREMONY", "description": "", "icon": "/images/ceremony.png"},
            {"id": "3", "time": "01:00 PM", "title": "WEDDING LUNCH", "description": "", "icon": "/images/lunch.png"},
            {"id": "4", "time": "03:00 PM", "title": "CAKE CUTTING", "description": "", "icon": "/images/cake.png"},
            {"id": "5", "time": "04:00 PM", "title": "FIRST DANCE", "description": "", "icon": "/images/dance.png"},
            {"id": "6", "time": "05:00 PM", "title": "COCKTAIL HOUR", "description": "", "icon": "/images/cocktail.png"},
            {"id": "7", "time": "08:00 PM", "title": "BUFFET DINNER", "description": "", "icon": "/images/dinner.png"},
            {"id": "8", "time": "11:30 PM", "title": "FIREWORKS", "description": "", "icon": "/images/fireworks.png"}
        ]
    },
    "ceremonySection": {
        "title": "Ceremony Details",
        "description": "Join us as we exchange vows in a beautiful ceremony.",
        "date": "",
        "time": "12:00 PM",
        "location": "",
        "details": ""
    },
    "ceremonyVenueSection": {
        "title": "Ceremony Venue",
        "venueName": "Wedding Venue",
        "address": "",
        "description": "A beautiful location for our special day.",
        "mapUrl": "",
        "images": []
    },
    "seatingChartSection": {
        "title": "Seating Chart",
        "description": "Find your seat for the reception.",
        "tables": []
    },
    "menuSection": {
        "title": "Wedding Menu",
        "description": "Delicious food prepared specially for our celebration.",
        "courses": []
    },
    "wishesAndGiftsSection": {
        "title": "Wishes & Gifts",
        "description": "Your presence is the greatest gift, but if you wish to honor us with a gift, here are some suggestions.",
        "registryLinks": [],
        "wishesMessage": "We are so grateful for your love and support!"
    },
    "teamSection": {
        "title": "Wedding Team",
        "description": "Meet the special people who will be part of our big day.",
        "members": []
    },
    "accommodationSection": {
        "title": "Accommodation",
        "description": "Here are some hotel options for out-of-town guests.",
        "hotels": []
    },
    "transportationSection": {
        "title": "Transportation",
        "description": "Information about getting to and from the venue.",
        "options": []
    },
    "additionalInfoSection": {
        "title": "Additional Information",
        "content": "Here you can find any additional details about our wedding day.",
        "items": []
    }
}'::jsonb
WHERE section_content = '{}'::jsonb OR section_content IS NULL;

-- Update section_content with actual event data where available
UPDATE events 
SET section_content = jsonb_set(
    jsonb_set(
        jsonb_set(
            section_content,
            '{heroSection,coupleNames}',
            to_jsonb(couple_names)
        ),
        '{heroSection,eventDate}',
        to_jsonb(event_date::text)
    ),
    '{heroSection,venue}',
    to_jsonb(venue)
)
WHERE couple_names IS NOT NULL OR event_date IS NOT NULL OR venue IS NOT NULL;

-- Update ceremony section with actual event data
UPDATE events 
SET section_content = jsonb_set(
    jsonb_set(
        jsonb_set(
            section_content,
            '{ceremonySection,date}',
            to_jsonb(event_date::text)
        ),
        '{ceremonySection,location}',
        to_jsonb(venue)
    ),
    '{ceremonyVenueSection,venueName}',
    to_jsonb(venue)
)
WHERE event_date IS NOT NULL OR venue IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN events.section_visibility IS 'Controls which sections are visible on the event website';
COMMENT ON COLUMN events.section_content IS 'Contains the content for all sections of the event website';
