import { createServerClient } from './supabase'
import { InvitationRSVP, InvitationGuest } from './invitation-types'

// Submit a complete RSVP response
export const submitInvitationRSVP = async (rsvpData: Omit<InvitationRSVP, 'id' | 'submittedAt' | 'status'>): Promise<string> => {
  try {
    console.log('=== SUPABASE RSVP SUBMISSION DEBUG ===')
    console.log('submitInvitationRSVP called with data:', JSON.stringify(rsvpData, null, 2))
    
    const rsvpWithMetadata = {
      event_id: rsvpData.eventId,
      main_guest: rsvpData.mainGuest,
      additional_guests: rsvpData.additionalGuests,
      wedding_day_attendance: rsvpData.weddingDayAttendance,
      after_party_attendance: rsvpData.afterPartyAttendance,
      food_preferences: rsvpData.foodPreferences,
      accommodation_needed: rsvpData.accommodationNeeded,
      transportation_needed: rsvpData.transportationNeeded,
      notes: rsvpData.notes,
      custom_responses: rsvpData.customResponses,
      email: rsvpData.email,
      send_email_confirmation: rsvpData.sendEmailConfirmation,
      submitted_at: new Date().toISOString(),
      status: 'pending' as const
    }
    
    console.log('RSVP data with metadata:', JSON.stringify(rsvpWithMetadata, null, 2))
    console.log('About to insert into invitation_rsvps table...')
    
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('invitation_rsvps')
      .insert([rsvpWithMetadata])
      .select()
      .single()

    if (error) {
      console.error('SUPABASE INSERT ERROR:', error)
      throw error
    }
    
    console.log('✅ Document added successfully with ID:', data.id)
    console.log('=== END SUPABASE RSVP SUBMISSION DEBUG ===')
    return data.id
  } catch (error) {
    console.error('❌ Error in submitInvitationRSVP:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown error type'
    })
    console.log('=== END SUPABASE RSVP SUBMISSION DEBUG ===')
    throw error
  }
}

// Get RSVP by ID
export const getInvitationRSVP = async (rsvpId: string): Promise<InvitationRSVP | null> => {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('invitation_rsvps')
      .select('*')
      .eq('id', rsvpId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null
      }
      throw error
    }

    return {
      id: data.id,
      eventId: data.event_id,
      mainGuest: data.main_guest,
      additionalGuests: data.additional_guests,
      weddingDayAttendance: data.wedding_day_attendance,
      afterPartyAttendance: data.after_party_attendance,
      foodPreferences: data.food_preferences,
      accommodationNeeded: data.accommodation_needed,
      transportationNeeded: data.transportation_needed,
      notes: data.notes,
      email: data.email,
      sendEmailConfirmation: data.send_email_confirmation,
      submittedAt: new Date(data.submitted_at),
      status: data.status
    } as InvitationRSVP
  } catch (error) {
    console.error('Error getting RSVP:', error)
    throw error
  }
}

// Get all RSVPs for an event
export const getInvitationRSVPsByEvent = async (eventId: string): Promise<InvitationRSVP[]> => {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('invitation_rsvps')
      .select('*')
      .eq('event_id', eventId)
      .order('submitted_at', { ascending: false })

    if (error) throw error

    return data.map(item => ({
      id: item.id,
      eventId: item.event_id,
      mainGuest: item.main_guest,
      additionalGuests: item.additional_guests,
      weddingDayAttendance: item.wedding_day_attendance,
      afterPartyAttendance: item.after_party_attendance,
      foodPreferences: item.food_preferences,
      accommodationNeeded: item.accommodation_needed,
      transportationNeeded: item.transportation_needed,
      notes: item.notes,
      email: item.email,
      sendEmailConfirmation: item.send_email_confirmation,
      submittedAt: new Date(item.submitted_at),
      status: item.status
    })) as InvitationRSVP[]
  } catch (error) {
    console.error('Error getting RSVPs by event:', error)
    throw error
  }
}

// Update RSVP status
export const updateInvitationRSVPStatus = async (rsvpId: string, status: 'pending' | 'confirmed' | 'cancelled'): Promise<void> => {
  try {
    const supabase = createServerClient()
    const { error } = await supabase
      .from('invitation_rsvps')
      .update({ status })
      .eq('id', rsvpId)

    if (error) throw error
  } catch (error) {
    console.error('Error updating RSVP status:', error)
    throw error
  }
}

// Get RSVP statistics for an event
export const getInvitationRSVPStats = async (eventId: string) => {
  try {
    const rsvps = await getInvitationRSVPsByEvent(eventId)
    
    const stats = {
      total: rsvps.length,
      confirmed: 0,
      pending: 0,
      cancelled: 0,
      totalGuests: 0,
      weddingDayAttending: 0,
      afterPartyAttending: 0,
      dietaryPreferences: {
        Regular: 0,
        Vegetarian: 0,
        Vegan: 0
      },
      accommodationNeeded: 0,
      transportationNeeded: 0
    }

    rsvps.forEach(rsvp => {
      // Count by status
      stats[rsvp.status]++
      
      // Count total guests
      const totalGuests = 1 + rsvp.additionalGuests.length
      stats.totalGuests += totalGuests
      
      // Count attendance
      Object.values(rsvp.weddingDayAttendance).forEach(attendance => {
        if (attendance === 'will') stats.weddingDayAttending++
      })
      
      Object.values(rsvp.afterPartyAttendance).forEach(attendance => {
        if (attendance === 'will') stats.afterPartyAttending++
      })
      
      // Count dietary preferences
      Object.values(rsvp.foodPreferences).forEach(preference => {
        if (preference in stats.dietaryPreferences) {
          stats.dietaryPreferences[preference as keyof typeof stats.dietaryPreferences]++
        }
      })
      
      // Count accommodation and transportation needs
      Object.values(rsvp.accommodationNeeded).forEach(needed => {
        if (needed === 'Yes') stats.accommodationNeeded++
      })
      
      Object.values(rsvp.transportationNeeded).forEach(needed => {
        if (needed === 'Yes') stats.transportationNeeded++
      })
    })

    return stats
  } catch (error) {
    console.error('Error getting RSVP stats:', error)
    throw error
  }
}

// Helper function to get all guest names from an RSVP
export const getAllGuestNames = (rsvp: InvitationRSVP): string[] => {
  const names = [rsvp.mainGuest.name]
  rsvp.additionalGuests.forEach(guest => {
    names.push(guest.name)
  })
  return names
}

// Helper function to get guest by name
export const getGuestByName = (rsvp: InvitationRSVP, guestName: string): InvitationGuest | null => {
  if (rsvp.mainGuest.name === guestName) {
    return rsvp.mainGuest
  }
  
  const additionalGuest = rsvp.additionalGuests.find(guest => guest.name === guestName)
  return additionalGuest || null
}

