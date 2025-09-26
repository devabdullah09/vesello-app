# Fix Instructions for Organizer System

## Issue Identified

The error `"Could not find a relationship between 'events' and 'user_profiles' in the schema cache"` was occurring because:

1. The foreign key constraint between `events.organizer_id` and `user_profiles.id` was missing
2. The code was trying to use a foreign key hint that didn't exist in the database
3. The join syntax was incorrect for the current database structure

## Fixes Applied

### 1. **Database Schema Fix**

- Added foreign key constraint: `events_organizer_id_fkey`
- Updated SQL schema to include the constraint
- Created separate migration script: `ADD_FOREIGN_KEY_CONSTRAINT.sql`

### 2. **Code Fixes**

- Removed problematic foreign key hints from Supabase queries
- Simplified queries to use basic selects instead of complex joins
- Updated organizer APIs to fetch event data separately
- Fixed events service to work without foreign key hints

### 3. **Files Modified**

- `docs/sql/SUPABASE_SCHEMA_FIXED.sql` - Added foreign key constraint
- `docs/sql/ADD_FOREIGN_KEY_CONSTRAINT.sql` - Migration script
- `lib/events-service.ts` - Simplified queries
- `app/api/dashboard/organizers/route.ts` - Fixed event fetching
- `app/api/dashboard/organizers/[id]/route.ts` - Fixed event fetching
- `app/api/debug/test-organizer-system/route.ts` - Added foreign key test

## Steps to Fix Your System

### Step 1: Run Database Migration

Execute this SQL in your Supabase SQL Editor:

```sql
-- Add foreign key constraint for organizer_id to user_profiles
ALTER TABLE events
ADD CONSTRAINT events_organizer_id_fkey
FOREIGN KEY (organizer_id) REFERENCES user_profiles(id) ON DELETE SET NULL;
```

Or run the migration script:

```sql
-- Run the contents of docs/sql/ADD_FOREIGN_KEY_CONSTRAINT.sql
```

### Step 2: Restart Your Development Server

```bash
# Stop your current server (Ctrl+C)
# Then restart
npm run dev
# or
yarn dev
# or
pnpm dev
```

### Step 3: Test the System

1. Navigate to `/api/debug/test-organizer-system` to verify the fix
2. Check that the events list loads without errors
3. Test the organizer management interface

## What Should Work Now

✅ **Events List**: Should load without "Failed to fetch events" error  
✅ **Event Edition**: Should work normally  
✅ **Organizer Management**: Should be accessible from sidebar  
✅ **Database Queries**: Should execute without foreign key errors  
✅ **Super Admin Functions**: All existing functionality preserved

## Verification Steps

1. **Check Events List**: Go to `/dashboard/events-list` - should load without errors
2. **Check Event Edition**: Go to `/dashboard/events-edition` - should work normally
3. **Check Organizers**: Go to `/dashboard/organizers` - should show organizer management interface
4. **Test API**: Visit `/api/debug/test-organizer-system` - should show all tests passing

## If Issues Persist

1. **Clear Browser Cache**: Hard refresh (Ctrl+Shift+R)
2. **Check Database**: Ensure the foreign key constraint was added successfully
3. **Check Console**: Look for any remaining error messages
4. **Restart Database**: If using local Supabase, restart the local instance

## Expected Behavior After Fix

- **Super Admin**: Can see all events and manage organizers
- **Organizers**: Can only see their assigned events (when created)
- **Events API**: Returns data without foreign key errors
- **Database**: Proper relationships between tables established

The system should now work exactly as requested with complete event isolation for organizers while preserving all super admin functionality.
