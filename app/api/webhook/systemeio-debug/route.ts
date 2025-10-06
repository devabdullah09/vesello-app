import { NextRequest, NextResponse } from 'next/server'

/**
 * Debug webhook endpoint to see exactly what systeme.io sends
 * This helps us understand the data structure
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    
    // Log the raw request
    console.log('=== SYSTEME.IO WEBHOOK DEBUG ===')
    console.log('Headers:', Object.fromEntries(request.headers.entries()))
    console.log('Raw Body:', body)
    
    let webhookData
    try {
      webhookData = JSON.parse(body)
      console.log('Parsed Data:', JSON.stringify(webhookData, null, 2))
    } catch (parseError) {
      console.log('JSON Parse Error:', parseError)
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON',
        rawBody: body
      })
    }

    // Extract key information
    const extractedInfo = {
      event: webhookData.event || webhookData.type || 'unknown',
      contact: {
        email: webhookData.contact?.email || webhookData.customer?.email || 'no email',
        name: webhookData.contact?.first_name || webhookData.customer?.name || 'no name',
        id: webhookData.contact?.id || webhookData.customer?.id || 'no id'
      },
      order: {
        id: webhookData.order?.id || webhookData.order_id || 'no order id',
        product: webhookData.order?.product_name || webhookData.product?.name || 'no product',
        amount: webhookData.order?.amount || webhookData.product?.price || 'no amount',
        status: webhookData.order?.status || webhookData.status || 'no status'
      },
      fullData: webhookData
    }

    console.log('Extracted Info:', JSON.stringify(extractedInfo, null, 2))
    console.log('=== END DEBUG ===')

    return NextResponse.json({
      success: true,
      message: 'Webhook received and logged',
      extractedInfo,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Debug webhook error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Systeme.io debug webhook endpoint',
    usage: 'This endpoint logs all incoming webhook data for debugging',
    timestamp: new Date().toISOString()
  })
}
