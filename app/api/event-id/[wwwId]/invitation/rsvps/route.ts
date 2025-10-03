import { NextRequest, NextResponse } from 'next/server';
import { getInvitationRSVPsByEvent } from '@/lib/supabase-invitation-service';

// GET /api/event-id/[wwwId]/invitation/rsvps - Get all RSVPs for specific event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ wwwId: string }> }
) {
  try {
    const { wwwId } = await params;
    
    const rsvps = await getInvitationRSVPsByEvent(wwwId);
    
    return NextResponse.json({
      success: true,
      rsvps: rsvps
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
