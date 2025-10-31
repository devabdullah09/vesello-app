"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useEventEdition } from '@/components/event-edition-context';

interface Event {
  id: string;
  title: string;
  coupleNames: string;
  eventDate: string;
  venue: string;
  wwwId: string;
  status: string;
  rsvpEnabled: boolean;
}

export default function ManageGuestsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { selectedEvent: contextEvent, loading: contextLoading } = useEventEdition();

  useEffect(() => {
    if (contextEvent?.wwwId) {
      router.push(`/dashboard/events-edition/rsvp/manage-guests/${contextEvent.wwwId}`);
      return;
    }
    if (!contextLoading) {
      setLoading(false);
    }
  }, [contextEvent, contextLoading, router]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/dashboard/events', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch events');
      }

      const data = await response.json();
      
      // Filter events that have RSVP enabled
      const rsvpEnabledEvents = data.data.data.filter((event: any) => event.rsvpEnabled);
      setEvents(rsvpEnabledEvents);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = (event: Event) => {
    if (!event.wwwId) {
      setError('Event ID is missing. Please try again.');
      return;
    }
    router.push(`/dashboard/events-edition/rsvp/manage-guests/${event.wwwId}`);
  };

  const handleBack = () => {
    router.push('/dashboard/events-edition/rsvp');
  };

  if (loading || contextLoading) {
    return (
      <div className="flex-1 p-12 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading events...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-12 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-lg">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-12 bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-lg mb-4">No event selected</div>
        <button
          onClick={() => router.push('/dashboard/events-edition/select-event')}
          className="bg-[#E5B574] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#D59C58] transition-colors"
        >
          Select Event
        </button>
      </div>
    </div>
  );
}