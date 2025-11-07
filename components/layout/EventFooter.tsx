"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useEvent } from '@/components/event-context';
import { useLanguage } from '@/components/language-context';

const EventFooter: React.FC = () => {
  const router = useRouter();
  const { coupleNames } = useEvent();
  const { language, setLanguage, t } = useLanguage();
  
  // Default couple names if not available from context
  const displayNames = coupleNames || 'Anna Kowalska & Piotr Nowak';
  
  return (
    <footer style={{
      background: '#0a0a0b',
      color: 'white',
      padding: '1rem 0',
      boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)',
      width: '100%',
      position: 'relative',
    }}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
          <div className="flex-1">
            <div className="text-lg sm:text-xl md:text-2xl font-normal mb-2 sm:mb-3">
              © 2025 {displayNames}
            </div>
            <div className="text-sm sm:text-base md:text-lg text-gray-300 mb-2">
              {t.common.poweredBy}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            {/* Language Switcher */}
            <div className="flex gap-2">
              <button
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  language === 'en' 
                    ? 'bg-white text-black' 
                    : 'bg-transparent text-white border border-white'
                }`}
                onClick={() => setLanguage('en')}
              >
                EN
              </button>
              <button
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  language === 'pl' 
                    ? 'bg-white text-black' 
                    : 'bg-transparent text-white border border-white'
                }`}
                onClick={() => setLanguage('pl')}
              >
                PL
              </button>
            </div>
            
            <button
              className="bg-transparent text-white border border-white rounded-lg px-4 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm md:text-base font-medium tracking-wide hover:bg-white hover:text-black transition-all whitespace-nowrap"
              onClick={() => router.push('/login')}
            >
              {t.common.login}
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 pt-2 sm:pt-3 px-4 sm:px-6 md:px-8 text-center sm:text-right">
        <p className="text-gray-500 text-xs sm:text-sm">
          {t.common.designedBy}{' '}
          <a 
            href="https://www.abdullahshafiq.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline hover:text-gray-300 transition-colors"
          >
            Abdullah
          </a>
        </p>
      </div>
    </footer>
  );
};

export default EventFooter;
