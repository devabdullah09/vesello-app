import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getEventByWWWId, updateEvent } from '@/lib/events-service'

// GET /api/dashboard/events/general-info?wwwId=XXXXXXX
// Returns minimal general info for an event identified by wwwId
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Require auth
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const wwwId = searchParams.get('wwwId')

    if (!wwwId) {
      return NextResponse.json({ error: 'wwwId parameter is required' }, { status: 400 })
    }

    const event = await getEventByWWWId(wwwId)
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Verify the requester owns the event (organizer) or is superadmin
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 403 })
    }

    const isSuperAdmin = userProfile.role === 'superadmin'
    if (!isSuperAdmin && event.organizerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      data: {
        coupleNames: event.coupleNames,
        venue: event.venue,
        eventDate: event.eventDate,
        eventUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/event-id/${event.wwwId}`,
        eventId: event.id,
        wwwId: event.wwwId,
        title: event.title
      }
    })
  } catch (error) {
    console.error('Error getting event general info:', error)
    return NextResponse.json({ error: 'Failed to get event general info' }, { status: 500 })
  }
}

// PUT /api/dashboard/events/general-info
// Body: { wwwId: string, eventDate?: string, venue?: string }
export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerClient()

    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { wwwId, eventDate, venue, title, coupleNames } = body as {
      wwwId?: string
      eventDate?: string
      venue?: string
      title?: string
      coupleNames?: string
    }

    if (!wwwId) {
      return NextResponse.json({ error: 'wwwId is required' }, { status: 400 })
    }

    const event = await getEventByWWWId(wwwId)
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Verify role/ownership
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 403 })
    }

    const isSuperAdmin = userProfile.role === 'superadmin'
    if (!isSuperAdmin && event.organizerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updated = await updateEvent(event.id, {
      eventDate,
      venue,
      title,
      coupleNames
    })

    return NextResponse.json({
      success: true,
      data: {
        coupleNames: updated.coupleNames,
        venue: updated.venue,
        eventDate: updated.eventDate,
        eventUrl: `www.vasello.com/${updated.wwwId}`,
        eventId: updated.id,
        wwwId: updated.wwwId,
        title: updated.title
      }
    })
  } catch (error) {
    console.error('Error updating event general info:', error)
    return NextResponse.json({ error: 'Failed to update event general info' }, { status: 500 })
  }
}


