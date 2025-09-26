import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// GET /api/dashboard/organizers/[id] - Get specific organizer details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get organizer details
    const { data: organizer, error } = await supabase
      .from('user_profiles')
      .select(`
        id,
        email,
        display_name,
        event_id,
        created_at,
        last_login
      `)
      .eq('id', params.id)
      .eq('role', 'organizer')
      .single()

    // Get event details if organizer has an assigned event
    let organizerWithEvent = organizer
    if (organizer && organizer.event_id) {
      const { data: event } = await supabase
        .from('events')
        .select('id, www_id, title, couple_names, status, event_date')
        .eq('www_id', organizer.event_id)
        .single()
      
      organizerWithEvent = { ...organizer, events: event }
    }

    if (error || !organizer) {
      return NextResponse.json(
        { error: 'Organizer not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: organizerWithEvent
    })
  } catch (error) {
    console.error('Error getting organizer:', error)
    return NextResponse.json(
      { error: 'Failed to get organizer' },
      { status: 500 }
    )
  }
}

// PUT /api/dashboard/organizers/[id] - Update organizer details
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Parse request body
    const { displayName, password, eventId } = await request.json()

    // Check if organizer exists
    const { data: existingOrganizer, error: fetchError } = await supabase
      .from('user_profiles')
      .select('id, event_id')
      .eq('id', params.id)
      .eq('role', 'organizer')
      .single()

    if (fetchError || !existingOrganizer) {
      return NextResponse.json(
        { error: 'Organizer not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {}
    if (displayName) updateData.display_name = displayName
    if (eventId) updateData.event_id = eventId

    // Update user profile
    if (Object.keys(updateData).length > 0) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', params.id)

      if (profileError) throw profileError
    }

    // Update password if provided
    if (password) {
      const { error: passwordError } = await supabase.auth.admin.updateUserById(
        params.id,
        { password }
      )
      if (passwordError) throw passwordError
    }

    // Update event assignment if eventId changed
    if (eventId && eventId !== existingOrganizer.event_id) {
      // Check if event exists
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('id, www_id')
        .eq('www_id', eventId)
        .single()

      if (eventError || !event) {
        return NextResponse.json(
          { error: 'Event not found' },
          { status: 404 }
        )
      }

      // Remove organizer from old event
      const { error: removeError } = await supabase
        .from('events')
        .update({ organizer_id: null })
        .eq('organizer_id', params.id)

      if (removeError) throw removeError

      // Assign organizer to new event
      const { error: assignError } = await supabase
        .from('events')
        .update({ organizer_id: params.id })
        .eq('www_id', eventId)

      if (assignError) throw assignError
    }

    return NextResponse.json({
      success: true,
      message: 'Organizer updated successfully'
    })
  } catch (error) {
    console.error('Error updating organizer:', error)
    return NextResponse.json(
      { error: 'Failed to update organizer' },
      { status: 500 }
    )
  }
}

// DELETE /api/dashboard/organizers/[id] - Delete organizer account
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if organizer exists
    const { data: existingOrganizer, error: fetchError } = await supabase
      .from('user_profiles')
      .select('id, event_id')
      .eq('id', params.id)
      .eq('role', 'organizer')
      .single()

    if (fetchError || !existingOrganizer) {
      return NextResponse.json(
        { error: 'Organizer not found' },
        { status: 404 }
      )
    }

    // Remove organizer from event
    const { error: removeError } = await supabase
      .from('events')
      .update({ organizer_id: null })
      .eq('organizer_id', params.id)

    if (removeError) throw removeError

    // Delete auth user (this will cascade delete the user profile)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(params.id)
    if (deleteError) throw deleteError

    return NextResponse.json({
      success: true,
      message: 'Organizer deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting organizer:', error)
    return NextResponse.json(
      { error: 'Failed to delete organizer' },
      { status: 500 }
    )
  }
}
