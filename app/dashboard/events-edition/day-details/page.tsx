"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from '@/components/supabase-auth-provider';
import { useLanguage } from '@/components/language-context';
import supabase from '@/lib/supabase';
import { useEventEdition } from "@/components/event-edition-context";

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

export default function EventsDayDetailsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { selectedEvent, setSelectedEvent } = useEventEdition();
  const [eventDetails, setEventDetails] = useState<EventDayDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedEvent) {
      fetchEventDetails();
    }
  }, [selectedEvent]);

  const fetchEventDetails = async () => {
    if (!selectedEvent?.wwwId) return;
    
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch(`/api/dashboard/events/day-details?wwwId=${selectedEvent.wwwId}`, {
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

  const handleSwitchEvent = () => {
    setSelectedEvent(null);
    router.push("/dashboard/events-edition/select-event");
  };

  const copyToClipboard = async () => {
    if (eventDetails?.eventUrl) {
      try {
        await navigator.clipboard.writeText(eventDetails.eventUrl);
        alert('Link copied to clipboard!');
      } catch (err) {
        // Failed to copy to clipboard
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
      <div className="flex-1 p-4 md:p-8 lg:p-12 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading event details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-4 md:p-8 lg:p-12 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-lg">Error: {error}</div>
      </div>
    );
  }

  if (!selectedEvent || !eventDetails) {
    return (
      <div className="flex-1 p-4 md:p-8 lg:p-12 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg mb-4">No event selected</div>
          <button
            onClick={() => router.push("/dashboard/events-edition/select-event")}
            className="bg-gradient-to-r from-[#E5B574] via-[#D59C58] to-[#C18037] text-white font-semibold px-6 py-3 rounded-md shadow-md hover:from-[#D59C58] hover:to-[#E5B574] transition-colors"
          >
            Select Event
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-8 lg:p-12 bg-gray-100 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
        <button
          onClick={handleBack}
          className="bg-black text-white px-4 md:px-6 py-2 rounded font-semibold hover:bg-gray-800 transition-colors text-sm md:text-base"
        >
          {t.common.back}
        </button>
        <div className="flex gap-3">
          <button
            onClick={handleSwitchEvent}
            className="bg-gray-200 text-black px-4 py-2 rounded font-semibold hover:bg-gray-300 transition-colors text-sm"
          >
            Switch Event
          </button>
          <button 
            onClick={() => router.push(`/dashboard/events-edition/content-editor`)}
            className="bg-gradient-to-r from-[#E5B574] via-[#D59C58] to-[#C18037] text-white font-semibold px-4 md:px-6 py-2 rounded-md shadow-md hover:from-[#D59C58] hover:to-[#E5B574] transition-colors text-sm md:text-base"
          >
            {t.dashboard.editWebsite}
          </button>
        </div>
      </div>
      
      <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-black mb-6 md:mb-8">{t.dashboard.dayDetails}</h1>
      
      {/* Event Info */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl font-semibold text-black mb-4">{t.dashboard.eventOverview}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs md:text-sm text-gray-600">{t.dashboard.eventTitle}</label>
            <p className="text-base md:text-lg font-medium text-black">{eventDetails.title}</p>
          </div>
          <div>
            <label className="text-xs md:text-sm text-gray-600">{t.dashboard.coupleNames}</label>
            <p className="text-base md:text-lg font-medium text-black">{eventDetails.coupleNames}</p>
          </div>
          <div>
            <label className="text-xs md:text-sm text-gray-600">{t.dashboard.eventDate}</label>
            <p className="text-base md:text-lg font-medium text-black">
              {new Date(eventDetails.eventDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <div>
            <label className="text-xs md:text-sm text-gray-600">{t.dashboard.venue}</label>
            <p className="text-base md:text-lg font-medium text-black">{eventDetails.venue || 'Not specified'}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
        {/* Left content - Event Link Section */}
        <div className="flex-1 w-full lg:w-auto">
          <div className="mb-6">
            <p className="text-sm md:text-lg text-gray-700 mb-4">
              {t.dashboard.copyLinkAndInvite}
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
              <div className="text-sm md:text-lg font-bold text-black bg-white p-3 md:p-4 rounded border flex-1 w-full sm:w-auto break-all">
                {eventDetails.eventUrl}
              </div>
              <button
                onClick={copyToClipboard}
                className="bg-[#E5B574] text-white px-4 py-2 rounded font-semibold hover:bg-[#D59C58] transition-colors text-sm md:text-base whitespace-nowrap"
              >
                {t.dashboard.copyLink}
              </button>
            </div>

            <p className="text-xs md:text-sm text-gray-700 mb-4">
              {t.dashboard.downloadQRAndShare}
            </p>

            {/* Feature Status */}
            <div className="bg-white p-4 rounded border">
              <h3 className="font-semibold text-black mb-2 text-sm md:text-base">{t.dashboard.availableFeatures}</h3>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <div className={`px-3 py-1 rounded text-xs md:text-sm ${eventDetails.galleryEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  {t.dashboard.gallery}: {eventDetails.galleryEnabled ? t.dashboard.enabled : t.dashboard.disabled}
                </div>
                <div className={`px-3 py-1 rounded text-xs md:text-sm ${eventDetails.rsvpEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  {t.dashboard.rsvp}: {eventDetails.rsvpEnabled ? t.dashboard.enabled : t.dashboard.disabled}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right content - QR Code Section */}
        <div className="flex flex-col items-center w-full lg:w-auto lg:ml-12">
          <div className="bg-white p-4 rounded shadow-sm">
            {eventDetails.qrCodeDataUrl ? (
              <img 
                src={eventDetails.qrCodeDataUrl} 
                alt="QR Code" 
                className="w-24 h-24 md:w-32 md:h-32"
              />
            ) : (
              <div className="bg-gray-200 w-24 h-24 md:w-32 md:h-32 flex items-center justify-center">
                <div className="text-gray-500 text-xs text-center">
                  QR Code<br />Error
                </div>
              </div>
            )}
          </div>
          <div className="text-center mt-4">
            <button 
              onClick={downloadQRCode}
              className="text-[#E5B574] font-semibold hover:underline text-sm md:text-base"
            >
              {t.dashboard.downloadQR}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
