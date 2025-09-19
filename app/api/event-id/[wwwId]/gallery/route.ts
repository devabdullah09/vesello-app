import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getEventByWWWId } from '@/lib/events-service'
import { listFiles, getCdnUrl } from '@/lib/bunny-net'

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

    try {
      // Get images from both wedding-day and party-day folders
      const [weddingDayImages, partyDayImages] = await Promise.all([
        listFiles('wedding-day', 'photos', wwwId),
        listFiles('party-day', 'photos', wwwId)
      ])

      // Combine and format all images
      const allImages = [
        ...weddingDayImages.map((fileName, index) => ({
          id: `wedding-${index}-${Date.now()}`,
          url: getCdnUrl(fileName, 'wedding-day', 'photos', wwwId),
          caption: `Wedding Day Photo ${index + 1}`,
          uploadedAt: new Date().toISOString(),
          albumType: 'wedding-day'
        })),
        ...partyDayImages.map((fileName, index) => ({
          id: `party-${index}-${Date.now()}`,
          url: getCdnUrl(fileName, 'party-day', 'photos', wwwId),
          caption: `Party Day Photo ${index + 1}`,
          uploadedAt: new Date().toISOString(),
          albumType: 'party-day'
        }))
      ]

      // Sort by upload time (newest first)
      allImages.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())

      return NextResponse.json({
        success: true,
        data: allImages
      })
    } catch (bunnyError) {
      console.error('Error fetching images from Bunny.net:', bunnyError)
      // Return empty array if Bunny.net fails
      return NextResponse.json({
        success: true,
        data: []
      })
    }
  } catch (error) {
    console.error('Error getting event gallery:', error)
    return NextResponse.json(
      { error: 'Failed to get gallery' },
      { status: 500 }
    )
  }
}
