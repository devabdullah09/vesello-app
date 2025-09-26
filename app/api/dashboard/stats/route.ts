import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getDashboardStats, getRecentActivity } from '@/lib/events-service'

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    
    // Verify the JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user role
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const userRole = userProfile?.role || 'guest'

    // Get dashboard statistics
    const stats = await getDashboardStats(user.id, userRole)
    
    // Get recent activity
    const recentActivity = await getRecentActivity(user.id, userRole, 10)

    return NextResponse.json({
      success: true,
      data: {
        ...stats,
        recentActivity,
        timestamp: new Date().toISOString() // Add timestamp to prevent caching
      }
    })
  } catch (error) {
    console.error('Error getting dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to get dashboard statistics' },
      { status: 500 }
    )
  }
}
