import React from 'react';
import Image from 'next/image';
import Footer from '../layout/Footer';
import Header from '../layout/Header';

interface UploadSuccessOverlayProps {
  onViewGallery: () => void;
  onCountMeIn: () => void;
}

const UploadSuccessOverlay: React.FC<UploadSuccessOverlayProps> = ({ onViewGallery, onCountMeIn }) => {
  return (
    <div className="fixed inset-0 z-[1000] bg-white flex flex-col" style={{ fontFamily: 'Montserrat, Arial, Helvetica, sans-serif' }}>
      <Header />
      <div className="flex-1 overflow-y-auto">
        <div className="min-h-full flex items-center justify-center w-full px-4 md:px-8 py-20">
          <div className="relative w-full max-w-3xl bg-white rounded-2xl border border-[#C7B299] p-8 md:p-16 shadow-md mx-auto">
            {/* Decorative Corners and Sparkles */}
            <Image src="/images/Gallery/leaf-left.png" alt="left leaf" width={190} height={280} className="absolute left-[-10px] top-[60px] z-0" />
            <Image src="/images/Gallery/leaf-right.png" alt="right leaf" width={170} height={120} className="absolute right-[-5px] bottom-[20px] z-0" />
            <Image src="/images/Gallery/bottom-left-sparkle.png" alt="bottom left sparkle" width={202} height={32} className="absolute left-3 bottom-4 z-0" />
            <Image src="/images/Gallery/bottom-right-sparkle.png" alt="bottom right sparkle" width={202} height={32} className="absolute right-4 bottom-4 z-0" />
            <Image src="/images/Gallery/middle-right-sparkle.png" alt="middle right sparkle" width={280} height={42} className="absolute right-[-10px] top-1/3 z-0" />
            <Image src="/images/Gallery/over-leaf-sparkle.png" alt="over leaf sparkle" width={252} height={32} className="absolute left-3 top-16 z-0" />

            {/* Upload Confirmation Title - Top Left */}
            <div className="absolute top-8 left-8 z-20">
              <div className="text-xl md:text-2xl font-semibold text-[#08080A]" style={{ fontFamily: 'Montserrat', fontWeight: 500 }}>Upload Confirmation</div>
            </div>

            {/* Main Content */}
            <div className="flex flex-col items-center justify-center relative z-10 pt-16 pb-8">
             
              <div className="text-center mb-8">
                <div className="text-3xl md:text-4xl font-bold mb-3 text-[#08080A]" style={{ fontFamily: 'Montserrat', fontWeight: 700 }}>SUCCESS!</div>
                <div className="text-base md:text-lg mb-4 text-[#08080A]" style={{ fontFamily: 'Montserrat', fontWeight: 400 }}>
                  High Five For Your Upload!<br />
                  Thanks For Adding To Our Vibe!
                </div>
                <button 
                  onClick={onViewGallery} 
                  className="bg-gradient-to-r from-[#E5B574] to-[#C18037] text-white font-semibold rounded-md px-8 py-3 mb-8 shadow hover:opacity-90 transition" 
                  style={{ fontFamily: 'Montserrat', fontWeight: 600, fontSize: '1rem', minWidth: 160 }}
                >
                  View Gallery
                </button>
              </div>
              
              <div className="text-center text-[#08080A] mb-8 max-w-xl mx-auto" style={{ fontFamily: 'Montserrat', fontWeight: 400, fontSize: '1rem', lineHeight: 1.6 }}>
                <div className="mb-2">Dear Guests - We Have An Important Mission For You:</div>
                <div className="font-bold mb-2">Like, Follow, And Tag The Amazing Team Behind Today's Magic.</div>
                <div className="mb-2">Every Click Is A Like A Loud 'Thank You!' To Them!</div>
                <div className="mb-2">Our Goal: <span className="font-bold">50 New Followers!</span></div>
                <div>Because Good Energy Always Comes Back!</div>
              </div>
              
              <button 
                onClick={onCountMeIn} 
                className="bg-black text-white font-bold rounded px-8 py-3 shadow hover:bg-gray-800 transition" 
                style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: '1rem', minWidth: 180 }}
              >
                COUNT ME IN!
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UploadSuccessOverlay; 