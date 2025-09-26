import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();

    // Test the custom questions API for L2GXQB1
    const wwwId = 'L2GXQB1';

    // Get event to verify it exists and RSVP is enabled
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, www_id, rsvp_enabled')
      .eq('www_id', wwwId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ 
        error: 'Event not found',
        eventError 
      });
    }

    if (!event.rsvp_enabled) {
      return NextResponse.json({ 
        error: 'RSVP not enabled for this event' 
      });
    }

    // Get custom questions for this event
    const { data: customQuestions, error: questionsError } = await supabase
      .from('rsvp_form_questions')
      .select('*')
      .eq('event_id', event.id)
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    return NextResponse.json({
      success: true,
      event: event,
      customQuestions: customQuestions || [],
      questionsError: questionsError
    });

  } catch (error) {
    console.error('Test custom questions error:', error);
    return NextResponse.json({ 
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
