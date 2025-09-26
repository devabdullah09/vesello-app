# RSVP Form Management System

## Overview

The RSVP Form Management system allows event organizers to customize their wedding invitation RSVP forms by adding, editing, and managing custom questions beyond the default ones.

## Features

### 1. **Default Questions** (Always Present)

- **Add Guests** - Guest information and plus ones
- **Wedding Day Attendance** - Will you attend the wedding?
- **After Party** - Will you attend the after party?
- **Food Selection** - Meal preferences (Regular, Vegetarian, Vegan)
- **Accommodation** - Do you need accommodation?
- **Transportation** - Do you need transportation?
- **Send a Note** - Personal message to the couple
- **Confirmation** - Final confirmation and email

### 2. **Custom Questions** (User-Defined)

Organizers can add custom questions with the following types:

- **Yes/No Questions** - Simple binary responses
- **Multiple Choice** - Custom options with multiple selections
- **Text Input** - Open-ended text responses
- **Attendance** - Will attend / Can't attend format
- **Food Preference** - Custom meal options

## Database Schema

### `rsvp_form_questions` Table

```sql
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
```

### Updated `invitation_rsvps` Table

```sql
-- Added custom_responses field
custom_responses JSONB DEFAULT '{}'::jsonb,
```

## API Endpoints

### 1. **Get Form Questions**

```
GET /api/dashboard/events/rsvp-form-questions?wwwId=XXXXXXX
```

Returns all form questions for an event (requires authentication).

### 2. **Create Custom Question**

```
POST /api/dashboard/events/rsvp-form-questions
```

Creates a new custom question for an event.

**Request Body:**

```json
{
  "wwwId": "event-www-id",
  "questionData": {
    "questionType": "yes_no",
    "title": "Do you need special accommodations?",
    "description": "Please let us know if you have any special needs",
    "options": [],
    "required": true
  }
}
```

### 3. **Update Question**

```
PUT /api/dashboard/events/rsvp-form-questions
```

Updates an existing custom question.

### 4. **Delete Question**

```
DELETE /api/dashboard/events/rsvp-form-questions?questionId=XXX&wwwId=XXX
```

Deletes a custom question.

### 5. **Get Custom Questions for Invitation**

```
GET /api/invitation/custom-questions/[wwwId]
```

Returns active custom questions for the public invitation flow.

## Dynamic Page Generation

### Custom Question Pages

Custom questions are rendered at:

```
/event-id/[wwwId]/invitation/custom-question/[questionId]
```

Each custom question page:

- Uses the same design theme as default questions
- Supports all question types (yes/no, multiple choice, text, attendance, food)
- Handles guest-specific responses
- Integrates with the invitation context
- Provides proper navigation flow

## User Interface

### Manage Form Page

Located at: `/dashboard/events-edition/rsvp/manage-form`

**Features:**

- **Event Selection** - Choose from events with RSVP enabled
- **Default Questions View** - Shows all default questions (read-only)
- **Custom Questions Management** - Add, edit, delete custom questions
- **Question Types** - Support for all question types
- **Order Management** - Questions are ordered by creation
- **Active/Inactive Toggle** - Enable/disable questions without deletion

### Question Types

#### 1. **Yes/No Questions**

```json
{
  "questionType": "yes_no",
  "title": "Do you need special accommodations?",
  "description": "Optional description",
  "options": [],
  "required": true
}
```

#### 2. **Multiple Choice**

```json
{
  "questionType": "multiple_choice",
  "title": "How did you hear about our wedding?",
  "description": "Help us improve our outreach",
  "options": ["Social Media", "Friends", "Family", "Other"],
  "required": true
}
```

#### 3. **Text Input**

```json
{
  "questionType": "text",
  "title": "Any special requests?",
  "description": "Let us know if you have any special needs or requests",
  "options": [],
  "required": false
}
```

#### 4. **Attendance**

```json
{
  "questionType": "attendance",
  "title": "Will you attend the rehearsal dinner?",
  "description": "Optional rehearsal dinner the night before",
  "options": [],
  "required": true
}
```

#### 5. **Food Preference**

```json
{
  "questionType": "food_preference",
  "title": "Dessert Preference",
  "description": "Choose your preferred dessert",
  "options": ["Chocolate Cake", "Vanilla Cake", "Fruit Tart", "Ice Cream"],
  "required": true
}
```

## Integration with Existing Flow

### Invitation Context

The invitation context has been extended to handle custom responses:

```typescript
interface InvitationState {
  // ... existing fields
  customResponses: { [questionId: string]: { [guestName: string]: any } };
}
```

### Flow Management

Custom questions are integrated into the invitation flow:

1. Default questions appear in their standard order
2. Custom questions are inserted based on their `order_index`
3. Navigation flows naturally between default and custom questions
4. All responses are collected and submitted together

## Security & Permissions

### Authentication

- All management endpoints require authentication
- Only event organizers and superadmins can manage questions
- Public invitation endpoints are accessible without authentication

### Validation

- Question types are validated against allowed values
- Required fields are enforced
- Event ownership is verified for all operations

## Usage Examples

### Adding a Custom Question

1. **Navigate to Manage Form**

   ```
   /dashboard/events-edition/rsvp/manage-form
   ```

2. **Select Event**
   Choose an event with RSVP enabled

3. **Click "Add Question"**
   Fill out the question form:

   - Select question type
   - Enter title and description
   - Add options (for multiple choice)
   - Set required status

4. **Save Question**
   The question is immediately available in the invitation flow

### Custom Question Flow

When a guest fills out an RSVP:

1. **Default Questions** - Standard invitation flow
2. **Custom Questions** - Appear based on order and active status
3. **Dynamic Pages** - Each custom question gets its own page
4. **Response Collection** - All responses stored in context
5. **Final Submission** - Custom responses included in RSVP data

## Technical Implementation

### Frontend Components

- **ManageFormPage** - Main management interface
- **CustomQuestionPage** - Dynamic question rendering
- **InvitationContext** - Extended state management
- **useInvitationFlow** - Flow management hook

### Backend Services

- **API Routes** - CRUD operations for questions
- **Database Schema** - Structured question storage
- **Validation** - Input validation and security
- **Flow Integration** - Seamless invitation flow

### Design Consistency

- Custom question pages use the same design theme
- Consistent styling with existing invitation pages
- Responsive design for all devices
- Accessibility considerations

## Future Enhancements

### Potential Features

- **Question Reordering** - Drag and drop to reorder questions
- **Conditional Logic** - Show/hide questions based on previous answers
- **Question Templates** - Pre-built question sets
- **Analytics** - Response analytics and insights
- **Export Options** - Export responses in various formats

### Technical Improvements

- **Caching** - Cache questions for better performance
- **Real-time Updates** - Live question updates
- **Bulk Operations** - Manage multiple questions at once
- **Advanced Validation** - Custom validation rules

## Conclusion

The RSVP Form Management system provides a comprehensive solution for customizing wedding invitation forms. It maintains the existing design consistency while offering powerful customization options for event organizers. The system is secure, scalable, and user-friendly, making it easy for organizers to create personalized RSVP experiences for their guests.
