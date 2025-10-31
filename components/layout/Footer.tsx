"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useEvent } from '@/components/event-context';
import { useLanguage } from '@/components/language-context';

const Footer: React.FC = () => {
  const router = useRouter();
  const { coupleNames } = useEvent();
  const { language, setLanguage, t } = useLanguage();
  
  // Default couple names if not available from context
  const displayNames = coupleNames || 'Anna Kowalska & Piotr Nowak';
  
  return (
    <footer style={{
      background: '#0a0a0b',
      color: 'white',
      padding: '1.5rem 0',
      boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)',
      width: '100%',
      position: 'relative',
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        padding: '0 1rem',
      }}
      className="md:flex-row md:items-center md:justify-between md:px-8"
      >
        <div className="text-center md:text-left">
          <div style={{ fontSize: '1.2rem', fontWeight: 400, marginBottom: '0.5rem' }}
            className="md:text-2xl"
          >
            © 2025 {displayNames}
          </div>
          <div style={{ fontSize: '1rem', color: '#e0e0e0' }}
            className="md:text-lg"
          >
            {t.common.poweredBy}
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'center' }}
          className="flex-col sm:flex-row"
        >
          {/* Language Switcher */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              style={{
                background: language === 'en' ? 'white' : 'transparent',
                color: language === 'en' ? 'black' : 'white',
                border: '1px solid white',
                borderRadius: '8px',
                padding: '0.3rem 0.8rem',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'background 0.2s, color 0.2s',
              }}
              onClick={() => setLanguage('en')}
            >
              EN
            </button>
            <button
              style={{
                background: language === 'pl' ? 'white' : 'transparent',
                color: language === 'pl' ? 'black' : 'white',
                border: '1px solid white',
                borderRadius: '8px',
                padding: '0.3rem 0.8rem',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'background 0.2s, color 0.2s',
              }}
              onClick={() => setLanguage('pl')}
            >
              PL
            </button>
          </div>
          
          <button
            style={{
              background: 'transparent',
              color: 'white',
              border: '1px solid white',
              borderRadius: '12px',
              padding: '0.4rem 2.2rem',
              fontSize: '1.1rem',
              cursor: 'pointer',
              letterSpacing: '1px',
              transition: 'background 0.2s, color 0.2s',
            }}
            onClick={() => router.push('/login')}
          >
            {t.common.login}
          </button>
        </div>
      </div>

      <div className="border-t border-gray-800 pt-4 px-4 text-center">
          <p className="text-gray-500 text-xs">
            {t.common.designedBy}{' '}
            <a 
              href="https://www.abdullahshafiq.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-white transition-colors"
            >
              Abdullah
            </a>
          </p>
        </div>
    </footer>
  );
};

export default Footer;
