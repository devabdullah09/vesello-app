import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('=== WEBHOOK DEBUG START ===')
    
    // Test 1: Can we read the request?
    const body = await request.text()
    console.log('Raw body received:', body)
    
    // Test 2: Can we parse JSON?
    let webhookData
    try {
      webhookData = JSON.parse(body)
      console.log('Parsed JSON:', JSON.stringify(webhookData, null, 2))
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON',
        rawBody: body
      })
    }
    
    // Test 3: Extract customer info
    const customerEmail = webhookData.contact?.email || 'no-email'
    const productName = webhookData.order?.product_name || 'no-product'
    
    console.log('Extracted email:', customerEmail)
    console.log('Extracted product:', productName)
    
    // Test 4: Check environment variables
    const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasSupabaseKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY
    
    console.log('Has Supabase URL:', hasSupabaseUrl)
    console.log('Has Service Role Key:', hasSupabaseKey)
    
    // Test 5: Try to import Supabase (without using it)
    try {
      const { createServerClient } = await import('@/lib/supabase')
      console.log('Supabase import successful')
      
      // Test 6: Try to create client (without using it)
      try {
        const supabase = createServerClient()
        console.log('Supabase client created successfully')
      } catch (clientError) {
        console.error('Supabase client creation error:', clientError)
        return NextResponse.json({
          success: false,
          error: 'Supabase client creation failed',
          details: clientError instanceof Error ? clientError.message : 'Unknown error'
        })
      }
    } catch (importError) {
      console.error('Supabase import error:', importError)
      return NextResponse.json({
        success: false,
        error: 'Supabase import failed',
        details: importError instanceof Error ? importError.message : 'Unknown error'
      })
    }
    
    console.log('=== WEBHOOK DEBUG END ===')
    
    return NextResponse.json({
      success: true,
      message: 'Debug webhook successful',
      extractedData: {
        email: customerEmail,
        product: productName
      },
      environment: {
        hasSupabaseUrl,
        hasSupabaseKey
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Debug webhook error:', error)
    return NextResponse.json({
      success: false,
      error: 'Debug webhook failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Simple debug webhook endpoint',
    usage: 'POST webhook data here for debugging'
  })
}
