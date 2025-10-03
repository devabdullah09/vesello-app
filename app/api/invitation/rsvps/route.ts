import { NextRequest, NextResponse } from 'next/server';
import { getInvitationRSVPsByEvent } from '@/lib/supabase-invitation-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json(
        { error: 'eventId parameter is required' },
        { status: 400 }
      );
    }

    try {
      // Try Supabase first
      const rsvps = await getInvitationRSVPsByEvent(eventId);

      return NextResponse.json({ 
        success: true,
        rsvps,
        count: rsvps.length,
        storage: 'supabase'
      });

    } catch (supabaseError) {
      
      // Fallback: return empty array with error message
      return NextResponse.json({ 
        success: false,
        rsvps: [],
        count: 0,
        error: 'Supabase connection failed',
        storage: 'error',
        message: 'Unable to fetch RSVPs. Check Supabase configuration.'
      });
    }

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to fetch RSVPs',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}