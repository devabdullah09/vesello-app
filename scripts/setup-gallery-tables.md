# Gallery Tables Setup

To enable proper photo counting in the dashboard, you need to run the gallery tables migration.

## Steps:

1. **Open your Supabase Dashboard**

   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor

2. **Run the Migration**

   - Copy the contents of `docs/sql/ADD_GALLERY_TABLES.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute the migration

3. **Verify the Tables**
   - Go to the Table Editor in Supabase
   - You should see two new tables:
     - `gallery_albums`
     - `gallery_images`

## What This Does:

- Creates the necessary tables for photo management
- Sets up proper foreign key relationships
- Configures Row Level Security (RLS) policies
- Creates indexes for better performance

## After Running the Migration:

The dashboard will now properly count:

- Total photos uploaded across all events
- Recent photo uploads in the activity feed
- Pending RSVPs (if any exist)

The dashboard stats will update in real-time as photos are uploaded and RSVPs are received.
