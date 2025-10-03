import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, createServerClientWithAuth } from '@/lib/supabase'

// GET /api/dashboard/events/rsvp-guests/[wwwId]
// Returns all guest RSVP data for a specific event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ wwwId: string }> }
) {
  try {
    const { wwwId } = await params

    if (!wwwId) {
      return NextResponse.json({ error: 'wwwId parameter is required' }, { status: 400 })
    }

    // Temporarily skip authentication for debugging
    const supabase = createServerClient()

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, www_id, title, couple_names, event_date, venue, rsvp_enabled, organizer_id')
      .eq('www_id', wwwId)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Temporarily skip user access check for debugging

    if (!event.rsvp_enabled) {
      return NextResponse.json({
        error: 'RSVP is not enabled for this event',
        message: 'RSVP feature has been disabled for this event by the organizer'
      }, { status: 403 })
    }

    // Get all RSVP responses for this event (try both event.id and wwwId)
    let { data: rsvps, error: rsvpError } = await supabase
      .from('invitation_rsvps')
      .select(`
        id,
        event_id,
        main_guest,
        additional_guests,
        wedding_day_attendance,
        after_party_attendance,
        food_preferences,
        accommodation_needed,
        transportation_needed,
        notes,
        email,
        send_email_confirmation,
        custom_responses,
        submitted_at,
        status
      `)
      .eq('event_id', event.id)
      .order('submitted_at', { ascending: false })

    // If no RSVPs found with event.id, try with wwwId
    if ((!rsvps || rsvps.length === 0) && !rsvpError) {
      const { data: rsvpsByWwwId, error: rsvpErrorByWwwId } = await supabase
        .from('invitation_rsvps')
        .select(`
          id,
          event_id,
          main_guest,
          additional_guests,
          wedding_day_attendance,
          after_party_attendance,
          food_preferences,
          accommodation_needed,
          transportation_needed,
          notes,
          email,
          send_email_confirmation,
          custom_responses,
          submitted_at,
          status
        `)
        .eq('event_id', wwwId)
        .order('submitted_at', { ascending: false })
      
      if (rsvpsByWwwId && rsvpsByWwwId.length > 0) {
        rsvps = rsvpsByWwwId;
      }
    }

    if (rsvpError) {
      return NextResponse.json({ error: 'Failed to fetch RSVP data' }, { status: 500 })
    }


    // Get custom questions for this event to understand the structure
    const { data: customQuestions } = await supabase
      .from('rsvp_form_questions')
      .select('id, title, question_type, options')
      .eq('event_id', event.id)
      .eq('is_active', true)
      .order('order_index', { ascending: true })

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        wwwId: event.www_id,
        title: event.title,
        coupleName: event.couple_names,
        eventDate: event.event_date,
        venue: event.venue
      },
      guests: rsvps || [],
      customQuestions: customQuestions || []
    })

  } catch (error) {
    return NextResponse.json({ error: 'Failed to get RSVP guests' }, { status: 500 })
  }
}
