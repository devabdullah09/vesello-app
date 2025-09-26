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

    // Debug logging
    console.log('Event data from database:', {
      wwwId: event.wwwId,
      sectionVisibility: event.sectionVisibility,
      sectionContentKeys: event.sectionContent ? Object.keys(event.sectionContent) : 'null'
    })

    // Only return events that are active or planned (not cancelled)
    if (event.status === 'cancelled') {
      return NextResponse.json({ error: 'Event has been cancelled' }, { status: 410 })
    }

    // Return public event data (no sensitive information)
    const responseData = {
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
        sectionVisibility: JSON.parse(JSON.stringify(event.sectionVisibility)),
        sectionContent: JSON.parse(JSON.stringify(event.sectionContent))
      }
    };

    console.log('API Response sectionVisibility:', responseData.data.sectionVisibility);
    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Error getting public event:', error)
    return NextResponse.json(
      { error: 'Failed to get event' },
      { status: 500 }
    )
  }
}
