import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { createEvent, getUserEvents, getEventsPaginated } from '@/lib/events-service'
import { CreateEventData, EventFilters } from '@/lib/dashboard-types'

// GET /api/dashboard/events - Get user's events
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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') as EventFilters['status']
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const search = searchParams.get('search')

    const filters: EventFilters = {}
    if (status) filters.status = status
    if (dateFrom) filters.dateFrom = dateFrom
    if (dateTo) filters.dateTo = dateTo
    if (search) filters.search = search

    // Get user role
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Get events with role-based filtering
    const result = await getEventsPaginated(user.id, userProfile.role, page, limit, filters)

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get events' },
      { status: 500 }
    )
  }
}

// POST /api/dashboard/events - Create a new event
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

    // Parse request body
    const eventData: CreateEventData = await request.json()

    // Validate required fields
    if (!eventData.title || !eventData.coupleNames || !eventData.eventDate) {
      return NextResponse.json(
        { error: 'Missing required fields: title, coupleNames, eventDate' },
        { status: 400 }
      )
    }

    // Create event
    const event = await createEvent(eventData, user.id)

    // Note: Storage events for cross-tab communication would need to be handled
    // on the frontend side when the event creation response is received

    return NextResponse.json({
      success: true,
      data: event
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}
