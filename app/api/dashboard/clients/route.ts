import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// GET /api/dashboard/clients - Get all clients (superadmin only)
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

    // Check if user is superadmin
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userProfile || userProfile.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden - Superadmin access required' }, { status: 403 })
    }
    
    // Get all user profiles
    const { data: clients, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
    }

    // Add status field based on last_login
    const clientsWithStatus = clients?.map(client => ({
      ...client,
      status: getClientStatus(client.last_login)
    })) || []

    return NextResponse.json({ data: clientsWithStatus })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

const getClientStatus = (lastLogin: string): 'active' | 'inactive' | 'suspended' => {
  const lastLoginDate = new Date(lastLogin)
  const daysSinceLogin = (Date.now() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24)
  
  if (daysSinceLogin <= 7) return 'active'
  if (daysSinceLogin <= 30) return 'inactive'
  return 'suspended'
}
