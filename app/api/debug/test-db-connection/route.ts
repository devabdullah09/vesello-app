import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();

    // Test basic database connection
    const { data, error } = await supabase
      .from('events')
      .select('count')
      .limit(1);

    if (error) {
      return NextResponse.json({ 
        success: false,
        error: 'Database connection failed',
        details: error 
      });
    }

    // Test invitation_rsvps table
    const { data: rsvpData, error: rsvpError } = await supabase
      .from('invitation_rsvps')
      .select('count')
      .limit(1);

    return NextResponse.json({
      success: true,
      message: 'Database connection working',
      eventsTable: data,
      rsvpTable: rsvpData,
      rsvpError: rsvpError
    });

  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Database test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
