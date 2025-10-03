import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getEventByWWWId } from '@/lib/events-service'

// GET /api/event-id/[wwwId]/gallery-content - Get gallery content for public pages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ wwwId: string }> }
) {
  try {
    const { wwwId } = await params

    if (!wwwId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }

    const event = await getEventByWWWId(wwwId)
    
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Only return for active or planned events
    if (event.status === 'cancelled') {
      return NextResponse.json({ error: 'Event has been cancelled' }, { status: 410 })
    }

    const supabase = createServerClient()

    // Try to get existing gallery content
    const { data: galleryContent, error: contentError } = await supabase
      .from('gallery_content')
      .select('*')
      .eq('event_id', event.id)
      .single()

    if (contentError && contentError.code !== 'PGRST116') {
      return NextResponse.json({ error: 'Failed to fetch gallery content' }, { status: 500 })
    }

    // Return gallery content or null if not found
    return NextResponse.json({
      success: true,
      data: galleryContent ? galleryContent.content : null,
      eventData: {
        coupleNames: event.coupleNames,
        eventDate: event.eventDate,
        venue: event.venue,
        galleryEnabled: event.galleryEnabled,
        rsvpEnabled: event.rsvpEnabled
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get gallery content' },
      { status: 500 }
    )
  }
}
