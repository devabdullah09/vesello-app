# Organizer Management System

## Overview

The Organizer Management System allows super admins to create and manage separate organizer accounts for each event. Each organizer can only access and manage their assigned event, ensuring complete isolation between different events while maintaining the super admin's full access to all events.

## Key Features

### 1. **Role-Based Access Control**

- **Super Admin**: Full access to all events and organizer management
- **Organizer**: Access only to their assigned event(s)
- **Guest**: Read-only access for RSVP functionality

### 2. **Event Isolation**

- Each organizer can only see and manage their assigned event
- Complete data separation between different events
- Organizers cannot access other events or organizer accounts

### 3. **Organizer Account Management**

- Super admin can create organizer accounts with email/password
- Each organizer is assigned to a specific event
- Organizer credentials can be shared with event organizers
- Super admin can delete organizer accounts when needed

## Database Schema

### Updated Tables

#### `events` Table

```sql
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
```

#### `user_profiles` Table

```sql
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('superadmin', 'organizer', 'guest')) DEFAULT 'guest',
  event_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Row Level Security (RLS) Policies

#### Events Table Policies

- **Organizers can view their own events**: `organizer_id = auth.uid()`
- **Superadmins can view all events**: Role-based access
- **Organizers can update their own events**: `organizer_id = auth.uid()`
- **Superadmins can create/delete events**: Role-based access

#### User Profiles Table Policies

- **Users can view their own profile**: `auth.uid() = id`
- **Superadmins can view all profiles**: Role-based access
- **Superadmins can create/update profiles**: Role-based access

## API Endpoints

### Organizer Management

#### `GET /api/dashboard/organizers`

- **Purpose**: Get all organizer accounts (superadmin only)
- **Response**: List of organizers with their assigned events

#### `POST /api/dashboard/organizers`

- **Purpose**: Create a new organizer account
- **Body**: `{ email, password, displayName, eventId }`
- **Response**: Created organizer details

#### `GET /api/dashboard/organizers/[id]`

- **Purpose**: Get specific organizer details
- **Response**: Organizer information with event details

#### `PUT /api/dashboard/organizers/[id]`

- **Purpose**: Update organizer details
- **Body**: `{ displayName?, password?, eventId? }`
- **Response**: Success message

#### `DELETE /api/dashboard/organizers/[id]`

- **Purpose**: Delete organizer account
- **Response**: Success message

### Event Management

#### `GET /api/dashboard/events/available`

- **Purpose**: Get events without organizers (superadmin only)
- **Response**: List of unassigned events

#### Updated `GET /api/dashboard/events`

- **Purpose**: Get events with role-based filtering
- **Behavior**:
  - Organizers see only their assigned events
  - Superadmins see all events

## Frontend Components

### Organizer Management Interface

#### `/dashboard/organizers` Page

- **Access**: Superadmin only
- **Features**:
  - List all organizer accounts
  - Create new organizer accounts
  - Delete organizer accounts
  - View organizer details and assigned events

#### Organizer Account Creation Form

- **Fields**:
  - Email address
  - Password
  - Display name
  - Event assignment (dropdown of available events)
- **Validation**: All fields required, email must be unique

### Updated Dashboard Navigation

- **Superadmin Sidebar**: Added "ORGANIZERS" menu item
- **Organizer Sidebar**: Unchanged (same functionality, filtered data)

## Usage Workflow

### 1. **Creating an Organizer Account**

1. Super admin logs in and navigates to "ORGANIZERS"
2. Clicks "Create Organizer" button
3. Fills in organizer details:
   - Email: `organizer@example.com`
   - Password: `SecurePassword123`
   - Name: `John Smith`
   - Event: Select from available events
4. System creates auth user and user profile
5. Event is assigned to the organizer
6. Organizer credentials are shared with the event organizer

### 2. **Organizer Login and Access**

1. Organizer logs in with provided credentials
2. System checks user role and event assignment
3. Dashboard shows only their assigned event
4. All event management features work normally
5. Organizer cannot access other events or organizer management

### 3. **Super Admin Management**

1. Super admin retains full access to all events
2. Can view all organizer accounts
3. Can reassign or delete organizer accounts
4. Can create events and assign them to organizers
5. Can manage events directly if needed

## Security Features

### 1. **Authentication**

- All API endpoints require valid JWT tokens
- Role-based authorization checks
- Password hashing handled by Supabase Auth

### 2. **Authorization**

- Row Level Security (RLS) policies enforce data isolation
- API endpoints validate user roles before processing
- Frontend components check user permissions

### 3. **Data Isolation**

- Organizers can only query their assigned events
- Database policies prevent cross-event data access
- API responses filtered by user role

## Testing

### Test Endpoint

`GET /api/debug/test-organizer-system`

- Validates database schema
- Checks RLS policies
- Verifies organizer and superadmin accounts
- Provides system status overview

### Manual Testing Checklist

- [ ] Super admin can create organizer accounts
- [ ] Organizer can only see their assigned event
- [ ] Organizer cannot access other events
- [ ] Super admin retains full access
- [ ] Event isolation works correctly
- [ ] Organizer account deletion works
- [ ] Password updates work for organizers

## Migration Notes

### Existing Super Admin Functionality

- **No changes required** to existing super admin workflows
- All existing features continue to work normally
- Super admin retains full access to all events
- Dashboard and navigation remain unchanged

### Database Updates

- Run the updated SQL schema to add missing tables and policies
- Existing events will work normally
- Existing super admin accounts remain unchanged

### Frontend Updates

- New organizer management interface added
- Existing dashboard functionality preserved
- Navigation updated for super admin only

## Troubleshooting

### Common Issues

1. **Organizer cannot see events**

   - Check if organizer is assigned to an event
   - Verify RLS policies are active
   - Check user role in user_profiles table

2. **Super admin cannot create organizers**

   - Verify super admin role in user_profiles
   - Check API authentication
   - Ensure event exists and is available

3. **Event not showing in available events**
   - Check if event already has an organizer
   - Verify event exists in database
   - Check event status

### Debug Tools

- Use `/api/debug/test-organizer-system` to check system status
- Check browser console for authentication errors
- Verify database RLS policies are active
- Test API endpoints with proper authentication

## Future Enhancements

1. **Multiple Event Assignment**: Allow organizers to manage multiple events
2. **Organizer Permissions**: Granular permissions for different features
3. **Activity Logging**: Track organizer actions and changes
4. **Email Notifications**: Notify organizers of account creation
5. **Bulk Operations**: Create multiple organizer accounts at once
