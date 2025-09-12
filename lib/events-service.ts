import { createServerClient } from './supabase'
import { Event, CreateEventData, UpdateEventData, EventFilters, PaginatedResponse } from './dashboard-types'

// Helper function to generate unique WWW ID
const generateWWWId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 7; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Use a server-side Supabase client with the service role key for all
// operations done inside API routes. This avoids RLS issues when the
// authenticated user context is not attached to the client.
const supabase = createServerClient()

// Create a new event
export const createEvent = async (eventData: CreateEventData, organizerId: string): Promise<Event> => {
  try {
    const insertData = {
      title: eventData.title,
      couple_names: eventData.coupleNames, // Convert camelCase to snake_case
      date: eventData.eventDate, // Both date columns need the same value
      event_date: eventData.eventDate,
      venue: eventData.venue,
      description: eventData.description,
      organizer_id: organizerId,
      www_id: generateWWWId(),
      status: 'planned',
      gallery_enabled: eventData.galleryEnabled ?? false,
      rsvp_enabled: eventData.rsvpEnabled ?? false,
      settings: eventData.settings ?? {}
    }
    
    const { data, error } = await supabase
      .from('events')
      .insert([insertData])
      .select()
      .single()

    if (error) throw error
    return mapEventFromDB(data)
  } catch (error) {
    console.error('Error creating event:', error)
    throw error
  }
}

// Get all events for a user
export const getUserEvents = async (userId: string, filters?: EventFilters): Promise<Event[]> => {
  try {
    let query = supabase
      .from('events')
      .select('*')
      .eq('organizer_id', userId)
      .order('created_at', { ascending: false })

    if (filters) {
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.dateFrom) {
        query = query.gte('event_date', filters.dateFrom)
      }
      if (filters.dateTo) {
        query = query.lte('event_date', filters.dateTo)
      }
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,couple_names.ilike.%${filters.search}%`)
      }
    }

    const { data, error } = await query

    if (error) throw error

    return data.map(mapEventFromDB)
  } catch (error) {
    console.error('Error getting user events:', error)
    throw error
  }
}

// Get event by ID
export const getEventById = async (eventId: string): Promise<Event | null> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw error
    }

    return mapEventFromDB(data)
  } catch (error) {
    console.error('Error getting event by ID:', error)
    throw error
  }
}

// Get event by WWW ID
export const getEventByWWWId = async (wwwId: string): Promise<Event | null> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('www_id', wwwId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw error
    }

    return mapEventFromDB(data)
  } catch (error) {
    console.error('Error getting event by WWW ID:', error)
    throw error
  }
}

// Update event
export const updateEvent = async (eventId: string, updateData: UpdateEventData): Promise<Event> => {
  try {
    const updateFields: any = {}
    
    // Map camelCase to snake_case for database columns
    if (updateData.title !== undefined) updateFields.title = updateData.title
    if (updateData.coupleNames !== undefined) updateFields.couple_names = updateData.coupleNames
    if (updateData.eventDate !== undefined) {
      updateFields.date = updateData.eventDate // Update both date columns
      updateFields.event_date = updateData.eventDate
    }
    if (updateData.venue !== undefined) updateFields.venue = updateData.venue
    if (updateData.description !== undefined) updateFields.description = updateData.description
    if (updateData.galleryEnabled !== undefined) updateFields.gallery_enabled = updateData.galleryEnabled
    if (updateData.rsvpEnabled !== undefined) updateFields.rsvp_enabled = updateData.rsvpEnabled
    if (updateData.settings !== undefined) updateFields.settings = updateData.settings
    if (updateData.status !== undefined) updateFields.status = updateData.status
    if (updateData.sectionVisibility !== undefined) {
      // Update section visibility in settings field
      updateFields.settings = {
        ...updateFields.settings,
        sectionVisibility: updateData.sectionVisibility
      }
    }

    const { data, error } = await supabase
      .from('events')
      .update(updateFields)
      .eq('id', eventId)
      .select()
      .single()

    if (error) throw error

    return mapEventFromDB(data)
  } catch (error) {
    console.error('Error updating event:', error)
    throw error
  }
}

// Delete event
export const deleteEvent = async (eventId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting event:', error)
    throw error
  }
}

// Get events with pagination
export const getEventsPaginated = async (
  userId: string,
  page: number = 1,
  limit: number = 10,
  filters?: EventFilters
): Promise<PaginatedResponse<Event>> => {
  try {
    const offset = (page - 1) * limit

    let query = supabase
      .from('events')
      .select('*', { count: 'exact' })
      .eq('organizer_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (filters) {
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.dateFrom) {
        query = query.gte('event_date', filters.dateFrom)
      }
      if (filters.dateTo) {
        query = query.lte('event_date', filters.dateTo)
      }
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,couple_names.ilike.%${filters.search}%`)
      }
    }

    const { data, error, count } = await query

    if (error) throw error

    return {
      data: data.map(mapEventFromDB),
      total: count || 0,
      page,
      limit,
      hasMore: (count || 0) > offset + limit
    }
  } catch (error) {
    console.error('Error getting paginated events:', error)
    throw error
  }
}

// Get dashboard statistics
export const getDashboardStats = async (userId: string) => {
  try {
    // Get total events
    const { count: totalEvents } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('organizer_id', userId)

    // Get active events
    const { count: activeEvents } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('organizer_id', userId)
      .eq('status', 'active')

    // Get total photos
    const { count: totalPhotos } = await supabase
      .from('gallery_images')
      .select('*', { count: 'exact', head: true })

    // Get pending RSVPs (simplified for now)
    const pendingRSVPs = 0

    return {
      totalEvents: totalEvents || 0,
      activeEvents: activeEvents || 0,
      totalPhotos: totalPhotos || 0,
      pendingRSVPs: pendingRSVPs || 0
    }
  } catch (error) {
    console.error('Error getting dashboard stats:', error)
    throw error
  }
}

// Get recent activity
export const getRecentActivity = async (userId: string, limit: number = 10) => {
  try {
    // This would typically be stored in an activity log table
    // For now, we'll simulate with recent events and RSVPs
    const { data: recentEvents } = await supabase
      .from('events')
      .select('id, title, couple_names, created_at')
      .eq('organizer_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    // Skip RSVPs for now since the table doesn't exist
    const recentRSVPs: any[] = []

    const activities: any[] = []

    // Add recent events
    recentEvents?.forEach(event => {
      activities.push({
        id: `event-${event.id}`,
        type: 'event_created',
        message: `${event.couple_names} event created`,
        timestamp: event.created_at,
        eventId: event.id
      })
    })

    // Add recent RSVPs
    recentRSVPs?.forEach(rsvp => {
      activities.push({
        id: `rsvp-${rsvp.id}`,
        type: 'rsvp_received',
        message: `${rsvp.guest_name} RSVP received`,
        timestamp: rsvp.created_at,
        eventId: rsvp.event_id
      })
    })

    // Sort by timestamp and limit
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
  } catch (error) {
    console.error('Error getting recent activity:', error)
    throw error
  }
}

// Helper function to map database event to our Event type
const mapEventFromDB = (dbEvent: any): Event => ({
  id: dbEvent.id,
  wwwId: dbEvent.www_id,
  title: dbEvent.title,
  coupleNames: dbEvent.couple_names,
  eventDate: dbEvent.event_date || dbEvent.date, // Use event_date first, fallback to date
  venue: dbEvent.venue,
  description: dbEvent.description,
  organizerId: dbEvent.organizer_id,
  status: dbEvent.status,
  galleryEnabled: dbEvent.gallery_enabled,
  rsvpEnabled: dbEvent.rsvp_enabled,
  settings: dbEvent.settings,
  sectionVisibility: dbEvent.section_visibility || dbEvent.settings?.sectionVisibility || {
    heroSection: true,
    timelineSection: true,
    ceremonySection: true,
    ceremonyVenueSection: true,
    seatingChartSection: true,
    menuSection: true,
    wishesAndGiftsSection: true,
    teamSection: true,
    accommodationSection: true,
    transportationSection: true,
    additionalInfoSection: true,
  },
  createdAt: dbEvent.created_at,
  updatedAt: dbEvent.updated_at
})
