import { useState, useEffect } from 'react';
import { useLanguage } from '@/components/language-context';

export default function HeroSection() {
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 11,
    minutes: 1,
    seconds: 2,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* Google Fonts - Great Vibes */}
      <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      
      <div className="relative w-full overflow-hidden bg-white">
        <div className="flex flex-col md:flex-row h-full min-h-[420px] md:min-h-[500px] items-stretch">
          {/* Left side content */}
          <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-8 md:px-16 py-6 sm:py-8 md:py-8 z-20">
            {/* Names in elegant box */}
            <div className="border border-black px-4 sm:px-6 md:px-8 py-2 sm:py-3 mb-4 sm:mb-6 inline-block" 
                 style={{ 
                   fontFamily: "'Great Vibes', cursive", 
                   fontSize: 'clamp(1.5rem, 5vw, 2.2rem)', 
                   letterSpacing: '0.02em' 
                 }}>
              Lucas & Mia
            </div>
            
            {/* Save The Date */}
            <div className="mb-2">
              <h2
                className="font-normal mb-1"
                style={{
                  fontFamily: "'Great Vibes', cursive",
                  background: 'linear-gradient(90deg, #E5B574 0%, #C18037 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'inline-block',
                  letterSpacing: '1px',
                  lineHeight: 1.1,
                  fontSize: 'clamp(1.8rem, 6vw, 2.7rem)',
                }}
              >
{t.hero.saveTheDate}
              </h2>
            </div>

            {/* Countdown Timer */}
            <div className="mb-6 sm:mb-8">
              <p className="text-black font-semibold tracking-[0.12em]" 
                 style={{ 
                   fontFamily: 'Montserrat', 
                   letterSpacing: '0.12em',
                   fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)'
                 }}>
{t.hero.gettingMarried}
              </p>
            </div>

            <div className="flex gap-2 sm:gap-3 md:gap-4 mb-2">
              {[
                { value: timeLeft.days, label: t.hero.days },
                { value: timeLeft.hours, label: t.hero.hours },
                { value: timeLeft.minutes, label: t.hero.minutes },
                { value: timeLeft.seconds, label: t.hero.seconds },
              ].map((item, idx) => (
                <div key={item.label} className="text-center">
                  <div
                    className="font-bold py-2 sm:py-3 px-3 sm:px-4 md:px-5 rounded mb-1 sm:mb-2"
                    style={{
                      background: 'linear-gradient(90deg, #E5B574 0%, #C18037 100%)',
                      color: 'white',
                      minWidth: 'clamp(48px, 12vw, 64px)',
                      fontFamily: 'Montserrat',
                      fontSize: 'clamp(1rem, 3vw, 1.5rem)',
                    }}
                  >
                    {String(item.value).padStart(2, '0')}
                  </div>
                  <div className="text-black font-semibold tracking-wide" 
                       style={{ 
                         fontFamily: 'Montserrat',
                         fontSize: 'clamp(0.625rem, 1.5vw, 0.875rem)'
                       }}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right side image */}
          <div className="flex-1 md:flex-1 flex items-center justify-center p-4 md:p-8 overflow-hidden">
            <div className="w-full aspect-[4/3] relative" style={{ maxWidth: '100%', maxHeight: '100%' }}>
              <img
                src="/images/herosection.png"
                alt="Wedding couple"
                className="w-full h-full object-cover object-center rounded-lg"
                style={{ 
                  aspectRatio: '4/3',
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}