import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { randomUUID } from 'crypto'

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

// Webhook signature verification (optional but recommended)
function verifyWebhookSignature(request: NextRequest, body: string): boolean {
  // You can implement webhook signature verification here
  // For now, we'll skip it but it's good practice for production
  return true
}

// Extract customer info from webhook payload
function extractCustomerInfo(webhookData: any) {
  // Handle different possible webhook structures from systeme.io
  let customerEmail = ''
  let customerName = ''
  let productName = ''
  let orderId = ''
  let amount = 0

  // Try different possible structures
  if (webhookData.contact) {
    customerEmail = webhookData.contact.email || ''
    customerName = `${webhookData.contact.first_name || ''} ${webhookData.contact.last_name || ''}`.trim()
  }

  if (webhookData.order) {
    productName = webhookData.order.product_name || webhookData.order.product || ''
    orderId = webhookData.order.id || webhookData.order.order_id || ''
    amount = parseFloat(webhookData.order.amount || webhookData.order.price || '0')
  }

  // Alternative structure
  if (webhookData.customer) {
    customerEmail = webhookData.customer.email || customerEmail
    customerName = webhookData.customer.name || customerName
  }

  if (webhookData.product) {
    productName = webhookData.product.name || productName
    amount = parseFloat(webhookData.product.price || amount.toString())
  }

  return {
    customerEmail,
    customerName,
    productName,
    orderId,
    amount
  }
}

// Create or update user subscription
async function createOrUpdateSubscription(customerEmail: string, customerName: string, productName: string, orderId: string, amount: number) {
  const supabase = createServerClient()

  try {
    // Find package mapping
    const packageInfo = PACKAGE_MAPPING[productName as keyof typeof PACKAGE_MAPPING]
    
    if (!packageInfo) {
      console.error(`Unknown package: ${productName}`)
      return { success: false, error: `Unknown package: ${productName}` }
    }

    // Check if user already exists
    const { data: existingUser, error: userError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', customerEmail)
      .single()

    let userId = ''

    if (existingUser) {
      // Update existing user
      userId = existingUser.id
      
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          display_name: customerName || existingUser.display_name,
          role: 'organizer', // Make them an organizer since they purchased
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (updateError) {
        console.error('Error updating user:', updateError)
        return { success: false, error: 'Failed to update user' }
      }
    } else {
      // For webhook purchases, we'll create a proper UUID
      // The user will set up proper auth when they first log in
      const tempUserId = randomUUID()
      
      const { data: newUser, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          id: tempUserId,
          email: customerEmail,
          display_name: customerName,
          role: 'organizer',
          subscription_status: 'active'
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating user:', createError)
        return { success: false, error: 'Failed to create user' }
      }

      userId = newUser.id
    }

    // Create or update systeme.io order record
    const { error: orderError } = await supabase
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

    if (orderError) {
      console.error('Error creating order record:', orderError)
    }

    // Create or update subscription
    const { error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        systeme_order_id: orderId,
        plan_name: packageInfo.plan,
        features: packageInfo.features,
        status: 'active',
        created_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (subscriptionError) {
      console.error('Error creating subscription:', subscriptionError)
      return { success: false, error: 'Failed to create subscription' }
    }

    console.log(`Successfully processed subscription for ${customerEmail}: ${packageInfo.plan}`)
    
    return { 
      success: true, 
      userId, 
      plan: packageInfo.plan,
      features: packageInfo.features
    }

  } catch (error) {
    console.error('Unexpected error in createOrUpdateSubscription:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

// Main webhook handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    
    // Verify webhook signature (implement if systeme.io provides one)
    if (!verifyWebhookSignature(request, body)) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' }, 
        { status: 401 }
      )
    }

    // Parse webhook data
    const webhookData = JSON.parse(body)
    
    console.log('Received systeme.io webhook:', JSON.stringify(webhookData, null, 2))

    // Extract customer information
    const { customerEmail, customerName, productName, orderId, amount } = extractCustomerInfo(webhookData)

    // Validate required data
    if (!customerEmail) {
      console.error('No customer email found in webhook data')
      return NextResponse.json(
        { error: 'Customer email is required' }, 
        { status: 400 }
      )
    }

    if (!productName) {
      console.error('No product name found in webhook data')
      return NextResponse.json(
        { error: 'Product name is required' }, 
        { status: 400 }
      )
    }

    // Process the subscription
    const result = await createOrUpdateSubscription(
      customerEmail, 
      customerName, 
      productName, 
      orderId, 
      amount
    )

    if (result.success) {
      // TODO: Send welcome email here
      console.log(`Welcome email should be sent to: ${customerEmail}`)
      
      return NextResponse.json({ 
        success: true, 
        message: 'Webhook processed successfully',
        userId: result.userId,
        plan: result.plan,
        features: result.features
      })
    } else {
      return NextResponse.json(
        { error: result.error }, 
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// Handle GET requests (for testing)
export async function GET() {
  return NextResponse.json({ 
    message: 'Systeme.io webhook endpoint is active',
    timestamp: new Date().toISOString()
  })
}
