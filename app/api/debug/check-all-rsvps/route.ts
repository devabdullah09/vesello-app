import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();

    // Get ALL RSVPs from the database
    const { data: allRsvps, error: rsvpError } = await supabase
      .from('invitation_rsvps')
      .select('*')
      .order('submitted_at', { ascending: false });

    // Get the specific event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, www_id, title, couple_names')
      .eq('www_id', 'L2GXQB1')
      .single();

    return NextResponse.json({
      success: true,
      totalRsvps: allRsvps?.length || 0,
      allRsvps: allRsvps || [],
      event: event || null,
      eventError: eventError,
      rsvpError: rsvpError
    });

  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ 
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
