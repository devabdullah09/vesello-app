import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// GET /api/dashboard/organizers/[id]/password - Get organizer password (superadmin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Check if organizer exists
    const { data: organizer, error: fetchError } = await supabase
      .from('user_profiles')
      .select('id, email, display_name, event_id')
      .eq('id', id)
      .eq('role', 'organizer')
      .single()

    if (fetchError || !organizer) {
      return NextResponse.json(
        { error: 'Organizer not found' },
        { status: 404 }
      )
    }

    // Note: We cannot retrieve the actual password from Supabase Auth
    // Instead, we'll return a message indicating that passwords cannot be retrieved
    return NextResponse.json({
      success: true,
      data: {
        id: organizer.id,
        email: organizer.email,
        display_name: organizer.display_name,
        message: 'Password cannot be retrieved for security reasons. Use the reset password feature to generate a new password.'
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get organizer password info' },
      { status: 500 }
    )
  }
}

// POST /api/dashboard/organizers/[id]/password - Generate new password for organizer
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Check if organizer exists
    const { data: organizer, error: fetchError } = await supabase
      .from('user_profiles')
      .select('id, email, display_name')
      .eq('id', id)
      .eq('role', 'organizer')
      .single()

    if (fetchError || !organizer) {
      return NextResponse.json(
        { error: 'Organizer not found' },
        { status: 404 }
      )
    }

    // Generate a new password
    const newPassword = generatePassword()
    
    // Update the organizer's password
    const { error: passwordError } = await supabase.auth.admin.updateUserById(
      id,
      { password: newPassword }
    )

    if (passwordError) throw passwordError

    return NextResponse.json({
      success: true,
      data: {
        id: organizer.id,
        email: organizer.email,
        display_name: organizer.display_name,
        newPassword: newPassword,
        message: 'Password generated successfully'
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate organizer password' },
      { status: 500 }
    )
  }
}

// Helper function to generate a secure password
function generatePassword(): string {
  const length = 12
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  
  // Ensure at least one character from each category
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*'
  
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]
  
  // Fill the rest with random characters
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)]
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}
