"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface GalleryImage {
  id: string;
  url: string;
  caption?: string;
  uploadedAt: string;
}

interface EventData {
  id: string;
  wwwId: string;
  title: string;
  coupleNames: string;
  eventDate: string;
}

export default function EventGalleryPage() {
  const params = useParams();
  const wwwId = params.wwwId as string;
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!wwwId) {
      setError('Invalid event link');
      setLoading(false);
      return;
    }

    fetchEventData();
    fetchGalleryImages();
  }, [wwwId]);

  const fetchEventData = async () => {
    try {
      const response = await fetch(`/api/event-id/${wwwId}`);
      
      if (!response.ok) {
        throw new Error('Event not found');
      }

      const result = await response.json();
      setEventData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load event');
    }
  };

  const fetchGalleryImages = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/event-id/${wwwId}/gallery`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setImages([]);
          return;
        }
        throw new Error('Failed to load gallery');
      }

      const result = await response.json();
      setImages(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8F5F0] to-[#E8DCC6] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E5B574] mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Loading gallery...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8F5F0] to-[#E8DCC6] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Gallery Not Available</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            href={`/event-id/${wwwId}`}
            className="bg-[#E5B574] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#D59C58] transition-colors"
          >
            Back to Event
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F5F0] to-[#E8DCC6]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href={`/event-id/${wwwId}`} className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <Image
                src="/images/logo.png"
                alt="Vasello"
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="text-xl font-bold text-gray-800">Vasello</span>
            </Link>
            <div className="flex items-center space-x-6">
              <Link href={`/event-id/${wwwId}`} className="text-gray-600 hover:text-[#E5B574] transition-colors">
                Home
              </Link>
              <span className="text-[#E5B574] font-medium">Gallery</span>
              {eventData && (
                <Link href={`/event-id/${wwwId}/rsvp`} className="text-gray-600 hover:text-[#E5B574] transition-colors">
                  Reply to Invitation
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Gallery Header */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Photo Gallery</h1>
          <p className="text-xl text-[#E5B574] mb-6">{eventData?.coupleNames}</p>
          <p className="text-gray-600">Share your memories from this special day</p>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          {images.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 text-6xl mb-4">📸</div>
              <h2 className="text-2xl font-bold text-gray-700 mb-2">No Photos Yet</h2>
              <p className="text-gray-600 mb-6">
                Photos will appear here once they're uploaded by the event organizers.
              </p>
              <Link 
                href={`/event-id/${wwwId}`}
                className="bg-[#E5B574] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#D59C58] transition-colors"
              >
                Back to Event
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {images.map((image) => (
                <div key={image.id} className="group relative bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square relative">
                    <Image
                      src={image.url}
                      alt={image.caption || 'Gallery image'}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  {image.caption && (
                    <div className="p-3">
                      <p className="text-sm text-gray-600">{image.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/30">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-600">
            Powered by <span className="font-semibold text-[#E5B574]">Vasello</span> - Wedding Event Management
          </p>
        </div>
      </footer>
    </div>
  );
}
