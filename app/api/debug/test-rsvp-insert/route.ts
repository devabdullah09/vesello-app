import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
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

    // Create a test RSVP
    const testRSVP = {
      event_id: event.id, // Use the actual database event ID
      main_guest: { name: 'Test', surname: 'User' },
      additional_guests: [],
      wedding_day_attendance: { 'Test User': 'will' },
      after_party_attendance: { 'Test User': 'will' },
      food_preferences: { 'Test User': 'Regular' },
      accommodation_needed: { 'Test User': 'No' },
      transportation_needed: { 'Test User': 'No' },
      notes: { 'Test User': 'Test RSVP from debug endpoint' },
      custom_responses: {},
      email: 'test@example.com',
      send_email_confirmation: true,
      submitted_at: new Date().toISOString(),
      status: 'pending'
    };

    console.log('=== TEST RSVP INSERT DEBUG ===');
    console.log('Event ID:', event.id);
    console.log('Test RSVP data:', JSON.stringify(testRSVP, null, 2));

    const { data: insertedRSVP, error: insertError } = await supabase
      .from('invitation_rsvps')
      .insert([testRSVP])
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json({ 
        error: 'Failed to insert test RSVP',
        insertError 
      });
    }

    console.log('✅ Test RSVP inserted successfully:', insertedRSVP);
    console.log('=== END TEST RSVP INSERT DEBUG ===');

    return NextResponse.json({
      success: true,
      message: 'Test RSVP inserted successfully',
      event: event,
      testRSVP: insertedRSVP
    });

  } catch (error) {
    console.error('Test RSVP error:', error);
    return NextResponse.json({ 
      error: 'Test RSVP failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
