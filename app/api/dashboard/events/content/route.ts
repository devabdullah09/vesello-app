import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getEventByWWWId } from '@/lib/events-service'

// PUT /api/dashboard/events/content
// Body: { wwwId: string, sectionContent: object }
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

    const body = await request.json()
    console.log('Content update request:', body)
    
    const { wwwId, sectionContent } = body as {
      wwwId: string
      sectionContent: any
    }

    if (!wwwId) {
      return NextResponse.json({ error: 'wwwId is required' }, { status: 400 })
    }

    if (!sectionContent) {
      return NextResponse.json({ error: 'sectionContent is required' }, { status: 400 })
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

    // Update the event with new section content in settings
    const updateData = {
      settings: {
        ...event.settings,
        sectionContent
      }
    }
    
    console.log('Updating event with content:', updateData)
    
    const { data: updatedEvent, error: updateError } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', event.id)
      .select()
      .single()

    if (updateError) {
      console.error('Database update error:', updateError)
      return NextResponse.json({ error: 'Failed to update section content' }, { status: 500 })
    }
    
    console.log('Successfully updated event content:', updatedEvent)

    return NextResponse.json({
      success: true,
      data: {
        id: updatedEvent.id,
        wwwId: updatedEvent.www_id,
        sectionContent
      }
    })
  } catch (error) {
    console.error('Error updating section content:', error)
    return NextResponse.json({ error: 'Failed to update section content' }, { status: 500 })
  }
}
