-- MINIMAL MIGRATION - Run this step by step
-- Copy and paste each section one at a time

-- Step 1: Add the columns
ALTER TABLE events ADD COLUMN section_visibility JSONB;
ALTER TABLE events ADD COLUMN section_content JSONB;

-- Step 2: Set all sections to visible
UPDATE events 
SET section_visibility = '{"heroSection": true, "timelineSection": true, "ceremonySection": true, "ceremonyVenueSection": true, "seatingChartSection": true, "menuSection": true, "wishesAndGiftsSection": true, "teamSection": true, "accommodationSection": true, "transportationSection": true, "additionalInfoSection": true}';

-- Step 3: Add basic content for all sections
UPDATE events 
SET section_content = '{
  "heroSection": {"coupleNames": "", "eventDate": "", "venue": "", "customMessage": "WE ARE GETTING MARRIED!"},
  "timelineSection": {"title": "Wedding Day", "events": []},
  "ceremonySection": {"title": "Ceremony Details", "description": "Join us as we exchange vows in a beautiful ceremony."},
  "ceremonyVenueSection": {"title": "Ceremony Venue", "venueName": "Wedding Venue"},
  "seatingChartSection": {"title": "Seating Chart", "description": "Find your seat for the reception."},
  "menuSection": {"title": "Wedding Menu", "description": "Delicious food prepared specially for our celebration."},
  "wishesAndGiftsSection": {"title": "Wishes & Gifts", "description": "Your presence is the greatest gift."},
  "teamSection": {"title": "Wedding Team", "description": "Meet the special people who will be part of our big day."},
  "accommodationSection": {"title": "Accommodation", "description": "Here are some hotel options for out-of-town guests."},
  "transportationSection": {"title": "Transportation", "description": "Information about getting to and from the venue."},
  "additionalInfoSection": {"title": "Additional Information", "content": "Here you can find any additional details about our wedding day."}
}';

-- Step 4: Verify it worked
SELECT 'Migration completed! Check your events now.' as message;
