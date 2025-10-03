import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// GET /api/dashboard/events/available - Get events without organizers
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

    // Check if user is superadmin
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userProfile || userProfile.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden - Superadmin access required' }, { status: 403 })
    }

    // Get events that don't have organizers assigned
    const { data: events, error } = await supabase
      .from('events')
      .select(`
        id,
        www_id,
        title,
        couple_names,
        event_date,
        status,
        organizer_id,
        created_at
      `)
      .is('organizer_id', null)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: events
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get available events' },
      { status: 500 }
    )
  }
}
