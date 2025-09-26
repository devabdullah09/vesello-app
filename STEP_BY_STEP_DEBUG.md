# 🔍 Step-by-Step Debugging Guide

## The Problem

You're still only seeing 3 sections (Hero, Timeline, Ceremony) instead of all 11 sections. This means the database migration hasn't been applied successfully.

## Step 1: Check if Columns Exist

First, let's check if the columns were added. Run this in your Supabase SQL Editor:

```sql
-- Check if the columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'events'
AND column_name IN ('section_visibility', 'section_content');
```

**Expected Result:** You should see 2 rows with `section_visibility` and `section_content` columns.

## Step 2: Check Current Data

If the columns exist, check what data is in them:

```sql
-- Check current section_visibility data
SELECT id, www_id, section_visibility
FROM events
LIMIT 3;
```

**Expected Result:** You should see JSON data with all sections set to `true`.

## Step 3: Simple Migration (If Columns Don't Exist)

If the columns don't exist, run this simple migration:

```sql
-- Step 1: Add columns
ALTER TABLE events ADD COLUMN section_visibility JSONB;
ALTER TABLE events ADD COLUMN section_content JSONB;

-- Step 2: Set default values
UPDATE events
SET section_visibility = '{"heroSection": true, "timelineSection": true, "ceremonySection": true, "ceremonyVenueSection": true, "seatingChartSection": true, "menuSection": true, "wishesAndGiftsSection": true, "teamSection": true, "accommodationSection": true, "transportationSection": true, "additionalInfoSection": true}';

-- Step 3: Add basic content
UPDATE events
SET section_content = '{"heroSection": {"coupleNames": "", "eventDate": "", "venue": "", "customMessage": "WE ARE GETTING MARRIED!"}, "timelineSection": {"title": "Wedding Day", "events": []}, "ceremonySection": {"title": "Ceremony Details", "description": "Join us as we exchange vows in a beautiful ceremony."}, "ceremonyVenueSection": {"title": "Ceremony Venue", "venueName": "Wedding Venue"}, "seatingChartSection": {"title": "Seating Chart", "description": "Find your seat for the reception."}, "menuSection": {"title": "Wedding Menu", "description": "Delicious food prepared specially for our celebration."}, "wishesAndGiftsSection": {"title": "Wishes & Gifts", "description": "Your presence is the greatest gift."}, "teamSection": {"title": "Wedding Team", "description": "Meet the special people who will be part of our big day."}, "accommodationSection": {"title": "Accommodation", "description": "Here are some hotel options for out-of-town guests."}, "transportationSection": {"title": "Transportation", "description": "Information about getting to and from the venue."}, "additionalInfoSection": {"title": "Additional Information", "content": "Here you can find any additional details about our wedding day."}}';
```

## Step 4: Verify the Fix

After running the migration, check if it worked:

```sql
-- Check one event's data
SELECT www_id, section_visibility, section_content
FROM events
LIMIT 1;
```

## Step 5: Test the Application

1. **Refresh your event page** in the browser
2. **Check if all 11 sections are now visible**
3. **Try the edit functionality**

## Common Issues

### Issue 1: Columns Exist but Data is Empty

If columns exist but `section_visibility` is `{}` or `null`:

```sql
UPDATE events
SET section_visibility = '{"heroSection": true, "timelineSection": true, "ceremonySection": true, "ceremonyVenueSection": true, "seatingChartSection": true, "menuSection": true, "wishesAndGiftsSection": true, "teamSection": true, "accommodationSection": true, "transportationSection": true, "additionalInfoSection": true}';
```

### Issue 2: Permission Errors

Make sure you're running the SQL as the database owner or with sufficient permissions.

### Issue 3: Syntax Errors

If you get syntax errors, try running the commands one by one instead of all at once.

## What to Do Next

1. **Run Step 1** to check if columns exist
2. **Report back** what you see
3. **Follow the appropriate step** based on the results
4. **Test the application** after each step

Let me know what you find in Step 1!
