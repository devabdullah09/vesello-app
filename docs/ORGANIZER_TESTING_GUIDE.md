# Organizer Testing Guide

## Quick Test Steps

### 1. **Access Organizer Management**

- Log in as Super Admin
- Go to `/dashboard/organizers` (or click "ORGANIZERS" in sidebar)
- You should see the organizer management interface

### 2. **Create an Organizer Account**

- Click "Create Organizer" button
- Fill in:
  - **Email**: `test-organizer@example.com`
  - **Password**: `TestPassword123`
  - **Name**: `Test Organizer`
  - **Event**: Select any available event
- Click "Create Organizer"

### 3. **Test Organizer Login**

- Logout from super admin account
- Go to `/login`
- Login with organizer credentials:
  - Email: `test-organizer@example.com`
  - Password: `TestPassword123`

### 4. **Verify Event Isolation**

- After login, go to `/dashboard/events-list`
- You should ONLY see the event assigned to this organizer
- You should NOT see other events

### 5. **Test Event Management**

- Click on the event to edit it
- Go to `/dashboard/events-edition`
- All editing features should work normally
- But only for their assigned event

## Expected Behavior

### **Super Admin (Your Account)**

✅ Can see all events  
✅ Can create organizer accounts  
✅ Can manage organizers  
✅ Can access organizer management interface

### **Organizer Account**

✅ Can only see their assigned event  
✅ Can edit their assigned event  
✅ Cannot see other events  
✅ Cannot access organizer management  
✅ Cannot see other organizers

## Troubleshooting

### If you can't see the "ORGANIZERS" menu:

1. Make sure you're logged in as super admin
2. Check that your user profile has role = 'superadmin'
3. Refresh the page

### If organizer can see all events:

1. Check that the organizer's user profile has role = 'organizer'
2. Check that the event has organizer_id set correctly
3. Verify the events API is using role-based filtering

### If organizer can't see any events:

1. Check that the organizer is assigned to an event
2. Check that the event exists and is active
3. Verify the organizer_id matches the organizer's user ID

## Test URLs

- **Organizer Management**: `/dashboard/organizers`
- **Test Page**: `/test-organizer`
- **Events List**: `/dashboard/events-list`
- **Event Edition**: `/dashboard/events-edition`

## Database Verification

Check these tables in Supabase:

- `user_profiles` - Should have organizer with role = 'organizer'
- `events` - Should have organizer_id pointing to organizer's user ID
- `auth.users` - Should have the organizer's auth account
