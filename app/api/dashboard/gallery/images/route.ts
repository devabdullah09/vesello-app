import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { uploadImage, getEventImages, getImagesPaginated } from '@/lib/gallery-service'
import { UploadImageData, GalleryFilters } from '@/lib/dashboard-types'

// GET /api/dashboard/gallery/images - Get images for an event
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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const albumId = searchParams.get('albumId')
    const isApproved = searchParams.get('isApproved')
    const uploadedBy = searchParams.get('uploadedBy')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

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

    // Build filters
    const filters: GalleryFilters = {}
    if (albumId) filters.albumId = albumId
    if (isApproved !== null) filters.isApproved = isApproved === 'true'
    if (uploadedBy) filters.uploadedBy = uploadedBy
    if (dateFrom) filters.dateFrom = dateFrom
    if (dateTo) filters.dateTo = dateTo

    // Get images
    const result = await getImagesPaginated(eventId, page, limit, filters)

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get images' },
      { status: 500 }
    )
  }
}

// POST /api/dashboard/gallery/images - Upload/add image
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
    const imageData: UploadImageData = await request.json()

    // Validate required fields
    if (!imageData.eventId || !imageData.albumId || !imageData.filename || !imageData.imageUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: eventId, albumId, filename, imageUrl' },
        { status: 400 }
      )
    }

    // Verify user owns the event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, organizer_id')
      .eq('id', imageData.eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (event.organizer_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Verify album exists and belongs to the event
    const { data: album, error: albumError } = await supabase
      .from('gallery_albums')
      .select('id, event_id')
      .eq('id', imageData.albumId)
      .single()

    if (albumError || !album) {
      return NextResponse.json({ error: 'Album not found' }, { status: 404 })
    }

    if (album.event_id !== imageData.eventId) {
      return NextResponse.json({ error: 'Album does not belong to this event' }, { status: 400 })
    }

    // Upload image
    const image = await uploadImage(imageData, user.id)

    return NextResponse.json({
      success: true,
      data: image
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}
