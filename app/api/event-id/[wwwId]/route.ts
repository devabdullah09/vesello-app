import { NextRequest, NextResponse } from 'next/server'
import { getEventByWWWId } from '@/lib/events-service'

// GET /api/event-id/[wwwId] - Get public event data by wwwId
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

    // Only return events that are active or planned (not cancelled)
    if (event.status === 'cancelled') {
      return NextResponse.json({ error: 'Event has been cancelled' }, { status: 410 })
    }

    // Return public event data (no sensitive information)
    return NextResponse.json({
      success: true,
      data: {
        id: event.id,
        wwwId: event.wwwId,
        title: event.title,
        coupleNames: event.coupleNames,
        eventDate: event.eventDate,
        venue: event.venue,
        description: event.description,
        galleryEnabled: event.galleryEnabled,
        rsvpEnabled: event.rsvpEnabled,
        status: event.status,
        organizerId: event.organizerId,
        sectionVisibility: event.sectionVisibility,
        sectionContent: event.sectionContent
      }
    })
  } catch (error) {
    console.error('Error getting public event:', error)
    return NextResponse.json(
      { error: 'Failed to get event' },
      { status: 500 }
    )
  }
}
