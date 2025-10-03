import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = createServerClient()
    
    // Test inserting into systeme_orders
    const { data: orderData, error: orderError } = await supabase
      .from('systeme_orders')
      .insert({
        systeme_order_id: `TEST-${Date.now()}`,
        customer_email: 'test-insert@example.com',
        customer_name: 'Test Insert User',
        package_name: 'PREMIUM',
        amount: 199,
        status: 'active'
      })
      .select()

    if (orderError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to insert order',
        details: orderError.message
      })
    }

    // Test inserting into user_subscriptions
    const tempUserId = crypto.randomUUID()
    const { data: subData, error: subError } = await supabase
      .from('user_subscriptions')
      .insert({
        id: tempUserId,
        user_id: tempUserId,
        systeme_order_id: orderData[0].systeme_order_id,
        plan_name: 'premium',
        features: ['event_info', 'gallery', 'rsvp'],
        status: 'active'
      })
      .select()

    if (subError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to insert subscription',
        details: subError.message
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Test insert successful',
      orderData,
      subData
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
