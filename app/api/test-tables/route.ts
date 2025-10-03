import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createServerClient()
    
    // Test if systeme_orders table exists
    const { data: ordersData, error: ordersError } = await supabase
      .from('systeme_orders')
      .select('count')
      .limit(1)

    // Test if user_subscriptions table exists
    const { data: subsData, error: subsError } = await supabase
      .from('user_subscriptions')
      .select('count')
      .limit(1)

    return NextResponse.json({
      success: true,
      tables: {
        systeme_orders: {
          exists: !ordersError,
          error: ordersError?.message
        },
        user_subscriptions: {
          exists: !subsError,
          error: subsError?.message
        }
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
