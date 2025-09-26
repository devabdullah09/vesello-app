import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ wwwId: string }> }
) {
  try {
    const { wwwId } = await params;
    
    if (!wwwId) {
      return NextResponse.json({ 
        error: 'wwwId parameter is required' 
      }, { status: 400 });
    }

    const supabase = createServerClient();

    // Get event details by wwwId
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, www_id, title, couple_names, event_date, venue, rsvp_enabled')
      .eq('www_id', wwwId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ 
        error: 'Event not found',
        success: false 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        wwwId: event.www_id,
        title: event.title,
        coupleNames: event.couple_names,
        eventDate: event.event_date,
        venue: event.venue,
        rsvpEnabled: event.rsvp_enabled
      }
    });

  } catch (error) {
    console.error('Error fetching event details:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch event details',
      success: false 
    }, { status: 500 });
  }
}
