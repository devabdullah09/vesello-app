"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

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

  useEffect(() => {
    fetchEvents();
  }, []);

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
      console.error('Error fetching events:', error);
      setError(error instanceof Error ? error.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = (event: Event) => {
    console.log('Selected event:', event); // Debug log
    if (!event.wwwId) {
      console.error('Event wwwId is missing:', event);
      setError('Event ID is missing. Please try again.');
      return;
    }
    router.push(`/dashboard/events-edition/rsvp/manage-guests/${event.wwwId}`);
  };

  const handleBack = () => {
    router.push('/dashboard/events-edition/rsvp');
  };

  if (loading) {
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
    <div className="flex-1 p-12 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-start mb-8">
        <button
          onClick={handleBack}
          className="bg-black text-white px-6 py-2 rounded font-semibold hover:bg-gray-800 transition-colors"
        >
          Back
        </button>
      </div>
      
      <h1 className="text-3xl font-bold text-black mb-8">MANAGE GUEST LISTS</h1>
      
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-semibold text-black mb-6">Select an Event</h2>
        <p className="text-gray-600 mb-6">
          Choose an event to view and manage its guest list and RSVP responses.
        </p>

        {events.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No events with RSVP enabled found.</p>
            <p className="text-gray-500 text-sm mb-6">
              To manage guest lists, you need to enable RSVP functionality for your events first.
            </p>
            <button
              onClick={() => router.push('/dashboard/events-list')}
              className="bg-[#E5B574] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#D59C58] transition-colors"
            >
              Manage Events
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                onClick={() => handleSelectEvent(event)}
                className="border border-gray-200 rounded-lg p-6 hover:border-[#E5B574] hover:shadow-md transition-all cursor-pointer"
              >
                <h3 className="text-lg font-semibold text-black mb-2">{event.title}</h3>
                <p className="text-[#E5B574] font-medium mb-3">{event.coupleNames}</p>
                <p className="text-gray-600 text-sm mb-2">
                  {new Date(event.eventDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                {event.venue && (
                  <p className="text-gray-500 text-sm mb-3">{event.venue}</p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      event.status === 'active' ? 'bg-green-100 text-green-800' :
                      event.status === 'planned' ? 'bg-blue-100 text-blue-800' :
                      event.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </span>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-[#E5B574] text-white">
                      RSVP Enabled
                    </span>
                  </div>
                  <span className="text-[#E5B574] text-sm font-medium">Manage Guests →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}