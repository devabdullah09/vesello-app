"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface EventData {
  id: string;
  wwwId: string;
  title: string;
  coupleNames: string;
  eventDate: string;
  venue?: string;
  galleryEnabled: boolean;
  status: string;
}

interface GalleryImage {
  id: string;
  url: string;
  caption?: string;
  uploadedAt: string;
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

  if (error || !eventData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8F5F0] to-[#E8DCC6] flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-700 mb-4">Gallery Not Available</div>
          <div className="text-gray-500 mb-6">{error || 'Event not found'}</div>
          <Link 
            href="/"
            className="bg-gradient-to-r from-[#E5B574] to-[#C18037] text-white font-semibold rounded-md px-8 py-2 shadow hover:opacity-90 transition"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (!eventData.galleryEnabled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8F5F0] to-[#E8DCC6] flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-700 mb-4">Gallery Not Enabled</div>
          <div className="text-gray-500 mb-6">Gallery is not available for this event.</div>
          <Link 
            href="/"
            className="bg-gradient-to-r from-[#E5B574] to-[#C18037] text-white font-semibold rounded-md px-8 py-2 shadow hover:opacity-90 transition"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F5F0] to-[#E8DCC6] py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-base md:text-lg mb-2" style={{ fontFamily: 'Montserrat', fontWeight: 400 }}>
            Welcome To
          </div>
          <div className="text-4xl md:text-5xl font-sail mb-2" style={{ fontWeight: 400, letterSpacing: '0.5px', lineHeight: 1.1 }}>
            {eventData.coupleNames}
          </div>
          <div className="text-2xl md:text-3xl font-sail mb-4" style={{ 
            background: 'linear-gradient(90deg, #E5B574 0%, #C18037 100%)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent', 
            fontWeight: 400, 
            letterSpacing: '0.5px', 
            lineHeight: 1.1 
          }}>
            {eventData.title || 'Wedding'}
          </div>
          {eventData.eventDate && (
            <div className="text-lg text-gray-600 mb-2">
              {new Date(eventData.eventDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          )}
          {eventData.venue && (
            <div className="text-base text-gray-500">
              {eventData.venue}
            </div>
          )}
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-2xl border border-[#C7B299] p-8 mb-8 shadow-md">
          <div className="text-center">
            <Link 
              href={`/gallery/${wwwId}/upload`} 
              className="inline-flex flex-col items-center border border-[#E5B574] rounded-md py-10 px-8 bg-white hover:shadow-lg transition cursor-pointer min-h-[180px]"
            >
              <Image src="/images/Gallery/photo_icon.png" alt="Add Photos" width={50} height={50} className="mb-3" />
              <div className="text-base text-[#08080A] mt-2" style={{ fontFamily: 'Montserrat', fontWeight: 500 }}>
                Add Your Photos & Videos Now
              </div>
            </Link>
          </div>
        </div>

        {/* Gallery Images */}
        {images.length > 0 ? (
          <div className="bg-white rounded-2xl border border-[#C7B299] p-8 shadow-md">
            <h2 className="text-2xl font-bold text-center mb-8" style={{ fontFamily: 'Montserrat' }}>
              Event Gallery
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {images.map((image) => (
                <div key={image.id} className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <Image
                    src={image.url}
                    alt={image.caption || 'Gallery image'}
                    width={300}
                    height={300}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {image.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-3">
                      <p className="text-sm">{image.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#C7B299] p-8 shadow-md text-center">
            <div className="text-lg text-gray-600 mb-4">No photos yet</div>
            <div className="text-gray-500">Be the first to share memories from this event!</div>
          </div>
        )}

        {/* Mission Statement */}
        <div className="bg-white rounded-2xl border border-[#C7B299] p-8 mt-8 shadow-md">
          <div className="text-center text-[#08080A] max-w-2xl mx-auto" style={{ fontFamily: 'Montserrat', fontWeight: 400, fontSize: '1rem', lineHeight: 1.6 }}>
            <div className="mb-2">Dear Guests - We Have An Important Mission For You:</div>
            <div className="font-bold mb-2">Like, Follow, And Tag The Amazing Team Behind Today's Magic.</div>
            <div className="mb-2">Every Click Is A Like A Loud 'Thank You!' To Them!</div>
            <div className="mb-2">Our Goal: <span className="font-bold">50 New Followers!</span></div>
            <div>Because Good Energy Always Comes Back!</div>
          </div>
        </div>
      </div>
    </div>
  );
}
