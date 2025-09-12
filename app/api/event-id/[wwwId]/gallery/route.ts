import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getEventByWWWId } from '@/lib/events-service'

// GET /api/event-id/[wwwId]/gallery - Get public gallery images for an event
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

    // Check if gallery is enabled for this event
    if (!event.galleryEnabled) {
      return NextResponse.json({ error: 'Gallery not enabled for this event' }, { status: 403 })
    }

    // Only return events that are active or planned (not cancelled)
    if (event.status === 'cancelled') {
      return NextResponse.json({ error: 'Event has been cancelled' }, { status: 410 })
    }

    const supabase = createServerClient()

    // Get gallery images for this event
    const { data: images, error } = await supabase
      .from('gallery_images')
      .select('id, url, caption, uploaded_at')
      .eq('event_id', event.id)
      .eq('is_public', true)
      .order('uploaded_at', { ascending: false })

    if (error) {
      console.error('Error fetching gallery images:', error)
      return NextResponse.json({ error: 'Failed to fetch gallery images' }, { status: 500 })
    }

    // Format the response
    const formattedImages = images?.map(image => ({
      id: image.id,
      url: image.url,
      caption: image.caption,
      uploadedAt: image.uploaded_at
    })) || []

    return NextResponse.json({
      success: true,
      data: formattedImages
    })
  } catch (error) {
    console.error('Error getting event gallery:', error)
    return NextResponse.json(
      { error: 'Failed to get gallery' },
      { status: 500 }
    )
  }
}
