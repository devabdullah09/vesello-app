import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// Package mapping based on client's requirements
const PACKAGE_MAPPING = {
  'BASIC': {
    plan: 'basic',
    features: ['event_info'],
    description: 'Event info page only'
  },
  'GOLD': {
    plan: 'gold', 
    features: ['event_info', 'gallery'],
    description: 'Event info page + Gallery'
  },
  'PREMIUM': {
    plan: 'premium',
    features: ['event_info', 'gallery', 'rsvp'],
    description: 'Event info page + Gallery + RSVP'
  }
}

// Extract customer info from webhook payload
function extractCustomerInfo(webhookData: any) {
  let customerEmail = ''
  let customerName = ''
  let productName = ''
  let orderId = ''
  let amount = 0

  if (webhookData.contact) {
    customerEmail = webhookData.contact.email || ''
    customerName = `${webhookData.contact.first_name || ''} ${webhookData.contact.last_name || ''}`.trim()
  }

  if (webhookData.order) {
    productName = webhookData.order.product_name || webhookData.order.product || ''
    orderId = webhookData.order.id || webhookData.order.order_id || ''
    amount = parseFloat(webhookData.order.amount || webhookData.order.price || '0')
  }

  return {
    customerEmail,
    customerName,
    productName,
    orderId,
    amount
  }
}

// Working webhook handler that stores orders and creates a simple subscription record
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const webhookData = JSON.parse(body)
    
    console.log('Received systeme.io webhook:', JSON.stringify(webhookData, null, 2))

    const { customerEmail, customerName, productName, orderId, amount } = extractCustomerInfo(webhookData)

    if (!customerEmail) {
      return NextResponse.json(
        { error: 'Customer email is required' }, 
        { status: 400 }
      )
    }

    if (!productName) {
      return NextResponse.json(
        { error: 'Product name is required' }, 
        { status: 400 }
      )
    }

    const packageInfo = PACKAGE_MAPPING[productName as keyof typeof PACKAGE_MAPPING]
    if (!packageInfo) {
      return NextResponse.json(
        { error: `Unknown package: ${productName}` }, 
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Store the systeme.io order
    const { data: orderData, error: orderError } = await supabase
      .from('systeme_orders')
      .upsert({
        systeme_order_id: orderId,
        customer_email: customerEmail,
        customer_name: customerName,
        package_name: productName,
        amount: amount,
        status: 'active'
      }, {
        onConflict: 'systeme_order_id'
      })
      .select()

    if (orderError) {
      console.error('Error storing order:', orderError)
      return NextResponse.json(
        { error: 'Failed to store order' }, 
        { status: 500 }
      )
    }

    console.log(`Successfully processed ${packageInfo.plan} subscription for ${customerEmail}`)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully',
      plan: packageInfo.plan,
      features: packageInfo.features,
      customerEmail,
      orderId: orderData[0]?.id
    })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Systeme.io working webhook endpoint is active',
    timestamp: new Date().toISOString()
  })
}
