import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getEventByWWWId } from '@/lib/events-service'

interface RSVPSubmission {
  guestName: string;
  email: string;
  phone?: string;
  attendance: 'attending' | 'not_attending' | 'maybe';
  guestCount: number;
  dietaryRestrictions?: string;
  message?: string;
}

// POST /api/event-id/[wwwId]/rsvp - Submit RSVP for an event
export async function POST(
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

    // Check if RSVP is enabled for this event
    if (!event.rsvpEnabled) {
      return NextResponse.json({ error: 'RSVP not enabled for this event' }, { status: 403 })
    }

    // Only allow RSVP for events that are active or planned (not cancelled)
    if (event.status === 'cancelled') {
      return NextResponse.json({ error: 'Event has been cancelled' }, { status: 410 })
    }

    const body: RSVPSubmission = await request.json()

    // Validate required fields
    if (!body.guestName || !body.email || !body.attendance) {
      return NextResponse.json(
        { error: 'Missing required fields: guestName, email, attendance' },
        { status: 400 }
      )
    }

    // Validate attendance value
    if (!['attending', 'not_attending', 'maybe'].includes(body.attendance)) {
      return NextResponse.json(
        { error: 'Invalid attendance value' },
        { status: 400 }
      )
    }

    // Validate guest count
    if (body.guestCount < 1 || body.guestCount > 10) {
      return NextResponse.json(
        { error: 'Guest count must be between 1 and 10' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Check if RSVP already exists for this email and event
    const { data: existingRSVP } = await supabase
      .from('rsvp_responses')
      .select('id')
      .eq('event_id', event.id)
      .eq('email', body.email)
      .single()

    if (existingRSVP) {
      // Update existing RSVP
      const { data, error } = await supabase
        .from('rsvp_responses')
        .update({
          guest_name: body.guestName,
          phone: body.phone,
          attendance: body.attendance,
          guest_count: body.guestCount,
          dietary_restrictions: body.dietaryRestrictions,
          message: body.message,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingRSVP.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating RSVP:', error)
        return NextResponse.json({ error: 'Failed to update RSVP' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'RSVP updated successfully',
        data: { id: data.id, updated: true }
      })
    } else {
      // Create new RSVP
      const { data, error } = await supabase
        .from('rsvp_responses')
        .insert({
          event_id: event.id,
          guest_name: body.guestName,
          email: body.email,
          phone: body.phone,
          attendance: body.attendance,
          guest_count: body.guestCount,
          dietary_restrictions: body.dietaryRestrictions,
          message: body.message,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating RSVP:', error)
        return NextResponse.json({ error: 'Failed to create RSVP' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'RSVP submitted successfully',
        data: { id: data.id, updated: false }
      })
    }
  } catch (error) {
    console.error('Error processing RSVP:', error)
    return NextResponse.json(
      { error: 'Failed to process RSVP' },
      { status: 500 }
    )
  }
}
