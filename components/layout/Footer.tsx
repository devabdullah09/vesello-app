"use client";
import React from 'react';
import { useRouter } from 'next/navigation';

const Footer: React.FC = () => {
  const router = useRouter();
  return (
    <footer style={{
      background: '#0a0a0b',
      color: 'white',
      padding: '1rem 0',
      boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)',
      width: '100%',
      position: 'relative',
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
      }}>
        <div>
          <div style={{ fontSize: '1.6rem', fontWeight: 400, marginBottom: '0.5rem' }}>
            © 2025 Anna Kowalska & Piotr Nowak
          </div>
          <div style={{ fontSize: '1.2rem', color: '#e0e0e0' }}>
            Powered by Vesello
          </div>
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
          LOGIN
        </button>
      </div>
    </footer>
  );
};

export default Footer;
