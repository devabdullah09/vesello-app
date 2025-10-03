import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();

    // Get the event by wwwId
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, www_id, title, couple_names')
      .eq('www_id', 'L2GXQB1')
      .single();

    if (eventError || !event) {
      return NextResponse.json({ 
        error: 'Event not found',
        eventError 
      });
    }

    // Check all RSVPs for this event
    const { data: rsvps, error: rsvpError } = await supabase
      .from('invitation_rsvps')
      .select('*')
      .eq('event_id', event.id)
      .order('submitted_at', { ascending: false });

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        wwwId: event.www_id,
        title: event.title,
        coupleNames: event.couple_names
      },
      rsvpCount: rsvps?.length || 0,
      rsvps: rsvps || [],
      rsvpError
    });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
