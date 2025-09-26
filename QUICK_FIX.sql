-- Quick Fix: Add missing columns and set all sections visible
-- Run this in your Supabase SQL Editor

-- Add the missing columns
ALTER TABLE events ADD COLUMN IF NOT EXISTS section_visibility JSONB DEFAULT '{}'::jsonb;
ALTER TABLE events ADD COLUMN IF NOT EXISTS section_content JSONB DEFAULT '{}'::jsonb;

-- Set all sections to visible for all events
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
}'::jsonb;

-- Add basic section content
UPDATE events 
SET section_content = '{
    "heroSection": {"coupleNames": "", "eventDate": "", "venue": "", "backgroundImage": "", "customMessage": "WE'\''RE GETTING MARRIED!"},
    "timelineSection": {"title": "Wedding Day", "events": []},
    "ceremonySection": {"title": "Ceremony Details", "description": "Join us as we exchange vows in a beautiful ceremony.", "date": "", "time": "12:00 PM", "location": "", "details": ""},
    "ceremonyVenueSection": {"title": "Ceremony Venue", "venueName": "Wedding Venue", "address": "", "description": "A beautiful location for our special day.", "mapUrl": "", "images": []},
    "seatingChartSection": {"title": "Seating Chart", "description": "Find your seat for the reception.", "tables": []},
    "menuSection": {"title": "Wedding Menu", "description": "Delicious food prepared specially for our celebration.", "courses": []},
    "wishesAndGiftsSection": {"title": "Wishes & Gifts", "description": "Your presence is the greatest gift, but if you wish to honor us with a gift, here are some suggestions.", "registryLinks": [], "wishesMessage": "We are so grateful for your love and support!"},
    "teamSection": {"title": "Wedding Team", "description": "Meet the special people who will be part of our big day.", "members": []},
    "accommodationSection": {"title": "Accommodation", "description": "Here are some hotel options for out-of-town guests.", "hotels": []},
    "transportationSection": {"title": "Transportation", "description": "Information about getting to and from the venue.", "options": []},
    "additionalInfoSection": {"title": "Additional Information", "content": "Here you can find any additional details about our wedding day.", "items": []}
}'::jsonb;

SELECT 'Quick fix completed! All sections should now be visible.' as message;
