import React from 'react';
import Image from 'next/image';
import Footer from '../layout/Footer';
import Header from '../layout/Header';

interface UploadingOverlayProps {
  current: number;
  total: number;
  onCancel?: () => void;
}

const UploadingOverlay: React.FC<UploadingOverlayProps> = ({ current, total, onCancel }) => {
  return (
    <div className="fixed inset-0 z-[1000] bg-white flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center relative px-2 md:px-0" style={{ fontFamily: 'Montserrat, Arial, Helvetica, sans-serif' }}>
        <div className="relative w-full max-w-3xl bg-white rounded-2xl border border-[#C7B299] p-8 md:p-16 shadow-md mx-auto z-10" style={{ minHeight: 340 }}>
          {/* Decorative Corners and Sparkles */}
          <Image src="/images/Gallery/leaf-left.png" alt="left leaf" width={190} height={280} className="absolute left-[0px] top-[0px] z-0" />
          <Image src="/images/Gallery/leaf-right.png" alt="right leaf" width={170} height={120} className="absolute right-[0px] bottom-[0px] z-0" />
          <Image src="/images/Gallery/bottom-left-sparkle.png" alt="bottom left sparkle" width={202} height={32} className="absolute left-3 bottom-4 z-0" />
          <Image src="/images/Gallery/bottom-right-sparkle.png" alt="bottom right sparkle" width={202} height={32} className="absolute right-4 bottom-4 z-0" />
          <Image src="/images/Gallery/middle-right-sparkle.png" alt="middle right sparkle" width={280} height={42} className="absolute right-5 top-1/4 z-0" />
          <Image src="/images/Gallery/over-leaf-sparkle.png" alt="over leaf sparkle" width={252} height={32} className="absolute left-5 top-20 z-0" />

          <div className="absolute top-4 left-4 z-20">
            <div className="text-2xl md:text-3xl font-semibold" style={{ fontFamily: 'Montserrat', fontWeight: 500 }}>Uploading</div>
          </div>
          {/* Main Content */}
          <div className="flex flex-col items-center justify-center relative z-10">
            
            <div className="text-center mt-2 mb-4">
              <div className="text-2xl md:text-3xl font-semibold" style={{ fontFamily: 'Montserrat', fontWeight: 500 }}>ITEMS UPLOADING...</div>
              <div className="text-base md:text-lg mt-2 mb-6" style={{ fontFamily: 'Montserrat', fontWeight: 400, color: '#888' }}>Please Keep Your Browser Open.</div>
            </div>
            {/* Progress Bar */}
            <div className="w-full max-w-md mx-auto mb-4">
              <div className="h-4 rounded-full bg-[#E5B574] relative overflow-hidden">
                <div className="h-full bg-black transition-all" style={{ width: `${(current / total) * 100}%` }} />
              </div>
              <div className="text-center text-[#888] mt-2" style={{ fontFamily: 'Montserrat', fontWeight: 400 }}>
                Uploading {current} of {total}
              </div>
            </div>
            {onCancel && (
              <button onClick={onCancel} className="mt-4 text-sm text-[#C18037] underline">Cancel</button>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UploadingOverlay; 