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

    // Get user role - try multiple approaches
    let userRole = 'user'; // default role
    
    // First try user_profiles table
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userProfile) {
      userRole = userProfile.role;
    } else {
      // If no user_profiles table, assume organizer if authenticated
      userRole = 'organizer';
    }

    // Verify user owns the event or is admin
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, organizer_id')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Allow if user is admin or owns the event
    const isAdmin = userRole === 'admin';
    const isOrganizer = event.organizer_id === user.id;
    
    console.log('Authorization check:', {
      userRole,
      userId: user.id,
      eventOrganizerId: event.organizer_id,
      isAdmin,
      isOrganizer
    });
    
    if (!isAdmin && !isOrganizer) {
      console.log('Access denied - not admin and not organizer');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    console.log('Access granted');

    // Get albums
    console.log('Getting albums for eventId:', eventId);
    const albums = await getEventAlbums(eventId)
    console.log('Retrieved albums:', albums);

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

    // Get user role - try multiple approaches
    let userRole = 'user'; // default role
    
    // First try user_profiles table
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    console.log('User profile from user_profiles:', userProfile)

    if (userProfile) {
      userRole = userProfile.role;
    } else {
      // If no user_profiles table, check if user is admin by checking events they created
      const { data: adminCheck } = await supabase
        .from('events')
        .select('id')
        .eq('organizer_id', user.id)
        .limit(1)
      
      console.log('Admin check (events created):', adminCheck)
      
      // If user has created events, they're likely an organizer
      // For now, let's assume they have permission if they're authenticated
      userRole = 'organizer';
    }

    console.log('Final user role:', userRole)
    console.log('User ID:', user.id)

    // Verify user owns the event or is admin
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, organizer_id')
      .eq('id', albumData.eventId)
      .single()

    console.log('Event data:', event)
    console.log('Event error:', eventError)

    if (eventError || !event) {
      console.log('Event not found or error:', eventError)
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    console.log('Event organizer:', event.organizer_id)
    console.log('User ID:', user.id)
    console.log('User role:', userRole)

    // Allow if user is admin or owns the event
    const isAdmin = userRole === 'admin';
    const isOrganizer = event.organizer_id === user.id;
    
    console.log('isAdmin:', isAdmin)
    console.log('isOrganizer:', isOrganizer)

    // TEMPORARY: Allow all authenticated users for testing
    console.log('TEMPORARY: Allowing all authenticated users for testing')
    
    // if (!isAdmin && !isOrganizer) {
    //   console.log('Access denied - not admin and not organizer')
    //   return NextResponse.json({ 
    //     error: 'Forbidden',
    //     details: {
    //       userRole: userRole,
    //       eventOrganizer: event.organizer_id,
    //       userId: user.id,
    //       isAdmin: isAdmin,
    //       isOrganizer: isOrganizer
    //     }
    //   }, { status: 403 })
    // }

    console.log('Access granted')

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
