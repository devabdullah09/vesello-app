"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from '@/components/supabase-auth-provider';
import { useEventEdition } from '@/components/event-edition-context';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/components/language-context';

interface Event {
  id: string;
  wwwId: string;
  title: string;
  coupleNames: string;
  eventDate: string;
  venue?: string;
  status: string;
  galleryEnabled: boolean;
  rsvpEnabled: boolean;
}

export default function SelectEventPage() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const { setSelectedEvent } = useEventEdition();
  const { t } = useLanguage();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && userProfile) {
      fetchEvents();
    }
  }, [user, userProfile]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Not authenticated');
        return;
      }

      // For organizers, fetch their assigned events
      if (userProfile?.role === 'organizer') {
        const response = await fetch('/api/dashboard/organizer/event', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }

        const result = await response.json();
        if (result.success && result.data) {
          const eventsArray = Array.isArray(result.data) ? result.data : [result.data];
          setEvents(eventsArray);
        }
      } else {
        // For superadmin, fetch all events
        const response = await fetch('/api/dashboard/events', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }

        const result = await response.json();
        setEvents(result.data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleEventSelect = async (event: Event) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      // Load full event details
      const response = await fetch(`/api/dashboard/events/day-details?wwwId=${event.wwwId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.data) {
          const eventData = {
            id: result.data.eventId,
            wwwId: result.data.wwwId,
            title: result.data.title,
            coupleNames: result.data.coupleNames,
            eventDate: result.data.eventDate,
            venue: result.data.venue,
            status: result.data.status,
            galleryEnabled: result.data.galleryEnabled,
            rsvpEnabled: result.data.rsvpEnabled,
            eventUrl: result.data.eventUrl
          };
          
          setSelectedEvent(eventData);
          router.push('/dashboard/events-edition');
        }
      }
    } catch (err) {
      console.error('Error selecting event:', err);
    }
  };

  const handleBack = () => {
    router.push('/dashboard');
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
      
      <h1 className="text-3xl font-bold text-black mb-10">SELECT EVENT TO MANAGE</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-600 text-lg mb-4">No events found.</p>
            <button
              onClick={() => router.push('/dashboard/events-list')}
              className="bg-gradient-to-r from-[#E5B574] via-[#D59C58] to-[#C18037] text-white font-semibold px-6 py-3 rounded-md shadow-md hover:from-[#D59C58] hover:to-[#E5B574] transition-colors"
            >
              Create Your First Event
            </button>
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              onClick={() => handleEventSelect(event)}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer hover:border-[#E5B574]"
            >
              <div className="text-xl font-bold text-black mb-4">
                {event.title}
              </div>
              <div className="text-gray-600 mb-2">
                <strong>Couple:</strong> {event.coupleNames}
              </div>
              <div className="text-gray-600 mb-2">
                <strong>Date:</strong> {new Date(event.eventDate).toLocaleDateString()}
              </div>
              {event.venue && (
                <div className="text-gray-600 mb-2">
                  <strong>Venue:</strong> {event.venue}
                </div>
              )}
              <div className="text-gray-600 mb-4">
                <strong>Event ID:</strong> {event.wwwId}
              </div>
              <div className="flex items-center gap-4 mb-4">
                <span className={`px-2 py-1 rounded text-sm ${
                  event.galleryEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {event.galleryEnabled ? 'Gallery' : 'No Gallery'}
                </span>
                <span className={`px-2 py-1 rounded text-sm ${
                  event.rsvpEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {event.rsvpEnabled ? 'RSVP' : 'No RSVP'}
                </span>
              </div>
              <div className="text-center">
                <span className="text-[#E5B574] font-semibold">Select to Manage →</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

