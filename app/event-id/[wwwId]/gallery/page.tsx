"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import EventHeader from '@/components/layout/EventHeader';
import { fetchGalleryContent, GalleryContent, defaultGalleryContent } from '@/lib/gallery-content';

function isAdmin() {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('admin') === '1';
}

export default function DynamicGalleryPage() {
  const params = useParams();
  const wwwId = params?.wwwId as string;
  const [visible, setVisible] = useState(true);
  const [admin, setAdmin] = useState(false);
  const [eventData, setEventData] = useState<{coupleNames: string, galleryEnabled: boolean, rsvpEnabled: boolean} | null>(null);
  const [galleryContent, setGalleryContent] = useState<GalleryContent>(defaultGalleryContent);

  // On mount, check admin and load toggle state
  useEffect(() => {
    setAdmin(isAdmin());
    const stored = localStorage.getItem(`gallery_visible_${wwwId}`);
    setVisible(stored === null ? true : stored === 'true');
    
    // Fetch event data
    if (wwwId) {
      fetchEventData();
    }
  }, [wwwId]);

  const fetchEventData = async () => {
    try {
      const response = await fetch(`/api/event-id/${wwwId}/gallery-content`);
      if (response.ok) {
        const result = await response.json();
        setEventData({
          coupleNames: result.eventData.coupleNames,
          galleryEnabled: result.eventData.galleryEnabled,
          rsvpEnabled: result.eventData.rsvpEnabled
        });
        
        // Set gallery content (custom or default)
        if (result.data) {
          setGalleryContent({ ...defaultGalleryContent, ...result.data });
        } else {
          setGalleryContent({ 
            ...defaultGalleryContent, 
            coupleNames: result.eventData.coupleNames 
          });
        }
      }
    } catch (error) {
      console.error('Error fetching event data:', error);
    }
  };

  // When visible changes, persist to localStorage
  useEffect(() => {
    if (wwwId) {
      localStorage.setItem(`gallery_visible_${wwwId}`, visible ? 'true' : 'false');
    }
  }, [visible, wwwId]);

  return (
    <>
      <EventHeader 
        eventId={wwwId}
        galleryEnabled={eventData?.galleryEnabled || false}
        rsvpEnabled={eventData?.rsvpEnabled || false}
        currentPage="gallery"
      />
      <div className="min-h-screen flex flex-col items-center justify-center bg-white py-10 px-2 md:px-0 relative overflow-x-hidden pt-20" style={{ fontFamily: 'Montserrat, Arial, Helvetica, sans-serif' }}>
      <div className="relative w-full max-w-3xl bg-white rounded-2xl border border-[#C7B299] p-8 md:p-16 shadow-md mx-auto z-10" style={{ minHeight: 700 }}>
        {/* Admin Toggle */}
        {admin && (
          <div className="flex items-center mb-6 justify-end">
            <span className="mr-3 font-semibold text-black">On and Off</span>
            <button
              className={`w-14 h-8 flex items-center bg-gray-200 rounded-full p-1 transition-colors duration-300 focus:outline-none ${visible ? 'bg-green-400' : 'bg-gray-400'}`}
              onClick={() => setVisible(v => !v)}
              title="You can on and off this section on website."
            >
              <span
                className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${visible ? 'translate-x-6' : ''}`}
              />
            </button>
            <span className="ml-3 text-sm text-gray-600">You can on and off this section on website.</span>
          </div>
        )}
        {/* Content or Unavailable */}
        {(galleryContent.visible && visible) || admin ? (
          <div className="flex flex-col items-center justify-center relative z-10">
            <div className="text-center mt-2 mb-8">
              <div className="text-base md:text-lg" style={{ fontFamily: 'Montserrat', fontWeight: 400 }}>{galleryContent.welcomeText}</div>
              <div className="text-4xl md:text-5xl font-sail" style={{ fontWeight: 400, marginTop: 4, marginBottom: 0, letterSpacing: '0.5px', lineHeight: 1.1 }}>
                {galleryContent.coupleNames || eventData?.coupleNames || 'Loading...'}
              </div>
              <div className="text-2xl md:text-3xl font-sail" style={{ background: 'linear-gradient(90deg, #E5B574 0%, #C18037 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginTop: -8, fontWeight: 400, letterSpacing: '0.5px', lineHeight: 1.1 }}>
                Wedding
              </div>
            </div>

            {/* Upload Box */}
            <Link href={`/event-id/${wwwId}/gallery/upload`} className="w-200 border border-[#E5B574] rounded-md py-10 px-4 flex flex-col items-center mb-8 bg-white hover:shadow-lg transition cursor-pointer" style={{ minHeight: 180, textDecoration: 'none' }}>
              <Image src="/images/Gallery/photo_icon.png" alt="Add Photos" width={50} height={50} className="mb-3" />
              <div className="text-base text-[#08080A] mt-2" style={{ fontFamily: 'Montserrat', fontWeight: 500 }}>
                {galleryContent.uploadButtonText}
              </div>
            </Link>

            {/* View Gallery Button */}
            <Link href={`/event-id/${wwwId}/gallery/main`}>
              <button className="bg-gradient-to-r from-[#E5B574] to-[#C18037] text-white font-semibold rounded-md px-8 py-2 mb-10 shadow hover:opacity-90 transition" 
               style={{ fontFamily: 'Montserrat', fontWeight: 600, fontSize: '1rem', minWidth: 160 }}>
                {galleryContent.viewGalleryButtonText}
              </button>
            </Link>

            {/* Mission Statement */}
            <div className="text-center text-[#08080A] mb-10 max-w-xl mx-auto" style={{ fontFamily: 'Montserrat', fontWeight: 400, fontSize: '1rem', lineHeight: 1.6 }}>
              <div className="mb-2">{galleryContent.missionTitle}</div>
              <div className="mb-2">{galleryContent.missionText}</div>
              <div className="mb-2"><span className="font-bold">{galleryContent.goalText}</span></div>
              <div>Because Good Energy Always Comes Back!</div>
            </div>

            {/* Count Me In Button */}
            <button className="bg-black text-white font-bold rounded px-8 py-2 shadow hover:bg-gray-800 transition" style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: '1rem', minWidth: 180 }}>
              {galleryContent.countMeInButtonText}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
            <div className="text-2xl font-bold text-gray-700 mb-4">This section is currently unavailable</div>
            <div className="text-gray-500">Please check back later.</div>
          </div>
        )}
        {/* Decorative Corners and Sparkles (inside card) */}
        <Image src="/images/Gallery/leaf-left.png" alt="left leaf" width={190} height={280} className="absolute left-[0px] top-[160px] z-0" />
        <Image src="/images/Gallery/leaf-right.png" alt="right leaf" width={170} height={120} className="absolute right-[0px] bottom-[29px] z-0" />
        <Image src="/images/Gallery/bottom-left-sparkle.png" alt="bottom left sparkle" width={202} height={32} className="absolute left-3 bottom-4 z-0" />
        <Image src="/images/Gallery/bottom-right-sparkle.png" alt="bottom right sparkle" width={202} height={32} className="absolute right-4 bottom-4 z-0" />
        <Image src="/images/Gallery/middle-right-sparkle.png" alt="middle right sparkle" width={280} height={42} className="absolute right-5 top-1/4 z-0" />
        <Image src="/images/Gallery/over-leaf-sparkle.png" alt="over leaf sparkle" width={252} height={32} className="absolute left-5 top-20 z-0" />
      </div>
    </div>
    </>
  );
}