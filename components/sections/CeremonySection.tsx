import React from 'react';
import { MapPin } from 'lucide-react';
import CollapsibleSection from '../CollapsibleSection';

export default function CeremonySection() {
  return (
    <CollapsibleSection title="Ceremony">
      <div className="flex flex-col md:flex-row items-center md:items-stretch">
        {/* Left: Text Content */}
        <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 md:px-10 py-6 md:py-0">
          <div className="mb-2">
            <span style={{ 
              fontFamily: 'Montserrat', 
              fontWeight: 400, 
              fontSize: 'clamp(0.875rem, 2.5vw, 1rem)', 
              color: '#08080A', 
              letterSpacing: '0.01em', 
              lineHeight: 1.4 
            }}>
              We Invite You To Join Us For Our
            </span>
          </div>
          <div className="mb-4 sm:mb-5">
            <span
              style={{
                fontFamily: 'Sail',
                fontWeight: 400,
                fontSize: 'clamp(1.5rem, 5vw, 2.2rem)',
                background: 'linear-gradient(90deg, #E5B574 0%, #D59C58 43%, #C18037 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block',
                letterSpacing: '1px',
                lineHeight: 1.1,
              }}
            >
              Wedding Ceremony
            </span>
          </div>
          <div className="space-y-1 mb-3">
            <div className="font-bold text-[#08080A]" 
                 style={{
                   fontFamily: 'Montserrat', 
                   letterSpacing: '0.5px',
                   fontSize: 'clamp(1rem, 3vw, 1.125rem)'
                 }}>
              ST. MARY'S CHURCH
            </div>
            <div className="text-[#08080A]" 
                 style={{
                   fontFamily: 'Montserrat', 
                   fontWeight: 400,
                   fontSize: 'clamp(0.875rem, 2.5vw, 1rem)'
                 }}>
              123 church street, warsaw
            </div>
          </div>
          <div className="space-y-1 mb-3">
            <div className="text-[#08080A]" 
                 style={{
                   fontFamily: 'Montserrat', 
                   fontWeight: 400,
                   fontSize: 'clamp(0.875rem, 2.5vw, 1rem)'
                 }}>
              12:00 PM
            </div>
            <div className="text-[#08080A]" 
                 style={{
                   fontFamily: 'Montserrat', 
                   fontWeight: 400,
                   fontSize: 'clamp(0.875rem, 2.5vw, 1rem)'
                 }}>
              MONDAY, MAY 02, 2025
            </div>
          </div>
          <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" 
             className="flex items-center text-[#C18037] font-semibold mb-3 hover:text-[#A06829] transition-colors"
             style={{
               fontFamily: 'Montserrat',
               fontSize: 'clamp(0.875rem, 2.5vw, 1rem)'
             }}>
            <MapPin className="mr-2" size={18} color="currentColor" />
            <span>View On Map</span>
          </a>
          <div className="text-[#08080A] max-w-sm" 
               style={{
                 fontFamily: 'Montserrat', 
                 fontWeight: 400, 
                 lineHeight: 1.5,
                 fontSize: 'clamp(0.75rem, 2vw, 0.875rem)'
               }}>
            The Ceremony Will Be Conducted By Father Jan Kowalski. Please Arrive 15 Minutes Early.
          </div>
        </div>
        {/* Right: Image Content */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 md:px-10 py-6 md:py-0">
          <img
            src="/images/Group 25.png"
            alt="St. Mary's Church Interior"
            className="w-full max-w-md h-auto z-10 img-responsive"
            style={{ 
              borderTopRightRadius: 'clamp(30px, 8vw, 60px)', 
              borderBottomLeftRadius: 'clamp(30px, 8vw, 60px)', 
              objectFit: 'cover' 
            }}
          />
        </div>
      </div>
    </CollapsibleSection>
  );
}