"use client";
import React from "react";
import Image from "next/image";
import { useInvitation } from "@/components/invitation-context";

export default function RSVPResponsePage() {
  const { state } = useInvitation();

  // Get all guest names from context
  const allGuestNames = [state.mainGuest.name, ...state.additionalGuests.map(g => g.name)].filter(name => name.trim() !== '');

  // Filter guests who are attending each event
  const weddingDayGuests = allGuestNames.filter(guestName => 
    state.weddingDayAttendance[guestName] === 'will'
  ).map(name => ({ name, checked: true }));

  const afterPartyGuests = allGuestNames.filter(guestName => 
    state.afterPartyAttendance[guestName] === 'will'
  ).map(name => ({ name, checked: true }));

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#fff]" style={{ fontFamily: 'Montserrat, Arial, Helvetica, sans-serif' }}>
      <div className="flex flex-col items-center w-full pt-10 pb-4 md:pb-8">
        <div className="w-full max-w-[1000px] bg-white rounded-2xl border border-[#B7B7B7] p-0 shadow-md mx-auto z-10 relative mb-8 md:mb-12" style={{ minHeight: 700 }}>
          {/* Decorative Corners and Sparkles */}
          <Image src="/images/invitation/leaf_left.png" alt="leaf left" width={180} height={180} className="absolute left-0 top-0 z-0" style={{ pointerEvents: 'none' }} />
          <Image src="/images/invitation/sparkle_left.png" alt="sparkle left" width={180} height={40} className="absolute left-5 top-0 z-0" style={{ pointerEvents: 'none' }} />
          <Image src="/images/invitation/leaf_right.png" alt="leaf right" width={180} height={180} className="absolute right-0 bottom-0 z-0" style={{ pointerEvents: 'none' }} />
          <Image src="/images/invitation/sparkle_right.png" alt="sparkle right" width={200} height={40} className="absolute right-5 bottom-10 z-0" style={{ pointerEvents: 'none' }} />

          {/* Main Content */}
          <div className="w-full max-w-[600px] mx-auto flex flex-col items-center mb-8 mt-2 z-10 px-4 sm:px-8 pt-10 sm:pt-16 pb-8">
            <div className="text-center w-full mb-2">
              <span className="text-sm sm:text-base md:text-lg" style={{ color: '#08080A', fontWeight: 400, fontFamily: 'Montserrat', letterSpacing: '0.01em' }}>
                All Set! Here's what we sent Lucas & Mia.
              </span>
              <div className="w-24 h-[2px] bg-[#B7B7B7] mx-auto my-4" />
              <span className="text-sm sm:text-base md:text-lg" style={{ color: '#08080A', fontWeight: 400, fontFamily: 'Montserrat', letterSpacing: '0.01em' }}>
                Your RSVP Response
              </span>
            </div>
            {/* RSVP Summary */}
            <div className="w-full flex flex-col items-center mt-8 mb-8 gap-8">
              {/* Wedding Day */}
              <div className="flex flex-col items-center">
                <span className="font-semibold text-base sm:text-lg mb-2" style={{ fontFamily: 'Montserrat', color: '#08080A' }}>Wedding Day</span>
                <div className="flex flex-col items-start">
                  {weddingDayGuests.length > 0 ? (
                    weddingDayGuests.map((guest) => (
                      <div key={guest.name} className="flex items-center text-sm sm:text-base mb-1" style={{ fontFamily: 'Montserrat', color: '#08080A' }}>
                        <span className="mr-2">✓</span>
                        {guest.name}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 italic">No guests attending</div>
                  )}
                </div>
              </div>
              {/* After Day Party */}
              <div className="flex flex-col items-center">
                <span className="font-semibold text-base sm:text-lg mb-2" style={{ fontFamily: 'Montserrat', color: '#08080A' }}>Wedding After Day Party</span>
                <div className="flex flex-col items-start">
                  {afterPartyGuests.length > 0 ? (
                    afterPartyGuests.map((guest) => (
                      <div key={guest.name} className="flex items-center text-sm sm:text-base mb-1" style={{ fontFamily: 'Montserrat', color: '#08080A' }}>
                        <span className="mr-2">✓</span>
                        {guest.name}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 italic">No guests attending</div>
                  )}
                </div>
              </div>
            </div>
            {/* Thank You */}
            <div className="w-full flex flex-col items-center mt-8">
              <span className="text-4xl sm:text-5xl md:text-6xl" style={{ fontFamily: 'Sail, cursive', fontWeight: 400, color: '#08080A', letterSpacing: '0.5px', lineHeight: 1.1 }}>
                Thank You
              </span>
            </div>
          </div>
        </div>
      </div>
     
    </div>
  );
} 