import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// GET /api/dashboard/organizers - Get all organizers (superadmin only)
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    
    // Verify the JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is superadmin
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userProfile || userProfile.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden - Superadmin access required' }, { status: 403 })
    }

    // Get all organizers with their events
    const { data: organizers, error } = await supabase
      .from('user_profiles')
      .select(`
        id,
        email,
        display_name,
        event_id,
        created_at,
        last_login
      `)
      .eq('role', 'organizer')
      .order('created_at', { ascending: false })

    if (error || !organizers) {
      return NextResponse.json(
        { error: 'Failed to fetch organizers' },
        { status: 500 }
      )
    }

    // Get events for each organizer
    const organizersWithEvents = await Promise.all(
      organizers.map(async (organizer) => {
        if (organizer.event_id) {
          const { data: event } = await supabase
            .from('events')
            .select('id, www_id, title, couple_names, status')
            .eq('www_id', organizer.event_id)
            .single()
          
          return { ...organizer, events: event }
        }
        return { ...organizer, events: null }
      })
    )

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: organizersWithEvents
    })
  } catch (error) {
    console.error('Error getting organizers:', error)
    return NextResponse.json(
      { error: 'Failed to get organizers' },
      { status: 500 }
    )
  }
}

// POST /api/dashboard/organizers - Create a new organizer account
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    
    // Verify the JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is superadmin
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userProfile || userProfile.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden - Superadmin access required' }, { status: 403 })
    }

    // Parse request body
    const { email, password, displayName, eventId } = await request.json()

    // Validate required fields
    if (!email || !password || !displayName || !eventId) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password, displayName, eventId' },
        { status: 400 }
      )
    }

    // Check if event exists
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, title, www_id')
      .eq('www_id', eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Check if organizer already exists for this event
    const { data: existingOrganizer } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('event_id', eventId)
      .eq('role', 'organizer')
      .single()

    if (existingOrganizer) {
      return NextResponse.json(
        { error: 'An organizer already exists for this event' },
        { status: 409 }
      )
    }

    // Create auth user
    const { data: authData, error: authCreateError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authCreateError) throw authCreateError

    // Create user profile
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .insert([{
        id: authData.user.id,
        email,
        display_name: displayName,
        role: 'organizer',
        event_id: eventId
      }])
      .select()
      .single()

    if (profileError) throw profileError

    // Update event to assign organizer
    const { error: updateEventError } = await supabase
      .from('events')
      .update({ organizer_id: authData.user.id })
      .eq('www_id', eventId)

    if (updateEventError) throw updateEventError

    return NextResponse.json({
      success: true,
      data: {
        id: profileData.id,
        email: profileData.email,
        display_name: profileData.display_name,
        event_id: profileData.event_id,
        event_title: event.title,
        event_www_id: event.www_id,
        created_at: profileData.created_at
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating organizer:', error)
    return NextResponse.json(
      { error: 'Failed to create organizer' },
      { status: 500 }
    )
  }
}
