import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getEventByWWWId } from '@/lib/events-service'
import QRCode from 'qrcode'

// GET /api/dashboard/events/day-details?wwwId=XXXXXXX
// Returns event link and QR code data for day details management
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

    // Generate the public event URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const eventUrl = `${baseUrl}/event-id/${event.wwwId}`

    // Generate QR code as data URL
    let qrCodeDataUrl: string
    try {
      qrCodeDataUrl = await QRCode.toDataURL(eventUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
    } catch (qrError) {
      console.error('Error generating QR code:', qrError)
      qrCodeDataUrl = ''
    }

    return NextResponse.json({
      success: true,
      data: {
        eventId: event.id,
        wwwId: event.wwwId,
        title: event.title,
        coupleNames: event.coupleNames,
        eventDate: event.eventDate,
        venue: event.venue,
        eventUrl,
        qrCodeDataUrl,
        galleryEnabled: event.galleryEnabled,
        rsvpEnabled: event.rsvpEnabled,
        status: event.status,
        sectionVisibility: event.sectionVisibility
      }
    })
  } catch (error) {
    console.error('Error getting event day details:', error)
    return NextResponse.json({ error: 'Failed to get event day details' }, { status: 500 })
  }
}
