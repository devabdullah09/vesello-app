import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getEventByWWWId } from '@/lib/events-service'

// PUT /api/event-id/[wwwId]/update-content
// Body: { sectionContent: object }
export async function PUT(
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

    const body = await request.json()
    const { sectionContent } = body

    if (!sectionContent) {
      return NextResponse.json({ error: 'sectionContent is required' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Update the event with new section content in settings
    const updateData = {
      settings: {
        ...event.settings,
        sectionContent
      }
    }
    
    console.log('Updating event content from public page:', updateData)
    
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
