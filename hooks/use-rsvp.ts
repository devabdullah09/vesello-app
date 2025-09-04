import { useState, useEffect } from 'react';
import {
  submitInvitationRSVP,
  getInvitationRSVPsByEvent
} from '@/lib/supabase-invitation-service';
import { InvitationRSVP, InvitationGuest } from '@/lib/invitation-types';

export const useRSVP = (eventId?: string) => {
  const [rsvpResponses, setRsvpResponses] = useState<InvitationRSVP[]>([]);
  const [guests, setGuests] = useState<InvitationGuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRSVPData = async () => {
    if (!eventId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const responses = await getInvitationRSVPsByEvent(eventId);
      // For now, extract guests from RSVP responses
      const guestsData: InvitationGuest[] = responses.flatMap(rsvp => rsvp.additionalGuests || []);
      
      setRsvpResponses(responses);
      setGuests(guestsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch RSVP data');
    } finally {
      setLoading(false);
    }
  };

  const submitRSVPResponse = async (rsvpData: Omit<InvitationRSVP, 'id' | 'submittedAt' | 'status'>) => {
    try {
      setError(null);
      const responseId = await submitInvitationRSVP(rsvpData);

      // Refresh RSVP data
      await fetchRSVPData();

      return responseId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit RSVP');
      throw err;
    }
  };

  const addGuestToEvent = async (guestData: Omit<InvitationGuest, 'id' | 'createdAt' | 'updatedAt'>) => {
    // TODO: Implement add guest functionality for Supabase
    console.log('addGuestToEvent called with:', guestData);
    setError('Add guest functionality not yet implemented for Supabase');
    throw new Error('Add guest functionality not yet implemented');
  };

  const updateGuestInfo = async (guestId: string, updates: Partial<InvitationGuest>) => {
    // TODO: Implement update guest functionality for Supabase
    console.log('updateGuestInfo called with:', guestId, updates);
    setError('Update guest functionality not yet implemented for Supabase');
    throw new Error('Update guest functionality not yet implemented');
  };

  // Calculate RSVP statistics
  const getRSVPStats = () => {
    const totalRSVPs = rsvpResponses.length;
    let totalGuests = 0;
    let attendingGuests = 0;
    let notAttendingGuests = 0;

    rsvpResponses.forEach(rsvp => {
      const guestNames = [rsvp.mainGuest.name, ...rsvp.additionalGuests.map(g => g.name)];
      totalGuests += guestNames.length;

      // Count attendance for wedding day
      guestNames.forEach(guestName => {
        const attendance = rsvp.weddingDayAttendance[guestName];
        if (attendance === 'will') attendingGuests++;
        else if (attendance === 'cant') notAttendingGuests++;
      });
    });

    return {
      total: totalGuests,
      attending: attendingGuests,
      notAttending: notAttendingGuests,
      pending: totalGuests - attendingGuests - notAttendingGuests,
      maybe: 0, // Not used in current schema
      responseRate: totalGuests > 0 ? ((attendingGuests + notAttendingGuests) / totalGuests) * 100 : 0
    };
  };

  useEffect(() => {
    if (eventId) {
      fetchRSVPData();
    }
  }, [eventId]);

  return {
    rsvpResponses,
    guests,
    loading,
    error,
    submitRSVPResponse,
    addGuestToEvent,
    updateGuestInfo,
    getRSVPStats,
    refreshData: fetchRSVPData,
  };
}; 