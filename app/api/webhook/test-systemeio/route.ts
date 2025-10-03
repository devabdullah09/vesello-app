import { NextRequest, NextResponse } from 'next/server'

/**
 * Test endpoint for systeme.io webhook integration
 * This simulates what systeme.io would send to your webhook
 */
export async function POST(request: NextRequest) {
  try {
    const { testPlan = 'BASIC', customerEmail = 'test@example.com' } = await request.json()

    // Simulate systeme.io webhook payload
    const mockWebhookData = {
      event: 'order_created',
      contact: {
        email: customerEmail,
        first_name: 'Test',
        last_name: 'User'
      },
      order: {
        id: `TEST-${Date.now()}`,
        product_name: testPlan,
        amount: testPlan === 'BASIC' ? 49 : testPlan === 'GOLD' ? 99 : 199,
        status: 'paid'
      },
      timestamp: new Date().toISOString()
    }

    // Forward to the real webhook endpoint
    const webhookUrl = `${request.nextUrl.origin}/api/webhook/systemeio`
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockWebhookData)
    })

    const result = await response.json()

    return NextResponse.json({
      success: true,
      message: `Test webhook sent for ${testPlan} plan`,
      webhookData: mockWebhookData,
      webhookResponse: result
    })

  } catch (error) {
    console.error('Test webhook error:', error)
    return NextResponse.json(
      { error: 'Test webhook failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Systeme.io webhook test endpoint',
    usage: 'POST with { "testPlan": "BASIC|GOLD|PREMIUM", "customerEmail": "test@example.com" }',
    examples: {
      BASIC: {
        testPlan: 'BASIC',
        customerEmail: 'test@example.com',
        expectedFeatures: ['event_info']
      },
      GOLD: {
        testPlan: 'GOLD',
        customerEmail: 'test@example.com',
        expectedFeatures: ['event_info', 'gallery']
      },
      PREMIUM: {
        testPlan: 'PREMIUM',
        customerEmail: 'test@example.com',
        expectedFeatures: ['event_info', 'gallery', 'rsvp']
      }
    }
  })
}
