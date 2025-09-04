"use client";
import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useRef, useEffect } from 'react';
import { fetchGalleryFiles } from '@/lib/gallery';

export default function MainGalleryPage() {
  const [showCopiedPopup, setShowCopiedPopup] = useState(false);
  const [weddingDayCount, setWeddingDayCount] = useState(0);
  const [partyDayCount, setPartyDayCount] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleCopyLink = () => {
    // Replace with your actual party link
    const partyLink = window.location.origin + '/gallery/party-day';
    navigator.clipboard.writeText(partyLink);
    setShowCopiedPopup(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setShowCopiedPopup(false);
    }, 5000);
  };

  // Load gallery counts on component mount
  useEffect(() => {
    const loadGalleryCounts = async () => {
      try {
        // Get wedding day photo count
        const weddingPhotos = await fetchGalleryFiles('wedding-day', 'photos');
        setWeddingDayCount(weddingPhotos.count);
        
        // Get party day photo count
        const partyPhotos = await fetchGalleryFiles('party-day', 'photos');
        setPartyDayCount(partyPhotos.count);
      } catch (error) {
        console.error('Error loading gallery counts:', error);
      }
    };

    loadGalleryCounts();
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white py-10 px-2 md:px-0 relative overflow-x-hidden" style={{ fontFamily: 'Montserrat, Arial, Helvetica, sans-serif' }}>
      <div className="relative w-full max-w-5xl bg-white rounded-2xl border border-[#C7B299] p-8 md:p-16 shadow-md mx-auto z-10" style={{ minHeight: 700 }}>
        {/* Top Left Heading */}
        <div className="absolute left-8 top-8 text-xl md:text-2xl text-[#08080A]" style={{ fontFamily: 'Montserrat', fontWeight: 400 }}>
          Welcome To The Wedding Gallery
        </div>
        
        {/* Decorative Corners and Sparkles */}
        <Image src="/images/Gallery/leaf-left.png" alt="left leaf" width={190} height={280} className="absolute left-[0px] top-[60px] z-0" />
        <Image src="/images/Gallery/leaf-right.png" alt="right leaf" width={160} height={50} className="absolute right-[0px] top-[60px] z-0" />
        <Image src="/images/Gallery/bottom-left-sparkle.png" alt="bottom left sparkle" width={202} height={32} className="absolute left-3 bottom-4 z-0" />
        <Image src="/images/Gallery/middle-right-sparkle.png" alt="middle right sparkle" width={280} height={42} className="absolute right-5 top-1/4 z-0" />
        <Image src="/images/Gallery/over-leaf-sparkle.png" alt="over leaf sparkle" width={252} height={32} className="absolute left-5 top-20 z-0" />

        {/* Main Content */}
        <div className="flex flex-col justify-center relative z-10">
          <div className="text-center mt-2 mb-8">
            <div className="text-base md:text-lg" style={{ fontFamily: 'Montserrat', fontWeight: 400, color: '#08080A' }}>Welcome To</div>
            <div className="text-4xl md:text-5xl font-sail" style={{ fontWeight: 400, marginTop: 4, marginBottom: 0, letterSpacing: '0.5px', lineHeight: 1.1, color: '#08080A' }}>
              Lucas & Mia
            </div>
            <div className="text-2xl md:text-3xl font-sail" style={{ background: 'linear-gradient(90deg, #E5B574 0%, #C18037 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginTop: -8, fontWeight: 400, letterSpacing: '0.5px', lineHeight: 1.1 }}>
              Wedding
            </div>
            <div className="text-sm mt-2" style={{ color: '#888', fontWeight: 400, fontFamily: 'Montserrat', fontSize: '16px', letterSpacing: '0.01em', lineHeight: 1.4 }}>11 March 2025</div>
          </div>

          {/* Two Gallery Sections */}
          <div className="flex flex-col md:flex-row gap-8 justify-center items-center w-full mb-8">
            {/* Wedding Day */}
            <div className="flex flex-col items-center">
              <Link href="/gallery/wedding-day" className="relative w-[270px] h-[220px] md:w-[370px] md:h-[260px] mb-2 group block">
                <Image src="/images/Gallery/maingallery.jpg" alt="Wedding Day" fill 
                style={{ objectFit: 'cover', borderRadius: '0 0 180px 180px/0 0 220px 0' }} className="shadow-lg" />
                <div className="absolute inset-0 bg-[#E5B574]/70 flex flex-col items-center justify-center opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-300" 
                style={{ borderRadius: '0 0 180px 180px/0 0 220px 0px' }}>
                  <div className="text-white text-center font-semibold mb-2" style={{ fontFamily: 'Montserrat', fontWeight: 400, fontSize: '16px', color: '#fff', letterSpacing: '0.01em', lineHeight: 1.4 }}>Got Photos?<br />Add Them Now!</div>
                  <button className="border border-white text-white rounded px-6 py-1 bg-transparent hover:bg-white hover:text-[#C18037] transition" style={{ fontFamily: 'Montserrat', fontWeight: 600, fontSize: '16px', letterSpacing: '0.01em', lineHeight: 1.4 }}>Upload</button>
                </div>
              </Link>
              <div className="text-center mt-2" style={{ fontFamily: 'Montserrat', fontWeight: 400, fontSize: '16px', color: '#08080A', letterSpacing: '0.01em', lineHeight: 1.4 }}>
                Wedding Day
                {weddingDayCount > 0 && (
                  <div className="text-sm text-[#C18037] mt-1">
                    {weddingDayCount} photo{weddingDayCount !== 1 ? 's' : ''} uploaded
                  </div>
                )}
              </div>
            </div>
            {/* Party Day */}
            <div className="flex flex-col items-center">
              <Link href="/gallery/party-day" className="relative w-[270px] h-[220px] md:w-[370px] md:h-[260px] mb-2 group block">
                <Image src="/images/Gallery/maingallery.jpg" alt="Party Day" fill style={{ objectFit: 'cover', borderRadius: '0 0 180px 180px/0 0 220px 0px' }} className="shadow-lg" />
                <div className="absolute inset-0 bg-[#C18037]/70 flex flex-col items-center justify-center opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-300" style={{ borderRadius: '0 0 180px 180px/0 0 220px 0px' }}>
                  <div className="text-white text-center font-semibold mb-2" style={{ fontFamily: 'Montserrat', fontWeight: 400, fontSize: '16px', color: '#fff', letterSpacing: '0.01em', lineHeight: 1.4 }}>Got Photos?<br />Add Them Now!</div>
                  <button className="border border-white text-white rounded px-6 py-1 bg-transparent hover:bg-white hover:text-[#C18037] transition" 
                  style={{ fontFamily: 'Montserrat', fontWeight: 600, fontSize: '16px', letterSpacing: '0.01em', lineHeight: 1.4 }}>
                    Upload</button>
                </div>
              </Link>
              <div className="text-center mt-2" style={{ fontFamily: 'Montserrat', fontWeight: 400, fontSize: '16px', color: '#08080A', letterSpacing: '0.01em', lineHeight: 1.4 }}>
                Party Day
                {partyDayCount > 0 && (
                  <div className="text-sm text-[#C18037] mt-1">
                    {partyDayCount} photo{partyDayCount !== 1 ? 's' : ''} uploaded
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Copy Party Link Section */}
          <div className="flex flex-col items-center mt-4 mb-2">
            <div className="text-lg font-medium mb-3 text-[#08080A] text-center" style={{ fontFamily: 'Montserrat', fontWeight: 600, fontSize: '16px', color: '#08080A', letterSpacing: '0.01em', lineHeight: 1.4 }}>Psst! Know Someone Who'd Kill To Be Here?</div>
            <button className="bg-gradient-to-r from-[#E5B574] to-[#C18037] text-white font-semibold rounded-md px-8 py-2 mb-10 shadow hover:opacity-90 transition" 
            style={{ fontFamily: 'Montserrat', fontWeight: 500, fontSize: '1rem', minWidth: 160 }}
            onClick={handleCopyLink}>
              Copy Party Link</button>
          </div>
        </div>
      </div>

      {/* Link Copied Popup */}
      {showCopiedPopup && (
        <div
          style={{
            position: 'fixed',
            right: 24,
            bottom: 32,
            zIndex: 50,
            background: '#fff',
            border: '1px solid #E5B574',
            borderRadius: 12,
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            padding: '14px 18px',
            minWidth: 220,
            textAlign: 'center',
          }}
        >
          <div style={{ color: '#C18037', fontWeight: 600, fontSize: 16, fontFamily: 'Montserrat', marginBottom: 8 }}>
            Link Copied!
          </div>
          <div style={{ color: '#08080A', fontWeight: 400, fontSize: 13, fontFamily: 'Montserrat', marginBottom: 2 }}>
            This Link Is As Exclusive As Your Invite.<br />
            Please Share Only With Fellow Guests!
          </div>
        </div>
      )}
    </div>
  );
} 

