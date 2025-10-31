"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useEventEdition } from "@/components/event-edition-context";

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

export default function QRCodeLinkPage() {
  const router = useRouter();
  const { selectedEvent, setSelectedEvent } = useEventEdition();
  const [galleryData, setGalleryData] = useState<GalleryQRData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedEvent) {
      fetchGalleryQR();
    }
  }, [selectedEvent]);

  const fetchGalleryQR = async () => {
    if (!selectedEvent?.wwwId) return;

    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Please log in to access this feature");
        return;
      }

      const response = await fetch(`/api/dashboard/events/gallery-qr?wwwId=${encodeURIComponent(selectedEvent.wwwId)}`, {
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

  const handleSwitchEvent = () => {
    setSelectedEvent(null);
    router.push("/dashboard/events-edition/select-event");
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
      <div className="flex-1 p-4 md:p-8 lg:p-12 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading gallery details...</div>
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

  if (!selectedEvent) {
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

  if (!galleryData) {
    return (
      <div className="flex-1 p-4 md:p-8 lg:p-12 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-lg">No gallery details found</div>
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
          Back
        </button>
        <button
          onClick={handleSwitchEvent}
          className="bg-gray-200 text-black px-4 py-2 rounded font-semibold hover:bg-gray-300 transition-colors text-sm"
        >
          Switch Event
        </button>
      </div>
      
      <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-black mb-6 md:mb-8">GALLERY QR CODE/LINK</h1>
      
      {/* Event Info */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl font-semibold text-black mb-4">Event Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs md:text-sm text-gray-600">Event Title</label>
            <p className="text-base md:text-lg font-medium text-black">{galleryData.title}</p>
          </div>
          <div>
            <label className="text-xs md:text-sm text-gray-600">Couple Names</label>
            <p className="text-base md:text-lg font-medium text-black">{galleryData.coupleNames}</p>
          </div>
          <div>
            <label className="text-xs md:text-sm text-gray-600">Event Date</label>
            <p className="text-base md:text-lg font-medium text-black">
              {new Date(galleryData.eventDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <div>
            <label className="text-xs md:text-sm text-gray-600">Venue</label>
            <p className="text-base md:text-lg font-medium text-black">{galleryData.venue || 'Not specified'}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
        {/* Left content - Gallery Link Section */}
        <div className="flex-1 w-full lg:w-auto">
          <div className="mb-6">
            <p className="text-sm md:text-lg text-gray-700 mb-4">
              Copy the link and invite guests to your event gallery
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
              <div className="text-sm md:text-lg font-bold text-black bg-white p-3 md:p-4 rounded border flex-1 w-full sm:w-auto break-all">
                {galleryData.galleryUrl}
              </div>
              <button
                onClick={copyLink}
                className="bg-[#E5B574] text-white px-4 py-2 rounded font-semibold hover:bg-[#D59C58] transition-colors text-sm md:text-base whitespace-nowrap"
              >
                Copy Link
              </button>
            </div>

            <p className="text-xs md:text-sm text-gray-700 mb-4">
              Download the QR code and share the event's gallery page with your guests:
            </p>

            {/* Gallery Status */}
            <div className="bg-white p-4 rounded border">
              <h3 className="font-semibold text-black mb-2 text-sm md:text-base">Gallery Status</h3>
              <div className="flex gap-2 md:gap-4">
                <div className={`px-3 py-1 rounded text-xs md:text-sm ${galleryData.galleryEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  Gallery: {galleryData.galleryEnabled ? 'Enabled' : 'Disabled'}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right content - QR Code Section */}
        <div className="flex flex-col items-center w-full lg:w-auto lg:ml-12">
          <div className="bg-white p-4 rounded shadow-sm">
            {galleryData.qrCodeDataUrl ? (
              <img 
                src={galleryData.qrCodeDataUrl} 
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
              Download QR Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 