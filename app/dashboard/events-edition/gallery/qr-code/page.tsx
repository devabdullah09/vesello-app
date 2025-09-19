"use client";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface GalleryQRData {
  eventId: string;
  wwwId: string;
  title: string;
  coupleNames: string;
  eventDate: string;
  venue?: string;
  galleryUrl: string;
  qrCodeDataUrl: string;
  galleryEnabled: boolean;
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

export default function QRCodeLinkPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [galleryData, setGalleryData] = useState<GalleryQRData | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const wwwId = searchParams.get('wwwId');

  useEffect(() => {
    if (!wwwId) {
      fetchEvents();
    } else {
      fetchGalleryQR();
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
      // Filter events to only show those with gallery enabled
      const allEvents = result.data.data || [];
      const galleryEnabledEvents = allEvents.filter((event: Event) => event.galleryEnabled);
      setEvents(galleryEnabledEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const fetchGalleryQR = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Please log in to access this feature");
        return;
      }

      const response = await fetch(`/api/dashboard/events/gallery-qr?wwwId=${encodeURIComponent(wwwId)}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch gallery QR code');
      }

      const result = await response.json();
      setGalleryData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch gallery QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push("/dashboard/events-edition/gallery");
  };

  const handleEventSelect = (selectedWwwId: string) => {
    router.push(`/dashboard/events-edition/gallery/qr-code?wwwId=${selectedWwwId}`);
  };

  const downloadQRCode = () => {
    if (!galleryData?.qrCodeDataUrl) return;

    const link = document.createElement('a');
    link.href = galleryData.qrCodeDataUrl;
    link.download = `gallery-qr-${galleryData.wwwId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyLink = () => {
    if (!galleryData?.galleryUrl) return;
    navigator.clipboard.writeText(galleryData.galleryUrl);
    // You could add a toast notification here
  };

  if (loading) {
    return (
      <div className="flex-1 p-12 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading gallery details...</div>
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
        
        <h1 className="text-3xl font-bold text-black mb-8">GALLERY QR CODE/LINK MANAGEMENT</h1>
        
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
              Choose an event to generate its gallery QR code and link for sharing with guests.
            </p>
            
            {events.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No events with gallery enabled found.</p>
                <p className="text-gray-500 text-sm mb-6">
                  To generate gallery QR codes, you need to enable the gallery feature for your events first.
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
                          Gallery Enabled
                        </span>
                      </div>
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

  if (!galleryData) {
    return (
      <div className="flex-1 p-12 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-lg">No gallery details found</div>
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
      
      <h1 className="text-3xl font-bold text-black mb-8">GALLERY QR CODE/LINK</h1>
      
      {/* Event Info */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-xl font-semibold text-black mb-4">Event Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">Event Title</label>
            <p className="text-lg font-medium text-black">{galleryData.title}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Couple Names</label>
            <p className="text-lg font-medium text-black">{galleryData.coupleNames}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Event Date</label>
            <p className="text-lg font-medium text-black">
              {new Date(galleryData.eventDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Venue</label>
            <p className="text-lg font-medium text-black">{galleryData.venue || 'Not specified'}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-start">
        {/* Left content - Gallery Link Section */}
        <div className="flex-1">
          <div className="mb-6">
            <p className="text-lg text-gray-700 mb-4">
              Copy the link and invite guests to your event gallery
            </p>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-2xl font-bold text-black bg-white p-4 rounded border flex-1">
                {galleryData.galleryUrl}
              </div>
              <button
                onClick={copyLink}
                className="bg-[#E5B574] text-white px-4 py-2 rounded font-semibold hover:bg-[#D59C58] transition-colors"
              >
                Copy Link
              </button>
            </div>

            <p className="text-sm text-gray-700 mb-4">
              Download the QR code and share the event's gallery page with your guests:
            </p>

            {/* Gallery Status */}
            <div className="bg-white p-4 rounded border">
              <h3 className="font-semibold text-black mb-2">Gallery Status</h3>
              <div className="flex gap-4">
                <div className={`px-3 py-1 rounded text-sm ${galleryData.galleryEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  Gallery: {galleryData.galleryEnabled ? 'Enabled' : 'Disabled'}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right content - QR Code Section */}
        <div className="flex flex-col items-center ml-12">
          <div className="bg-white p-4 rounded shadow-sm">
            {galleryData.qrCodeDataUrl ? (
              <img 
                src={galleryData.qrCodeDataUrl} 
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