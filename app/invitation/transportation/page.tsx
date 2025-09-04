"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useInvitation } from '@/components/invitation-context';

export default function TransportationPage() {
  const { state, dispatch } = useInvitation();
  const [transportation, setTransportation] = useState<{ [guestName: string]: 'Yes' | 'No' }>({});
  const router = useRouter();

  // Memoize guest names to prevent infinite loops
  const guests = useMemo(() => {
    const names = [state.mainGuest.name, ...state.additionalGuests.map(g => g.name)];
    return names.filter(name => name.trim() !== '');
  }, [state.mainGuest.name, state.additionalGuests]);

  // Initialize transportation state when guests change
  useEffect(() => {
    const initialTransportation: { [guestName: string]: 'Yes' | 'No' } = {};
    guests.forEach(guestName => {
      if (guestName.trim()) {
        initialTransportation[guestName] = state.transportationNeeded[guestName] || 'No';
      }
    });
    setTransportation(initialTransportation);
  }, [guests, state.transportationNeeded]);

  const handleSelect = (guestName: string, value: 'Yes' | 'No') => {
    const newTransportation = { ...transportation, [guestName]: value };
    setTransportation(newTransportation);
    dispatch({ type: 'SET_TRANSPORTATION_NEEDED', payload: newTransportation });
  };

  const handleContinue = () => {
    // Save transportation data to context
    dispatch({ type: 'SET_TRANSPORTATION_NEEDED', payload: transportation });
    router.push('/invitation/note');
  };

  if (guests.length === 0) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#fff]">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">No guests found</h1>
          <p className="text-gray-600">Please go back and add guest information first.</p>
          <button
            onClick={() => router.push('/invitation')}
            className="mt-4 bg-[#08080A] text-white px-6 py-2 rounded-md hover:bg-[#C18037] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#fff]" style={{ fontFamily: 'Montserrat, Arial, Helvetica, sans-serif' }}>
      <div className="flex flex-col items-center justify-center flex-1 py-12">
        <div className="relative w-full max-w-[900px] bg-white rounded-2xl border border-[#B7B7B7] p-0 shadow-md mx-auto z-10" style={{ minHeight: 700 }}>
          {/* Decorative Corners and Sparkles (inside card) */}
          <Image src="/images/invitation/leaf_left.png" alt="leaf left" width={180} height={180} className="absolute left-0 top-0 z-0" style={{ pointerEvents: 'none' }} />
          <Image src="/images/invitation/sparkle_left.png" alt="sparkle left" width={180} height={40} className="absolute left-5 top-0 z-0" style={{ pointerEvents: 'none' }} />
          <Image src="/images/invitation/leaf_right.png" alt="leaf right" width={180} height={180} className="absolute right-0 bottom-0 z-0" style={{ pointerEvents: 'none' }} />
          <Image src="/images/invitation/sparkle_right.png" alt="sparkle right" width={200} height={40} className="absolute right-5 bottom-10 z-0" style={{ pointerEvents: 'none' }} />

          {/* Main Content */}
          <div className="w-full max-w-[1200px] mx-auto flex flex-col items-center mb-8 mt-2 z-10 px-16 pt-12 pb-8">
            <div className="text-center w-full mb-10">
              <div className="flex flex-col items-center">
                <span className="text-3xl md:text-4xl" style={{ fontFamily: 'Sail, cursive', fontWeight: 400, color: '#E5B574', letterSpacing: '0.5px', lineHeight: 1.1 }}>Do You Need Transportation</span>
                <span className="text-3xl md:text-4xl" style={{ fontFamily: 'Sail, cursive', fontWeight: 400, color: '#08080A', letterSpacing: '0.5px', lineHeight: 1.1, fontStyle: 'italic', marginTop: '0.5rem' }}>To Our Wedding Day?</span>
                <div className="w-24 h-[2px] bg-[#B7B7B7] mx-auto my-4" />
              </div>
            </div>
            {/* Guest Transportation Selection */}
            <div className="w-full max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-8 mb-12">
              {guests.map((guestName, idx) => (
                <div key={guestName} className={`flex flex-col w-full items-${idx % 2 === 0 ? 'start' : 'end'}`}>
                  <div className={`text-sm md:text-base text-[#08080A] uppercase mb-2 ${idx % 2 === 0 ? '' : 'text-right'}`} style={{ fontFamily: 'Montserrat', letterSpacing: '0.5px' }}>{guestName}</div>
                  <div className={`flex flex-row gap-4 w-full ${idx % 2 === 0 ? '' : 'justify-end'}`}>
                    {['Yes', 'No'].map(option => (
                      <button
                        key={option}
                        className={`w-full py-3 rounded-md text-base transition-colors focus:outline-none ${transportation[guestName] === option ? 'bg-[#08080A] text-white' : 'bg-[#F5F5F5] text-[#08080A]'}`}
                        style={{ fontFamily: 'Montserrat', fontSize: '15px' }}
                        onClick={() => handleSelect(guestName, option as 'Yes' | 'No')}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {/* Continue Button */}
            <button
              className="w-full max-w-md bg-[#08080A] text-white py-5 rounded-md font-semibold text-lg mt-8 hover:bg-[#222] transition-colors focus:outline-none"
              style={{ fontFamily: 'Montserrat', marginTop: '5rem'}}
              onClick={handleContinue}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 