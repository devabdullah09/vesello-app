'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white py-10 px-2 md:px-0 relative overflow-x-hidden" style={{ fontFamily: 'Montserrat, Arial, Helvetica, sans-serif' }}>
      <div className="relative w-full max-w-4xl bg-white rounded-2xl border border-[#C7B299] p-8 md:p-16 shadow-md mx-auto z-10" style={{ minHeight: 700 }}>
        {/* Decorative Corners and Sparkles (inside card) */}
        <Image src="/images/Gallery/leaf-left.png" alt="left leaf" width={190} height={280} className="absolute left-[0px] top-[160px] z-0" />
        <Image src="/images/Gallery/leaf-right.png" alt="right leaf" width={170} height={120} className="absolute right-[0px] bottom-[29px] z-0" />
        <Image src="/images/Gallery/bottom-left-sparkle.png" alt="bottom left sparkle" width={202} height={32} className="absolute left-3 bottom-4 z-0" />
        <Image src="/images/Gallery/bottom-right-sparkle.png" alt="bottom right sparkle" width={202} height={32} className="absolute right-4 bottom-4 z-0" />
        <Image src="/images/Gallery/middle-right-sparkle.png" alt="middle right sparkle" width={280} height={42} className="absolute right-5 top-1/4 z-0" />
        <Image src="/images/Gallery/over-leaf-sparkle.png" alt="over leaf sparkle" width={252} height={32} className="absolute left-5 top-20 z-0" />

        {/* Main Content */}
        <div className="flex flex-col items-center justify-center relative z-10">
          <div className="text-center mt-2 mb-8">
            <div className="text-4xl md:text-5xl font-sail" style={{ fontWeight: 400, letterSpacing: '0.5px', lineHeight: 1.1 }}>
              <span style={{ fontFamily: 'Sail, cursive', fontWeight: 400 }}>Sign <span style={{ fontFamily: 'Montserrat', fontWeight: 500 }}>Your</span></span>
              <span className="block" style={{ background: 'linear-gradient(90deg, #E5B574 0%, #C18037 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: 'Sail, cursive', fontWeight: 400 }}>Masterpiece!</span>
            </div>
            <div className="text-base md:text-lg mt-2" style={{ fontFamily: 'Montserrat', fontWeight: 400 }}>
              We&apos;d Love To Remember Who Left This Gem!
            </div>
          </div>
          <div className="w-full flex justify-center mb-8">
            <div className="border border-[#E5B574] rounded-md py-8 px-8 flex flex-col items-center bg-white" style={{ minWidth: 340, maxWidth: 400 }}>
              <div className="text-center text-[#08080A] mb-6" style={{ fontFamily: 'Montserrat', fontWeight: 500, fontSize: '1.1rem' }}>
                Select An Album To Upload To
              </div>
              <div className="flex flex-row gap-8">
                <button className="flex flex-col items-center px-6 py-4" style={{ minWidth: 120 }} onClick={() => router.push('/gallery/wedding-day')}>
                  <Image src="/images/Gallery/weddingDay.png" alt="Wedding Day" width={78} height={78} className="mb-2" />
                  <span className="mt-2" style={{ fontFamily: 'Montserrat', fontWeight: 500 }}>Wedding Day</span>
                </button>
                <button className="flex flex-col items-center px-6 py-4" style={{ minWidth: 120 }} onClick={() => router.push('/gallery/party-day')}>
                  <Image src="/images/Gallery/afterPArty.png" alt="After Party" width={78} height={78} className="mb-2" />
                  <span className="mt-2" style={{ fontFamily: 'Montserrat', fontWeight: 500 }}>After Party</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 