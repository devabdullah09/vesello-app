import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('=== SUPABASE CONNECTION TEST ===')
    
    // Test 1: Check environment variables
    const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasSupabaseKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY
    
    console.log('Environment variables:')
    console.log('- Has Supabase URL:', hasSupabaseUrl)
    console.log('- Has Service Role Key:', hasSupabaseKey)
    
    if (!hasSupabaseUrl || !hasSupabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing environment variables',
        hasSupabaseUrl,
        hasSupabaseKey
      })
    }
    
    // Test 2: Try to import and create client
    try {
      const { createServerClient } = await import('@/lib/supabase')
      console.log('Supabase import successful')
      
      const supabase = createServerClient()
      console.log('Supabase client created')
      
      // Test 3: Try a simple query (just check if we can connect)
      const { data, error } = await supabase
        .from('systeme_orders')
        .select('count')
        .limit(1)
      
      if (error) {
        console.error('Database query error:', error)
        return NextResponse.json({
          success: false,
          error: 'Database query failed',
          details: error.message,
          code: error.code
        })
      }
      
      console.log('Database query successful')
      
      return NextResponse.json({
        success: true,
        message: 'Supabase connection test successful',
        environment: {
          hasSupabaseUrl,
          hasSupabaseKey
        },
        databaseTest: {
          success: true,
          data: data
        }
      })
      
    } catch (importError) {
      console.error('Import or client creation error:', importError)
      return NextResponse.json({
        success: false,
        error: 'Import or client creation failed',
        details: importError instanceof Error ? importError.message : 'Unknown error'
      })
    }
    
  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
