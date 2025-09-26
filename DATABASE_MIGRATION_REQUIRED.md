# Database Migration Required

## Issue

New events are failing to create because the database is missing the `section_visibility` and `section_content` columns.

## Solution

Run this SQL in your **Supabase SQL Editor**:

```sql
-- Add section_visibility column
ALTER TABLE events ADD COLUMN IF NOT EXISTS section_visibility JSONB DEFAULT '{}'::jsonb;

-- Add section_content column
ALTER TABLE events ADD COLUMN IF NOT EXISTS section_content JSONB DEFAULT '{}'::jsonb;

-- Add comments
COMMENT ON COLUMN events.section_visibility IS 'Controls which sections are visible on the event website';
COMMENT ON COLUMN events.section_content IS 'Contains the content for all sections of the event website';
```

## How to Run

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Copy and paste the SQL above
4. Click **Run**

## After Migration

- New events will be created successfully
- All section editors will work properly
- Edit functionality will be available for all events
