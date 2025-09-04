import { NextRequest, NextResponse } from 'next/server';
import { submitInvitationRSVP } from '@/lib/supabase-invitation-service';

// Temporary local storage for RSVPs while we migrate to Supabase
const localRSVPs: any[] = [];

// Test endpoint to verify the API is working
export async function GET() {
  return NextResponse.json({ 
    message: 'RSVP API endpoint is working',
    timestamp: new Date().toISOString(),
    localRSVPCount: localRSVPs.length
  });
}

export async function POST(request: NextRequest) {
  try {
    console.log('RSVP API endpoint called');
    
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    // Validate required fields
    const { eventId, mainGuest, additionalGuests, weddingDayAttendance, afterPartyAttendance, foodPreferences, accommodationNeeded, transportationNeeded, notes, email, sendEmailConfirmation } = body;
    
    if (!eventId || !mainGuest || !mainGuest.name || !mainGuest.surname) {
      console.log('Validation failed:', { eventId, mainGuest });
      return NextResponse.json(
        { error: 'Missing required fields: eventId, mainGuest name and surname are required' },
        { status: 400 }
      );
    }

    console.log('Validation passed, attempting Supabase submission...');

    try {
      // Try Supabase first
      const rsvpId = await submitInvitationRSVP({
        eventId,
        mainGuest,
        additionalGuests: additionalGuests || [],
        weddingDayAttendance: weddingDayAttendance || {},
        afterPartyAttendance: afterPartyAttendance || {},
        foodPreferences: foodPreferences || {},
        accommodationNeeded: accommodationNeeded || {},
        transportationNeeded: transportationNeeded || {},
        notes: notes || {},
        email: email || '',
        sendEmailConfirmation: sendEmailConfirmation !== undefined ? sendEmailConfirmation : true,
      });

      console.log('RSVP submitted successfully to Supabase with ID:', rsvpId);

      return NextResponse.json({ 
        success: true, 
        rsvpId,
        message: 'RSVP submitted successfully to Supabase',
        storage: 'supabase'
      });

    } catch (supabaseError) {
      console.log('Supabase submission failed, falling back to local storage:', supabaseError);
      
      // Fallback to local storage
      const localRSVP = {
        id: `local-${Date.now()}`,
        eventId,
        mainGuest,
        additionalGuests: additionalGuests || [],
        weddingDayAttendance: weddingDayAttendance || {},
        afterPartyAttendance: afterPartyAttendance || {},
        foodPreferences: foodPreferences || {},
        accommodationNeeded: accommodationNeeded || {},
        transportationNeeded: transportationNeeded || {},
        notes: notes || {},
        email: email || '',
        sendEmailConfirmation: sendEmailConfirmation !== undefined ? sendEmailConfirmation : true,
        submittedAt: new Date(),
        status: 'pending',
        storage: 'local'
      };

      localRSVPs.push(localRSVP);
      console.log('RSVP stored locally. Total local RSVPs:', localRSVPs.length);

      return NextResponse.json({ 
        success: true, 
        rsvpId: localRSVP.id,
        message: 'RSVP stored locally (Supabase connection issue)',
        storage: 'local',
        note: 'Data is stored temporarily. Supabase connection needs to be configured.'
      });
    }

  } catch (error) {
    console.error('Error in RSVP API endpoint:', error);
    
    // Return more detailed error information
    return NextResponse.json(
      { 
        error: 'Failed to submit RSVP',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
