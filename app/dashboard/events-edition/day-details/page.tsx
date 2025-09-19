"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from '@/components/supabase-auth-provider';
import supabase from '@/lib/supabase';

interface EventDayDetails {
  eventId: string;
  wwwId: string;
  title: string;
  coupleNames: string;
  eventDate: string;
  venue?: string;
  eventUrl: string;
  qrCodeDataUrl: string;
  galleryEnabled: boolean;
  rsvpEnabled: boolean;
  status: string;
}

interface Event {
  id: string;
  wwwId: string;
  title: string;
  coupleNames: string;
  eventDate: string;
  venue?: string;
  status: string;
}

export default function EventsDayDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [eventDetails, setEventDetails] = useState<EventDayDetails | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const wwwId = searchParams.get('wwwId');

  useEffect(() => {
    if (!wwwId) {
      fetchEvents();
    } else {
      fetchEventDetails();
    }
  }, [wwwId]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Not authenticated');
        return;
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

      const result = await response.json();
      setEvents(result.data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch(`/api/dashboard/events/day-details?wwwId=${wwwId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch event details');
      }

      const result = await response.json();
      setEventDetails(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch event details');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push("/dashboard/events-edition");
  };

  const handleEventSelect = (selectedWwwId: string) => {
    router.push(`/dashboard/events-edition/day-details?wwwId=${selectedWwwId}`);
  };

  const copyToClipboard = async () => {
    if (eventDetails?.eventUrl) {
      try {
        await navigator.clipboard.writeText(eventDetails.eventUrl);
        // You could add a toast notification here
        alert('Link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
      }
    }
  };

  const downloadQRCode = () => {
    if (eventDetails?.qrCodeDataUrl) {
      const link = document.createElement('a');
      link.href = eventDetails.qrCodeDataUrl;
      link.download = `qr-code-${eventDetails.wwwId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-12 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading event details...</div>
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

  // Show event selection interface when no wwwId is provided
  if (!wwwId) {
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
        
        <h1 className="text-3xl font-bold text-black mb-8">EVENT'S DAY DETAILS MANAGEMENT</h1>
        
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-lg">Loading events...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-red-600 text-lg">Error: {error}</div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-black mb-6">Select an Event</h2>
            <p className="text-gray-600 mb-6">
              Choose an event to generate its public link and QR code for sharing with guests.
            </p>
            
            {events.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No events found.</p>
                <button
                  onClick={() => router.push('/dashboard/events-list')}
                  className="bg-[#E5B574] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#D59C58] transition-colors"
                >
                  Create Your First Event
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => handleEventSelect(event.wwwId)}
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
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        event.status === 'active' ? 'bg-green-100 text-green-800' :
                        event.status === 'planned' ? 'bg-blue-100 text-blue-800' :
                        event.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </span>
                      <span className="text-[#E5B574] text-sm font-medium">Select →</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  if (!eventDetails) {
    return (
      <div className="flex-1 p-12 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-lg">No event details found</div>
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
        <div className="flex flex-col items-end space-y-2">
          <button 
            onClick={() => router.push(`/dashboard/events-edition/content-editor?wwwId=${eventDetails.wwwId}`)}
            className="bg-gradient-to-r from-[#E5B574] via-[#D59C58] to-[#C18037] text-white font-semibold px-6 py-2 rounded-md shadow-md hover:from-[#D59C58] hover:to-[#E5B574] transition-colors"
          >
            Edit Website
          </button>
          <span className="text-sm text-black">*required</span>
        </div>
      </div>
      
      <h1 className="text-3xl font-bold text-black mb-8">EVENT'S DAY DETAILS MANAGEMENT</h1>
      
      {/* Event Info */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-xl font-semibold text-black mb-4">Event Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">Event Title</label>
            <p className="text-lg font-medium text-black">{eventDetails.title}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Couple Names</label>
            <p className="text-lg font-medium text-black">{eventDetails.coupleNames}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Event Date</label>
            <p className="text-lg font-medium text-black">
              {new Date(eventDetails.eventDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Venue</label>
            <p className="text-lg font-medium text-black">{eventDetails.venue || 'Not specified'}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-start">
        {/* Left content - Event Link Section */}
        <div className="flex-1">
          <div className="mb-6">
            <p className="text-lg text-gray-700 mb-4">
              Copy the link and invite guests to your event details page
            </p>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-2xl font-bold text-black bg-white p-4 rounded border flex-1">
                {eventDetails.eventUrl}
              </div>
              <button
                onClick={copyToClipboard}
                className="bg-[#E5B574] text-white px-4 py-2 rounded font-semibold hover:bg-[#D59C58] transition-colors"
              >
                Copy Link
              </button>
            </div>

            <p className="text-sm text-gray-700 mb-4">
              Download the QR code and share the event's main page with your guests:
            </p>

            {/* Feature Status */}
            <div className="bg-white p-4 rounded border">
              <h3 className="font-semibold text-black mb-2">Available Features</h3>
              <div className="flex gap-4">
                <div className={`px-3 py-1 rounded text-sm ${eventDetails.galleryEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  Gallery: {eventDetails.galleryEnabled ? 'Enabled' : 'Disabled'}
                </div>
                <div className={`px-3 py-1 rounded text-sm ${eventDetails.rsvpEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  RSVP: {eventDetails.rsvpEnabled ? 'Enabled' : 'Disabled'}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right content - QR Code Section */}
        <div className="flex flex-col items-center ml-12">
          <div className="bg-white p-4 rounded shadow-sm">
            {eventDetails.qrCodeDataUrl ? (
              <img 
                src={eventDetails.qrCodeDataUrl} 
                alt="QR Code" 
                className="w-32 h-32"
              />
            ) : (
              <div className="bg-gray-200 w-32 h-32 flex items-center justify-center">
                <div className="text-gray-500 text-xs text-center">
                  QR Code<br />Error
                </div>
              </div>
            )}
          </div>
          <div className="text-left mt-4">
            <button 
              onClick={downloadQRCode}
              className="text-[#E5B574] font-semibold hover:underline"
            >
              Download QR Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 