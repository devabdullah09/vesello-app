import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// GET /api/dashboard/organizer/event - Get organizer's assigned event
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

    // Check if user is organizer
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role, event_id')
      .eq('id', user.id)
      .single()

    if (!userProfile || userProfile.role !== 'organizer') {
      return NextResponse.json({ error: 'Forbidden - Organizer access required' }, { status: 403 })
    }

    if (!userProfile.event_id) {
      return NextResponse.json({ 
        success: true,
        data: null,
        message: 'No event assigned'
      })
    }

    // Get the organizer's assigned event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select(`
        id,
        www_id,
        title,
        couple_names,
        event_date,
        status,
        gallery_enabled,
        rsvp_enabled,
        created_at
      `)
      .eq('www_id', userProfile.event_id)
      .single()

    if (eventError) {
      console.error('Error fetching organizer event:', eventError)
      return NextResponse.json({ 
        success: false,
        error: 'Failed to fetch event'
      }, { status: 500 })
    }

    if (!event) {
      return NextResponse.json({ 
        success: true,
        data: null,
        message: 'Event not found'
      })
    }

    return NextResponse.json({
      success: true,
      data: event
    })

  } catch (error) {
    console.error('Error getting organizer event:', error)
    return NextResponse.json(
      { error: 'Failed to get organizer event' },
      { status: 500 }
    )
  }
}
