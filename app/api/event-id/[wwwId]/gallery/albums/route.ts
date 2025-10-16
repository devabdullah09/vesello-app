import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getEventAlbums } from '@/lib/gallery-service'

// GET /api/event-id/[wwwId]/gallery/albums - Get albums for an event (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ wwwId: string }> }
) {
  try {
    const { wwwId } = await params;
    
    // Get event details first to get the database ID
    const supabase = createServerClient()
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id')
      .eq('www_id', wwwId)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Get albums for this event
    const albums = await getEventAlbums(event.id)

    return NextResponse.json({
      success: true,
      data: albums
    })
  } catch (error) {
    console.error('Error getting albums:', error)
    return NextResponse.json(
      { error: 'Failed to get albums' },
      { status: 500 }
    )
  }
}
