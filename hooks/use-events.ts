import { useState, useEffect } from 'react';
import {
  createEvent,
  updateEvent,
  deleteEvent,
  getEventById,
  getUserEvents
} from '@/lib/events-service';
import { Event, CreateEventData, UpdateEventData } from '@/lib/dashboard-types';
import { useAuth } from '@/components/supabase-auth-provider';

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userProfile } = useAuth();

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      let eventsData: Event[];

      if (userProfile?.role === 'superadmin') {
        // For superadmin, get all events (implement later or use getEventsPaginated)
        eventsData = await getUserEvents(userProfile.id); // Temporary - will need to create getAllEvents
      } else if (userProfile?.role === 'organizer') {
        eventsData = await getUserEvents(userProfile.id);
      } else {
        eventsData = [];
      }

      setEvents(eventsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const addEvent = async (eventData: CreateEventData) => {
    try {
      setError(null);
      const newEvent = await createEvent(eventData, userProfile?.id || '');

      // Refresh events list
      await fetchEvents();

      return newEvent.id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
      throw err;
    }
  };

  const editEvent = async (eventId: string, updates: UpdateEventData) => {
    try {
      setError(null);
      await updateEvent(eventId, updates);

      // Refresh events list
      await fetchEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update event');
      throw err;
    }
  };

  const removeEvent = async (eventId: string) => {
    try {
      setError(null);
      await deleteEvent(eventId);

      // Refresh events list
      await fetchEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
      throw err;
    }
  };

  const getEventById = async (eventId: string) => {
    try {
      setError(null);
      return await getEventById(eventId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch event');
      throw err;
    }
  };

  useEffect(() => {
    if (userProfile) {
      fetchEvents();
    }
  }, [userProfile]);

  return {
    events,
    loading,
    error,
    addEvent,
    editEvent,
    removeEvent,
    getEventById,
    refreshEvents: fetchEvents,
  };
}; 