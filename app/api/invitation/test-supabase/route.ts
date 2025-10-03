import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Test basic connection by trying to get the current user (should be null if not authenticated)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // Test database connection by trying to query a table
    const { data, error: dbError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);
    
    return NextResponse.json({ 
      message: 'Supabase connection successful',
      clientType: typeof supabase,
      hasSupabase: !!supabase,
      authTest: authError ? `Auth error: ${authError.message}` : 'Auth connection OK',
      dbTest: dbError ? `DB error: ${dbError.message}` : 'Database connection OK',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'Supabase connection failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

