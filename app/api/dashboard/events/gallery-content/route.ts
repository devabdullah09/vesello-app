import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getEventByWWWId } from '@/lib/events-service'

// GET /api/dashboard/events/gallery-content?wwwId=XXXXXXX
// Returns gallery content for an event
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

    // Try to get existing gallery content
    const { data: galleryContent, error: contentError } = await supabase
      .from('gallery_content')
      .select('*')
      .eq('event_id', event.id)
      .single()

    if (contentError && contentError.code !== 'PGRST116') {
      console.error('Error fetching gallery content:', contentError)
      return NextResponse.json({ error: 'Failed to fetch gallery content' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: galleryContent ? galleryContent.content : null
    })
  } catch (error) {
    console.error('Error getting gallery content:', error)
    return NextResponse.json({ error: 'Failed to get gallery content' }, { status: 500 })
  }
}

// PUT /api/dashboard/events/gallery-content
// Saves gallery content for an event
export async function PUT(request: NextRequest) {
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

    const { wwwId, content } = await request.json()

    if (!wwwId || !content) {
      return NextResponse.json({ error: 'wwwId and content are required' }, { status: 400 })
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

    // Try to upsert gallery content
    const { data, error: upsertError } = await supabase
      .from('gallery_content')
      .upsert({
        event_id: event.id,
        content: content,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'event_id'
      })
      .select()

    if (upsertError) {
      console.error('Error saving gallery content:', upsertError)
      
      // Check if table doesn't exist
      if (upsertError.message?.includes('relation "gallery_content" does not exist')) {
        return NextResponse.json({ 
          error: 'Gallery content table not found',
          message: 'Please run the SQL schema update in your Supabase dashboard first',
          sqlNeeded: true
        }, { status: 500 })
      }
      
      return NextResponse.json({ 
        error: 'Failed to save gallery content',
        details: upsertError.message 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Gallery content saved successfully',
      data: data?.[0]
    })
  } catch (error) {
    console.error('Error saving gallery content:', error)
    return NextResponse.json({ error: 'Failed to save gallery content' }, { status: 500 })
  }
}
