import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// Package mapping - this is what your client mentioned
const PACKAGE_MAPPING: Record<string, { plan: string; features: string[] }> = {
  // Try different possible package names from systeme.io
  'BASIC': { plan: 'basic', features: ['event_info'] },
  'GOLD': { plan: 'gold', features: ['event_info', 'gallery'] },
  'PREMIUM': { plan: 'premium', features: ['event_info', 'gallery', 'rsvp'] },
  
  // Alternative naming patterns
  'PL-Order BASIC': { plan: 'basic', features: ['event_info'] },
  'PL-Order GOLD': { plan: 'gold', features: ['event_info', 'gallery'] },
  'PL-Order PREMIUM': { plan: 'premium', features: ['event_info', 'gallery', 'rsvp'] },
  
  // More variations
  'Basic Plan': { plan: 'basic', features: ['event_info'] },
  'Gold Plan': { plan: 'gold', features: ['event_info', 'gallery'] },
  'Premium Plan': { plan: 'premium', features: ['event_info', 'gallery', 'rsvp'] }
}

// Extract package information from various possible locations
function extractPackageInfo(webhookData: any) {
  const possiblePackageSources = [
    webhookData.order?.product_name,
    webhookData.order?.product,
    webhookData.product?.name,
    webhookData.product_name,
    webhookData.item?.name,
    webhookData.purchase?.product_name,
    webhookData.transaction?.product_name,
    webhookData.contact?.tags?.find((tag: string) => PACKAGE_MAPPING[tag]),
    webhookData.contact?.custom_fields?.package,
    webhookData.contact?.custom_fields?.plan
  ]

  for (const packageName of possiblePackageSources) {
    if (packageName && PACKAGE_MAPPING[packageName]) {
      return {
        packageName,
        planInfo: PACKAGE_MAPPING[packageName]
      }
    }
  }

  return null
}

// Extract customer information from various possible locations
function extractCustomerInfo(webhookData: any) {
  return {
    email: webhookData.contact?.email || 
           webhookData.customer?.email || 
           webhookData.email ||
           webhookData.user?.email,
    
    name: webhookData.contact?.first_name || 
          webhookData.customer?.first_name ||
          webhookData.first_name ||
          webhookData.user?.first_name,
    
    lastName: webhookData.contact?.last_name || 
              webhookData.customer?.last_name ||
              webhookData.last_name ||
              webhookData.user?.last_name,
    
    id: webhookData.contact?.id || 
        webhookData.customer?.id ||
        webhookData.user_id ||
        webhookData.contact_id
  }
}

// Extract order information
function extractOrderInfo(webhookData: any) {
  return {
    id: webhookData.order?.id || 
        webhookData.order_id || 
        webhookData.transaction?.id ||
        webhookData.purchase?.id,
    
    amount: webhookData.order?.amount || 
            webhookData.order?.price ||
            webhookData.product?.price ||
            webhookData.amount ||
            webhookData.total,
    
    currency: webhookData.order?.currency || 
              webhookData.currency ||
              'EUR',
    
    status: webhookData.order?.status || 
            webhookData.status ||
            webhookData.transaction?.status
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const webhookData = JSON.parse(body)
    
    console.log('=== SYSTEME.IO WEBHOOK (COMPLETE) ===')
    console.log('Full webhook data:', JSON.stringify(webhookData, null, 2))

    // Extract information from webhook
    const customer = extractCustomerInfo(webhookData)
    const order = extractOrderInfo(webhookData)
    const packageInfo = extractPackageInfo(webhookData)

    console.log('Extracted customer:', customer)
    console.log('Extracted order:', order)
    console.log('Extracted package:', packageInfo)

    // Validate required data
    if (!customer.email) {
      return NextResponse.json({
        success: false,
        error: 'No customer email found in webhook data',
        availableFields: Object.keys(webhookData)
      })
    }

    if (!packageInfo) {
      return NextResponse.json({
        success: false,
        error: 'No recognized package found in webhook data',
        possiblePackageSources: [
          webhookData.order?.product_name,
          webhookData.product?.name,
          webhookData.product_name,
          webhookData.contact?.tags,
          webhookData.contact?.custom_fields
        ],
        fullData: webhookData
      })
    }

    // Store the order in database
    const supabase = createServerClient()
    
    const { data: orderData, error: orderError } = await supabase
      .from('systeme_orders')
      .upsert({
        systeme_order_id: order.id || `webhook-${Date.now()}`,
        systeme_transaction_id: order.id,
        customer_email: customer.email,
        customer_name: `${customer.name || ''} ${customer.lastName || ''}`.trim(),
        package_name: packageInfo.packageName,
        amount: parseFloat(order.amount) || 0,
        currency: order.currency,
        status: 'active',
        webhook_data: webhookData
      }, {
        onConflict: 'systeme_order_id'
      })
      .select()

    if (orderError) {
      console.error('Error storing order:', orderError)
      return NextResponse.json({
        success: false,
        error: 'Failed to store order',
        details: orderError.message
      })
    }

    console.log('Successfully processed webhook:', {
      customer: customer.email,
      package: packageInfo.packageName,
      plan: packageInfo.planInfo.plan,
      features: packageInfo.planInfo.features
    })

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      customer: customer.email,
      package: packageInfo.packageName,
      plan: packageInfo.planInfo.plan,
      features: packageInfo.planInfo.features,
      orderId: orderData[0]?.id
    })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Systeme.io complete webhook endpoint',
    supportedPackages: Object.keys(PACKAGE_MAPPING),
    timestamp: new Date().toISOString()
  })
}
