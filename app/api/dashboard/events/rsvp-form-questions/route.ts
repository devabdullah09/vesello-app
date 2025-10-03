import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// GET /api/dashboard/events/rsvp-form-questions?wwwId=XXXXXXX
// Returns all form questions for an event
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Require auth
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const wwwId = searchParams.get('wwwId')

    if (!wwwId) {
      return NextResponse.json({ error: 'wwwId parameter is required' }, { status: 400 })
    }

    // Get event to verify ownership
    const { data: event } = await supabase
      .from('events')
      .select('id, organizer_id, www_id, title, rsvp_enabled')
      .eq('www_id', wwwId)
      .single()

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (!event.rsvp_enabled) {
      return NextResponse.json({
        error: 'RSVP is not enabled for this event',
        message: 'RSVP feature has been disabled for this event by the organizer'
      }, { status: 403 })
    }

    // Verify the requester owns the event (organizer) or is superadmin
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 403 })
    }

    const isSuperAdmin = userProfile.role === 'superadmin'
    if (!isSuperAdmin && event.organizer_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get all form questions for this event
    const { data: questions, error: questionsError } = await supabase
      .from('rsvp_form_questions')
      .select('*')
      .eq('event_id', event.id)
      .order('order_index', { ascending: true })

    if (questionsError) {
      return NextResponse.json({ error: 'Failed to fetch form questions' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        eventId: event.id,
        wwwId: event.www_id,
        title: event.title,
        questions: questions || []
      }
    })

  } catch (error) {
    return NextResponse.json({ error: 'Failed to get RSVP form questions' }, { status: 500 })
  }
}

// POST /api/dashboard/events/rsvp-form-questions
// Creates a new form question for an event
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Require auth
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { wwwId, questionData } = await request.json()

    if (!wwwId || !questionData) {
      return NextResponse.json({ error: 'wwwId and questionData are required' }, { status: 400 })
    }

    // Get event to verify ownership
    const { data: event } = await supabase
      .from('events')
      .select('id, organizer_id, www_id, title, rsvp_enabled')
      .eq('www_id', wwwId)
      .single()

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (!event.rsvp_enabled) {
      return NextResponse.json({
        error: 'RSVP is not enabled for this event',
        message: 'RSVP feature has been disabled for this event by the organizer'
      }, { status: 403 })
    }

    // Verify the requester owns the event (organizer) or is superadmin
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 403 })
    }

    const isSuperAdmin = userProfile.role === 'superadmin'
    if (!isSuperAdmin && event.organizer_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get the highest order index
    const { data: lastQuestion } = await supabase
      .from('rsvp_form_questions')
      .select('order_index')
      .eq('event_id', event.id)
      .order('order_index', { ascending: false })
      .limit(1)
      .single()

    const nextOrderIndex = (lastQuestion?.order_index || 0) + 1

    // Create the new question
    const { data: newQuestion, error: createError } = await supabase
      .from('rsvp_form_questions')
      .insert({
        event_id: event.id,
        question_type: questionData.questionType,
        title: questionData.title,
        description: questionData.description,
        options: questionData.options,
        required: questionData.required || true,
        order_index: nextOrderIndex,
        is_active: true
      })
      .select()
      .single()

    if (createError) {
      return NextResponse.json({ error: 'Failed to create form question' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: newQuestion
    })

  } catch (error) {
    return NextResponse.json({ error: 'Failed to create RSVP form question' }, { status: 500 })
  }
}

// PUT /api/dashboard/events/rsvp-form-questions
// Updates an existing form question
export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Require auth
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { questionId, wwwId, questionData } = await request.json()

    if (!questionId || !wwwId || !questionData) {
      return NextResponse.json({ error: 'questionId, wwwId, and questionData are required' }, { status: 400 })
    }

    // Get event to verify ownership
    const { data: event } = await supabase
      .from('events')
      .select('id, organizer_id, www_id, title, rsvp_enabled')
      .eq('www_id', wwwId)
      .single()

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Verify the requester owns the event (organizer) or is superadmin
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 403 })
    }

    const isSuperAdmin = userProfile.role === 'superadmin'
    if (!isSuperAdmin && event.organizer_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update the question
    const { data: updatedQuestion, error: updateError } = await supabase
      .from('rsvp_form_questions')
      .update({
        question_type: questionData.questionType,
        title: questionData.title,
        description: questionData.description,
        options: questionData.options,
        required: questionData.required,
        is_active: questionData.isActive
      })
      .eq('id', questionId)
      .eq('event_id', event.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update form question' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: updatedQuestion
    })

  } catch (error) {
    return NextResponse.json({ error: 'Failed to update RSVP form question' }, { status: 500 })
  }
}

// DELETE /api/dashboard/events/rsvp-form-questions
// Deletes a form question
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Require auth
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const questionId = searchParams.get('questionId')
    const wwwId = searchParams.get('wwwId')

    if (!questionId || !wwwId) {
      return NextResponse.json({ error: 'questionId and wwwId parameters are required' }, { status: 400 })
    }

    // Get event to verify ownership
    const { data: event } = await supabase
      .from('events')
      .select('id, organizer_id, www_id, title, rsvp_enabled')
      .eq('www_id', wwwId)
      .single()

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Verify the requester owns the event (organizer) or is superadmin
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 403 })
    }

    const isSuperAdmin = userProfile.role === 'superadmin'
    if (!isSuperAdmin && event.organizer_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete the question
    const { error: deleteError } = await supabase
      .from('rsvp_form_questions')
      .delete()
      .eq('id', questionId)
      .eq('event_id', event.id)

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to delete form question' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Form question deleted successfully'
    })

  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete RSVP form question' }, { status: 500 })
  }
}
