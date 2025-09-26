import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// GET /api/invitation/custom-questions/[wwwId]
// Returns all active custom questions for an event's invitation flow
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ wwwId: string }> }
) {
  try {
    const supabase = createServerClient()
    const { wwwId } = await params

    if (!wwwId) {
      return NextResponse.json({ error: 'wwwId parameter is required' }, { status: 400 })
    }

    // Get event to verify it exists and RSVP is enabled
    const { data: event } = await supabase
      .from('events')
      .select('id, www_id, title, rsvp_enabled')
      .eq('www_id', wwwId)
      .single()

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (!event.rsvp_enabled) {
      return NextResponse.json({
        error: 'RSVP is not enabled for this event',
        message: 'RSVP feature has been disabled for this event by the organizer'
      }, { status: 403 })
    }

    // Get all active custom questions for this event
    const { data: questions, error: questionsError } = await supabase
      .from('rsvp_form_questions')
      .select('*')
      .eq('event_id', event.id)
      .eq('is_active', true)
      .order('order_index', { ascending: true })

    if (questionsError) {
      console.error('Error fetching custom questions:', questionsError)
      return NextResponse.json({ error: 'Failed to fetch custom questions' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      questions: questions || [],
      event: {
        id: event.id,
        wwwId: event.www_id,
        title: event.title
      }
    })

  } catch (error) {
    console.error('Error getting custom questions:', error)
    return NextResponse.json({ error: 'Failed to get custom questions' }, { status: 500 })
  }
}
