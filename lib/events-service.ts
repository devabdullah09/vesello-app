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
export const createEvent = async (eventData: CreateEventData, userId: string): Promise<Event> => {
  try {
    // Initialize default section visibility
    const defaultSectionVisibility = {
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
    };

    // Initialize default section content
    const defaultSectionContent = {
      heroSection: {
        coupleNames: eventData.coupleNames || '',
        eventDate: eventData.eventDate || '',
        venue: eventData.venue || '',
        backgroundImage: '',
        customMessage: 'WE\'RE GETTING MARRIED!'
      },
      timelineSection: {
        title: 'Wedding Day',
        events: [
          { id: '1', time: '11:00 AM', title: 'WELCOME TOAST', description: '', icon: '/images/toast.png' },
          { id: '2', time: '12:00 PM', title: 'CEREMONY', description: '', icon: '/images/ceremony.png' },
          { id: '3', time: '01:00 PM', title: 'WEDDING LUNCH', description: '', icon: '/images/lunch.png' },
          { id: '4', time: '03:00 PM', title: 'CAKE CUTTING', description: '', icon: '/images/cake.png' },
          { id: '5', time: '04:00 PM', title: 'FIRST DANCE', description: '', icon: '/images/dance.png' },
          { id: '6', time: '05:00 PM', title: 'COCKTAIL HOUR', description: '', icon: '/images/cocktail.png' },
          { id: '7', time: '08:00 PM', title: 'BUFFET DINNER', description: '', icon: '/images/dinner.png' },
          { id: '8', time: '11:30 PM', title: 'FIREWORKS', description: '', icon: '/images/fireworks.png' }
        ]
      },
      ceremonySection: {
        title: 'Ceremony Details',
        description: 'Join us as we exchange vows in a beautiful ceremony.',
        date: eventData.eventDate || '',
        time: '12:00 PM',
        location: eventData.venue || '',
        details: '',
        mapUrl: ''
      },
      ceremonyVenueSection: {
        title: 'Ceremony Venue',
        venueName: eventData.venue || 'Wedding Venue',
        address: '',
        description: 'A beautiful location for our special day.',
        mapUrl: '',
        images: []
      },
      seatingChartSection: {
        title: 'Seating Chart',
        description: 'Find your seat for the reception.',
        tables: []
      },
      menuSection: {
        title: 'Wedding Menu',
        description: 'Delicious food prepared specially for our celebration.',
        courses: []
      },
      wishesAndGiftsSection: {
        title: 'Wishes & Gifts',
        description: 'Your presence is the greatest gift, but if you wish to honor us with a gift, here are some suggestions.',
        wishesMessage: 'We are so grateful for your love and support!',
        place: 'At the church',
        when: 'After ceremony next to church',
        giftSuggestions: 'flowers, bottle of wine, lottery coupon'
      },
      teamSection: {
        title: 'Wedding Team',
        description: 'Meet the special people who will be part of our big day.',
        members: []
      },
      accommodationSection: {
        title: 'Accommodation',
        description: 'Here are some hotel options for out-of-town guests.',
        hotels: []
      },
      transportationSection: {
        title: 'Transportation',
        description: 'Information about getting to and from the venue.',
        options: []
      },
      additionalInfoSection: {
        title: 'Additional Information',
        content: 'Here you can find any additional details about our wedding day.',
        items: []
      }
    };

    const insertData = {
      title: eventData.title,
      couple_names: eventData.coupleNames, // Convert camelCase to snake_case
      date: eventData.eventDate, // Both date columns need the same value
      event_date: eventData.eventDate,
      venue: eventData.venue,
      description: eventData.description,
      organizer_id: null, // Don't assign organizer automatically - let super admin assign later
      www_id: generateWWWId(),
      status: 'planned',
      gallery_enabled: eventData.galleryEnabled ?? false,
      rsvp_enabled: eventData.rsvpEnabled ?? false,
      settings: eventData.settings ?? {},
      section_visibility: defaultSectionVisibility,
      section_content: defaultSectionContent
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

// Get all events for a user (with role-based filtering)
export const getUserEvents = async (userId: string, userRole: string, filters?: EventFilters): Promise<Event[]> => {
  try {
    let query = supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply role-based filtering
    if (userRole === 'organizer') {
      query = query.eq('organizer_id', userId)
    }
    // Superadmin can see all events (no additional filter)

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
      updateFields.section_visibility = updateData.sectionVisibility
    }
    if (updateData.sectionContent !== undefined) {
      updateFields.section_content = updateData.sectionContent
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

// Get events with pagination (with role-based filtering)
export const getEventsPaginated = async (
  userId: string,
  userRole: string,
  page: number = 1,
  limit: number = 10,
  filters?: EventFilters
): Promise<PaginatedResponse<Event>> => {
  try {
    const offset = (page - 1) * limit

    let query = supabase
      .from('events')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply role-based filtering
    if (userRole === 'organizer') {
      query = query.eq('organizer_id', userId)
    }
    // Superadmin can see all events (no additional filter)

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

// Get dashboard statistics (with role-based filtering)
export const getDashboardStats = async (userId: string, userRole: string) => {
  try {
    let eventsQuery = supabase
      .from('events')
      .select('*', { count: 'exact', head: true })

    // Apply role-based filtering
    if (userRole === 'organizer') {
      eventsQuery = eventsQuery.eq('organizer_id', userId)
    }
    // Superadmin can see all events (no additional filter)

    // Get total events
    const { count: totalEvents } = await eventsQuery

    // Get active events
    let activeEventsQuery = supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    if (userRole === 'organizer') {
      activeEventsQuery = activeEventsQuery.eq('organizer_id', userId)
    }

    const { count: activeEvents, error: activeEventsError } = await activeEventsQuery
    console.log('Active events query result:', { count: activeEvents, error: activeEventsError })
    
    // Let's also check what statuses exist
    const { data: allEvents } = await supabase
      .from('events')
      .select('id, title, status')
      .limit(5)
    console.log('Sample events with statuses:', allEvents)

    // Get total photos - try to get from gallery_images table
    let totalPhotos = 0
    try {
      // First get event IDs that the user has access to
      let eventIdsQuery = supabase
        .from('events')
        .select('www_id')

      if (userRole === 'organizer') {
        eventIdsQuery = eventIdsQuery.eq('organizer_id', userId)
      }

      const { data: userEvents } = await eventIdsQuery
      const eventIds = userEvents?.map(e => e.www_id) || []
      console.log('User events for photo count:', eventIds)

      if (eventIds.length > 0) {
        const { count, error } = await supabase
          .from('gallery_images')
          .select('*', { count: 'exact', head: true })
          .in('event_id', eventIds)

        if (error) {
          console.log('Gallery images query error:', error)
        } else {
          totalPhotos = count || 0
          console.log('Total photos found:', totalPhotos)
        }
      }
    } catch (error) {
      console.log('Gallery images table may not exist yet:', error)
      totalPhotos = 0
    }

    // Get pending RSVPs - try to get from invitation_rsvps table
    let pendingRSVPs = 0
    try {
      // First get event UUIDs that the user has access to (not www_id)
      let eventIdsQuery = supabase
        .from('events')
        .select('id') // Use 'id' (UUID) not 'www_id'

      if (userRole === 'organizer') {
        eventIdsQuery = eventIdsQuery.eq('organizer_id', userId)
      }

      const { data: userEvents } = await eventIdsQuery
      const eventIds = userEvents?.map(e => e.id) || []
      console.log('User event UUIDs for RSVP count:', eventIds)

      if (eventIds.length > 0) {
        const { count, error } = await supabase
          .from('invitation_rsvps')
          .select('*', { count: 'exact', head: true })
          .in('event_id', eventIds)
          .eq('status', 'pending')

        if (error) {
          console.log('RSVP query error:', error)
        } else {
          pendingRSVPs = count || 0
          console.log('Pending RSVPs found:', pendingRSVPs)
        }
      }
    } catch (error) {
      console.log('Error getting RSVP count:', error)
      pendingRSVPs = 0
    }

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
export const getRecentActivity = async (userId: string, userRole: string, limit: number = 10) => {
  try {
    const activities: any[] = []

    // Get recent events based on role
    let eventsQuery = supabase
      .from('events')
      .select('id, title, couple_names, created_at, status')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (userRole === 'organizer') {
      eventsQuery = eventsQuery.eq('organizer_id', userId)
    }

    const { data: recentEvents } = await eventsQuery

    // Add recent events
    recentEvents?.forEach(event => {
      activities.push({
        id: `event-${event.id}`,
        type: 'event_created',
        message: `Event "${event.title}" for ${event.couple_names} was created`,
        timestamp: event.created_at,
        eventId: event.id
      })
    })

    // Get recent RSVPs based on role
    try {
      // First get event UUIDs that the user has access to (not www_id)
      let eventIdsQuery = supabase
        .from('events')
        .select('id, www_id, title, couple_names') // Include both id and www_id

      if (userRole === 'organizer') {
        eventIdsQuery = eventIdsQuery.eq('organizer_id', userId)
      }

      const { data: userEvents } = await eventIdsQuery
      const eventIds = userEvents?.map(e => e.id) || [] // Use UUID for RSVP query
      const eventMap = new Map(userEvents?.map(e => [e.id, e]) || []) // Map by UUID

      if (eventIds.length > 0) {
        const { data: recentRSVPs } = await supabase
          .from('invitation_rsvps')
          .select('id, event_id, main_guest, submitted_at, status')
          .in('event_id', eventIds)
          .order('submitted_at', { ascending: false })
          .limit(limit)

        // Add recent RSVPs
        recentRSVPs?.forEach(rsvp => {
          const guestName = rsvp.main_guest?.name || 'Guest'
          const event = eventMap.get(rsvp.event_id)
          if (event) {
            activities.push({
              id: `rsvp-${rsvp.id}`,
              type: 'rsvp_received',
              message: `${guestName} RSVP'd for ${event.couple_names} wedding`,
              timestamp: rsvp.submitted_at,
              eventId: rsvp.event_id
            })
          }
        })
      }
    } catch (error) {
      console.log('Error getting recent RSVPs:', error)
    }

    // Get recent gallery uploads based on role
    try {
      // First get event IDs that the user has access to
      let eventIdsQuery = supabase
        .from('events')
        .select('www_id, title, couple_names')

      if (userRole === 'organizer') {
        eventIdsQuery = eventIdsQuery.eq('organizer_id', userId)
      }

      const { data: userEvents } = await eventIdsQuery
      const eventIds = userEvents?.map(e => e.www_id) || []
      const eventMap = new Map(userEvents?.map(e => [e.www_id, e]) || [])

      if (eventIds.length > 0) {
        const { data: recentGallery } = await supabase
          .from('gallery_images')
          .select('id, event_id, filename, created_at')
          .in('event_id', eventIds)
          .order('created_at', { ascending: false })
          .limit(limit)

        // Add recent gallery uploads
        recentGallery?.forEach(image => {
          const event = eventMap.get(image.event_id)
          if (event) {
            activities.push({
              id: `gallery-${image.id}`,
              type: 'photo_uploaded',
              message: `Photo "${image.filename}" uploaded for ${event.couple_names} wedding`,
              timestamp: image.created_at,
              eventId: image.event_id
            })
          }
        })
      }
    } catch (error) {
      console.log('Error getting recent gallery uploads:', error)
    }

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
const mapEventFromDB = (dbEvent: any): Event => {
  // Debug logging
  console.log('Raw database event data:', {
    id: dbEvent.id,
    www_id: dbEvent.www_id,
    section_visibility: dbEvent.section_visibility,
    section_content: dbEvent.section_content
  });

  const mappedEvent = {
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
    sectionContent: dbEvent.section_content || dbEvent.settings?.sectionContent || {
      heroSection: {
        coupleNames: dbEvent.couple_names || '',
        eventDate: dbEvent.event_date || dbEvent.date || '',
        venue: dbEvent.venue || '',
        backgroundImage: '',
        customMessage: 'WE\'RE GETTING MARRIED!'
      },
      timelineSection: {
        title: 'Wedding Day',
        events: [
          { id: '1', time: '11:00 AM', title: 'WELCOME TOAST', description: '', icon: '/images/toast.png' },
          { id: '2', time: '12:00 PM', title: 'CEREMONY', description: '', icon: '/images/ceremony.png' },
          { id: '3', time: '01:00 PM', title: 'WEDDING LUNCH', description: '', icon: '/images/lunch.png' },
          { id: '4', time: '03:00 PM', title: 'CAKE CUTTING', description: '', icon: '/images/cake.png' },
          { id: '5', time: '04:00 PM', title: 'FIRST DANCE', description: '', icon: '/images/dance.png' },
          { id: '6', time: '05:00 PM', title: 'COCKTAIL HOUR', description: '', icon: '/images/cocktail.png' },
          { id: '7', time: '08:00 PM', title: 'BUFFET DINNER', description: '', icon: '/images/dinner.png' },
          { id: '8', time: '11:30 PM', title: 'FIREWORKS', description: '', icon: '/images/fireworks.png' }
        ]
      },
      ceremonySection: {
        title: 'Ceremony Details',
        description: 'Join us as we exchange vows in a beautiful ceremony.',
        date: dbEvent.event_date || dbEvent.date || '',
        time: '12:00 PM',
        location: dbEvent.venue || '',
        details: '',
        mapUrl: ''
      },
      ceremonyVenueSection: {
        title: 'Ceremony Venue',
        venueName: dbEvent.venue || 'Wedding Venue',
        address: '',
        description: 'A beautiful location for our special day.',
        mapUrl: '',
        images: []
      },
      seatingChartSection: {
        title: 'Seating Chart',
        description: 'Find your seat for the reception.',
        tables: []
      },
      menuSection: {
        title: 'Wedding Menu',
        description: 'Delicious food prepared specially for our celebration.',
        courses: []
      },
      wishesAndGiftsSection: {
        title: 'Wishes & Gifts',
        description: 'Your presence is the greatest gift, but if you wish to honor us with a gift, here are some suggestions.',
        wishesMessage: 'We are so grateful for your love and support!',
        place: 'At the church',
        when: 'After ceremony next to church',
        giftSuggestions: 'flowers, bottle of wine, lottery coupon'
      },
      teamSection: {
        title: 'Wedding Team',
        description: 'Meet the special people who will be part of our big day.',
        members: []
      },
      accommodationSection: {
        title: 'Accommodation',
        description: 'Here are some hotel options for out-of-town guests.',
        hotels: []
      },
      transportationSection: {
        title: 'Transportation',
        description: 'Information about getting to and from the venue.',
        options: []
      },
      additionalInfoSection: {
        title: 'Additional Information',
        content: 'Here you can find any additional details about our wedding day.',
        items: []
      }
    },
    createdAt: dbEvent.created_at,
    updatedAt: dbEvent.updated_at
  };

  console.log('Mapped event sectionVisibility:', mappedEvent.sectionVisibility);
  return mappedEvent;
}
