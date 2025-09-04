"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';


export default function EditAlbumAdminPage() {
  const [visible, setVisible] = useState(true);
  const router = useRouter();

  // On mount, load toggle state
  useEffect(() => {
    const stored = localStorage.getItem('gallery_visible');
    setVisible(stored === null ? true : stored === 'true');
  }, []);

  // When visible changes, persist to localStorage
  useEffect(() => {
    localStorage.setItem('gallery_visible', visible ? 'true' : 'false');
  }, [visible]);

  return (
    <div className="flex min-h-screen bg-white">
      <div className="flex-1 p-12 bg-white min-h-screen">
      <div className="flex justify-between items-start mb-8">
        <button
          onClick={() => router.push("/dashboard/events-edition/gallery")}
          className="bg-black text-white px-6 py-2 rounded font-semibold hover:bg-gray-800 transition-colors"
        >
          Back
        </button>
        
      </div>
        <div className="flex justify-between items-start mb-8">
          <h1 className="text-3xl font-bold text-black mb-4">EDIT ALBUM PAGE</h1>
        </div>
        {/* Admin Toggle */}
    
        <div className="relative w-full max-w-3xl bg-white rounded-2xl border border-[#C7B299] p-8 md:p-16 shadow-md mx-auto z-10" style={{ minHeight: 700 }}>
          {/* Gallery UI (same as public) */}
          <div className="flex flex-col items-center justify-center relative z-10">
            <div className="text-center mt-2 mb-8">
              <div className="text-base md:text-lg" style={{ fontFamily: 'Montserrat', fontWeight: 400 }}>Welcome To</div>
              <div className="text-4xl md:text-5xl font-sail" style={{ fontWeight: 400, marginTop: 4, marginBottom: 0, letterSpacing: '0.5px', lineHeight: 1.1 }}>
                Lucas & Mia
              </div>
              <div className="text-2xl md:text-3xl font-sail" style={{ background: 'linear-gradient(90deg, #E5B574 0%, #C18037 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginTop: -8, fontWeight: 400, letterSpacing: '0.5px', lineHeight: 1.1 }}>
                Wedding
              </div>
            </div>
            {/* Upload Box */}
            <Link href="/gallery/upload" className="w-200 border border-[#E5B574] rounded-md py-10 px-4 flex flex-col items-center mb-8 bg-white hover:shadow-lg transition cursor-pointer" style={{ minHeight: 180, textDecoration: 'none' }}>
              <Image src="/images/Gallery/photo_icon.png" alt="Add Photos" width={50} height={50} className="mb-3" />
              <div className="text-base text-[#08080A] mt-2" style={{ fontFamily: 'Montserrat', fontWeight: 500 }}>
                Add Your Photos & Videos Now
              </div>
            </Link>
            {/* View Gallery Button */}
            <Link href="/gallery/main">
              <button className="bg-gradient-to-r from-[#E5B574] to-[#C18037] text-white font-semibold rounded-md px-8 py-2 mb-10 shadow hover:opacity-90 transition" 
               style={{ fontFamily: 'Montserrat', fontWeight: 600, fontSize: '1rem', minWidth: 160 }}>
                View Gallery
              </button>
            </Link>

            <div className="flex items-center mb-6 justify-end">
          
          <button
            className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${visible ? 'bg-[#E5B574]' : 'bg-gray-200'}`}
            onClick={() => setVisible(v => !v)}
            title="You can on and off this section on website."
          >
            <span
              className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${visible ? 'translate-x-6' : ''}`}
            />
          </button>
        
        </div>
            {/* Mission Statement */}
            <div className="text-center text-[#08080A] mb-10 max-w-xl mx-auto" style={{ fontFamily: 'Montserrat', fontWeight: 400, fontSize: '1rem', lineHeight: 1.6 }}>
              <div className="mb-2">Dear Guests - We Have An Important Mission For You:</div>
              <div className="font-bold mb-2">Like, Follow, And Tag The Amazing Team Behind Today's Magic.</div>
              <div className="mb-2">Every Click Is A Like A Loud 'Thank You!' To Them!</div>
              <div className="mb-2">Our Goal: <span className="font-bold">50 New Followers!</span></div>
              <div>Because Good Energy Always Comes Back!</div>
            </div>
            {/* Count Me In Button */}
            <button className="bg-black text-white font-bold rounded px-8 py-2 shadow hover:bg-gray-800 transition" style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: '1rem', minWidth: 180 }}>
              COUNT ME IN!
            </button>
          </div>
          {/* Decorative Corners and Sparkles (inside card) */}
          <Image src="/images/Gallery/leaf-left.png" alt="left leaf" width={190} height={280} className="absolute left-[0px] top-[160px] z-0" />
          <Image src="/images/Gallery/leaf-right.png" alt="right leaf" width={170} height={120} className="absolute right-[0px] bottom-[29px] z-0" />
          <Image src="/images/Gallery/bottom-left-sparkle.png" alt="bottom left sparkle" width={202} height={32} className="absolute left-3 bottom-4 z-0" />
          <Image src="/images/Gallery/bottom-right-sparkle.png" alt="bottom right sparkle" width={202} height={32} className="absolute right-4 bottom-4 z-0" />
          <Image src="/images/Gallery/middle-right-sparkle.png" alt="middle right sparkle" width={280} height={42} className="absolute right-5 top-1/4 z-0" />
          <Image src="/images/Gallery/over-leaf-sparkle.png" alt="over leaf sparkle" width={252} height={32} className="absolute left-5 top-20 z-0" />
        </div>
      </div>
    </div>
  );
} 