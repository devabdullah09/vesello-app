'use client';

import { useState } from 'react';
import Image from 'next/image';
import CollapsibleSection from '../CollapsibleSection';

export default function WishesAndGiftsSection() {
  return (
    <CollapsibleSection title="Wishes And Gifts">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8 md:mb-10 mt-2">
        <span
          className="block font-normal mb-2"
          style={{
            fontFamily: 'Sail',
            background: 'linear-gradient(90deg, #E5B574 0%, #C18037 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block',
            letterSpacing: '2px',
            lineHeight: 1.1,
            fontSize: 'clamp(2.5rem, 10vw, 4rem)',
          }}
        >
          Wishes And Gifts
        </span>
      </div>
      {/* Two Columns */}
      <div className="flex flex-col md:flex-row justify-center items-start gap-6 sm:gap-8 md:gap-10 mb-8 sm:mb-12 md:mb-16 w-full max-w-4xl mx-auto px-4 sm:px-6">
        {/* Left Column */}
        <div className="flex-1 text-center md:text-right pr-0 md:pr-8">
          <div className="font-bold text-black mb-3 uppercase" 
               style={{ 
                 fontFamily: 'Montserrat',
                 fontSize: 'clamp(1rem, 3vw, 1.25rem)'
               }}>
            At The Church
          </div>
          <ul className="space-y-1 text-black" 
              style={{ 
                fontFamily: 'Montserrat',
                fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)'
              }}>
            <li>Just After The Ceremony</li>
            <li>Upon Entering The</li>
            <li>Wedding Hall</li>
            <li>After Dinner</li>
            <li>During Cocktail Hour</li>
            <li>While Waiting For The</li>
            <li>Couple's Entrance</li>
            <li>Near The Welcome Board</li>
            <li>At The Table Via QR Code</li>
          </ul>
        </div>
        {/* Divider */}
        <div className="hidden md:flex flex-col justify-center items-center px-4">
          <div className="w-px h-64 bg-black opacity-40" />
        </div>
        {/* Right Column */}
        <div className="flex-1 text-center md:text-left pl-0 md:pl-8">
          <div className="font-bold text-black mb-3 uppercase" 
               style={{ 
                 fontFamily: 'Montserrat',
                 fontSize: 'clamp(1rem, 3vw, 1.25rem)'
               }}>
            At The Wedding
          </div>
          <ul className="space-y-1 text-black" 
              style={{ 
                fontFamily: 'Montserrat',
                fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)'
              }}>
            <li>After The Church Ceremony</li>
            <li>At The Church Exit</li>
            <li>Outside The Chapel</li>
            <li>Before Leaving For The</li>
            <li>Reception Hall</li>
            <li>While Guests Gather</li>
            <li>Outside The Church</li>
            <li>Displayed Near The Church</li>
            <li>Welcome Sign</li>
          </ul>
        </div>
      </div>
      {/* Gifts Section */}
      <div className="text-center mt-6 sm:mt-8 md:mt-10">
        <div className="font-bold mb-2" 
             style={{ 
               fontFamily: 'Montserrat', 
               color: '#E5B574',
               fontSize: 'clamp(1.25rem, 4vw, 1.5rem)'
             }}>
          Gifts
        </div>
        <div className="space-y-1 text-black" 
             style={{ 
               fontFamily: 'Montserrat',
               fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)'
             }}>
          <div>Bottle Of Wine Instead Of Flowers</div>
          <div>Books Instead Of Bouquets</div>
          <div>Charity Donation Instead Of Gifts</div>
          <div>Gift Cards Instead Of Wrapped Presents</div>
          <div>Write A Wish Instead Of Bringing A Gift</div>
        </div>
      </div>
    </CollapsibleSection>
  );
}
