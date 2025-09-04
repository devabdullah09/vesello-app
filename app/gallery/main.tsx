import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

export default function MainGalleryPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white py-10 px-2 md:px-0 relative overflow-x-hidden" style={{ fontFamily: 'Montserrat, Arial, Helvetica, sans-serif' }}>
      <div className="relative w-full max-w-5xl bg-white rounded-2xl border border-[#C7B299] p-8 md:p-16 shadow-md mx-auto z-10" style={{ minHeight: 700 }}>
        {/* Decorative Corners and Sparkles */}
        <Image src="/images/gallery/leaf-left.png" alt="left leaf" width={190} height={280} className="absolute left-[0px] top-[40px] z-0" />
        <Image src="/images/gallery/leaf-right.png" alt="right leaf" width={170} height={120} className="absolute right-[0px] bottom-[29px] z-0" />
        <Image src="/images/gallery/bottom-left-sparkle.png" alt="bottom left sparkle" width={202} height={32} className="absolute left-3 bottom-4 z-0" />
        <Image src="/images/gallery/bottom-right-sparkle.png" alt="bottom right sparkle" width={202} height={32} className="absolute right-4 bottom-4 z-0" />
        <Image src="/images/gallery/middle-right-sparkle.png" alt="middle right sparkle" width={280} height={42} className="absolute right-5 top-1/4 z-0" />
        <Image src="/images/gallery/over-leaf-sparkle.png" alt="over leaf sparkle" width={252} height={32} className="absolute left-5 top-20 z-0" />

        {/* Main Content */}
        <div className="flex flex-col items-center justify-center relative z-10">
          <div className="text-xl md:text-2xl font-semibold mb-4 text-[#08080A] text-center">Welcome To The Wedding Gallery</div>
          <div className="text-center mt-2 mb-8">
            <div className="text-base md:text-lg" style={{ fontFamily: 'Montserrat', fontWeight: 400 }}>Welcome To</div>
            <div className="text-4xl md:text-5xl font-sail" style={{ fontWeight: 400, marginTop: 4, marginBottom: 0, letterSpacing: '0.5px', lineHeight: 1.1 }}>
              Lucas & Mia
            </div>
            <div className="text-2xl md:text-3xl font-sail" style={{ background: 'linear-gradient(90deg, #E5B574 0%, #C18037 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginTop: -8, fontWeight: 400, letterSpacing: '0.5px', lineHeight: 1.1 }}>
              Wedding
            </div>
            <div className="text-sm mt-2" style={{ color: '#888', fontWeight: 400 }}>11 March 2025</div>
          </div>

          {/* Two Gallery Sections */}
          <div className="flex flex-col md:flex-row gap-8 justify-center items-center w-full mb-8">
            {/* Wedding Day */}
            <div className="flex flex-col items-center">
              <div className="relative w-[270px] h-[220px] md:w-[320px] md:h-[260px] mb-2">
                <Image src="/images/gallery/weddingDay.png" alt="Wedding Day" fill style={{ objectFit: 'cover', borderRadius: '0 0 180px 180px/0 0 220px 220px' }} className="shadow-lg" />
                <div className="absolute inset-0 bg-[#E5B574]/70 rounded-b-full flex flex-col items-center justify-center">
                  <div className="text-white text-center font-semibold mb-2">Got Photos?<br />Add Them Now!</div>
                  <Link href="/gallery/upload">
                    <button className="border border-white text-white rounded px-6 py-1 bg-transparent hover:bg-white hover:text-[#C18037] transition font-medium">Upload</button>
                  </Link>
                </div>
              </div>
              <div className="text-center text-[#08080A] font-medium mt-2">Wedding Day</div>
            </div>
            {/* Party Day */}
            <div className="flex flex-col items-center">
              <div className="relative w-[270px] h-[220px] md:w-[320px] md:h-[260px] mb-2">
                <Image src="/images/gallery/afterPArty.png" alt="Party Day" fill style={{ objectFit: 'cover', borderRadius: '0 0 180px 180px/0 0 220px 220px' }} className="shadow-lg" />
                <div className="absolute inset-0 bg-[#C18037]/70 rounded-b-full flex flex-col items-center justify-center">
                  <div className="text-white text-center font-semibold mb-2">Got Photos?<br />Add Them Now!</div>
                  <Link href="/gallery/upload">
                    <button className="border border-white text-white rounded px-6 py-1 bg-transparent hover:bg-white hover:text-[#C18037] transition font-medium">Upload</button>
                  </Link>
                </div>
              </div>
              <div className="text-center text-[#08080A] font-medium mt-2">Party Day</div>
            </div>
          </div>

          {/* Copy Party Link Section */}
          <div className="flex flex-col items-center mt-4 mb-2">
            <div className="text-lg font-medium mb-3 text-[#08080A] text-center">Psst! Know Someone Who'd Kill To Be Here?</div>
            <button className="bg-[#E5B574] hover:bg-[#C18037] text-white font-semibold rounded px-6 py-2 transition" style={{ fontFamily: 'Montserrat', fontWeight: 600 }}>Copy Party Link</button>
          </div>
        </div>
      </div>
    </div>
  );
} 