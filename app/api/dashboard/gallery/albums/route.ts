import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { createGalleryAlbum, getEventAlbums } from '@/lib/gallery-service'
import { CreateGalleryAlbumData } from '@/lib/dashboard-types'

// GET /api/dashboard/gallery/albums - Get albums for an event
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
    const eventId = searchParams.get('eventId')

    if (!eventId) {
      return NextResponse.json(
        { error: 'eventId parameter is required' },
        { status: 400 }
      )
    }

    // Verify user owns the event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, organizer_id')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (event.organizer_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get albums
    const albums = await getEventAlbums(eventId)

    return NextResponse.json({
      success: true,
      data: albums
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get albums' },
      { status: 500 }
    )
  }
}

// POST /api/dashboard/gallery/albums - Create a new album
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
    const albumData: CreateGalleryAlbumData = await request.json()

    // Validate required fields
    if (!albumData.eventId || !albumData.name) {
      return NextResponse.json(
        { error: 'Missing required fields: eventId, name' },
        { status: 400 }
      )
    }

    // Verify user owns the event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, organizer_id')
      .eq('id', albumData.eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (event.organizer_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Create album
    const album = await createGalleryAlbum(albumData)

    return NextResponse.json({
      success: true,
      data: album
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create album' },
      { status: 500 }
    )
  }
}
