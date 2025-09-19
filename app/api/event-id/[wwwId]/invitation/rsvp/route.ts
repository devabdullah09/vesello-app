import { NextRequest, NextResponse } from 'next/server';
import { submitInvitationRSVP } from '@/lib/supabase-invitation-service';

// POST /api/event-id/[wwwId]/invitation/rsvp - Submit RSVP for specific event
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ wwwId: string }> }
) {
  try {
    const { wwwId } = await params;
    const rsvpData = await request.json();
    
    // Add the wwwId to the rsvpData
    const eventRsvpData = {
      ...rsvpData,
      eventId: wwwId,
    };
    
    const rsvpId = await submitInvitationRSVP(eventRsvpData);
    
    return NextResponse.json({
      success: true,
      message: 'RSVP saved successfully',
      rsvpId: rsvpId
    });
  } catch (error) {
    console.error('Error in RSVP API:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/event-id/[wwwId]/invitation/rsvp - Get RSVP count for specific event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ wwwId: string }> }
) {
  try {
    const { wwwId } = await params;
    
    // For now, return a simple count - you can expand this later
    return NextResponse.json({
      success: true,
      localRSVPCount: 0, // This would need to be implemented if you want local storage fallback
      eventId: wwwId
    });
  } catch (error) {
    console.error('Error getting RSVP info:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
