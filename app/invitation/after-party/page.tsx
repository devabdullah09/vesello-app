"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useInvitation } from '@/components/invitation-context';

export default function AfterPartyAttendancePage() {
  const { state, dispatch } = useInvitation();
  const [attendance, setAttendance] = useState<{ [guestName: string]: 'will' | 'cant' }>({});
  const router = useRouter();

  // Memoize guest names to prevent infinite loops
  const guests = useMemo(() => {
    const names = [state.mainGuest.name, ...state.additionalGuests.map(g => g.name)];
    return names.filter(name => name.trim() !== '');
  }, [state.mainGuest.name, state.additionalGuests]);

  // Initialize attendance state when guests change
  useEffect(() => {
    const initialAttendance: { [guestName: string]: 'will' | 'cant' } = {};
    guests.forEach(guestName => {
      if (guestName.trim()) {
        initialAttendance[guestName] = state.afterPartyAttendance[guestName] || 'will';
      }
    });
    setAttendance(initialAttendance);
  }, [guests, state.afterPartyAttendance]);

  const handleSelect = (guestName: string, value: 'will' | 'cant') => {
    const newAttendance = { ...attendance, [guestName]: value };
    setAttendance(newAttendance);
    dispatch({ type: 'SET_AFTER_PARTY_ATTENDANCE', payload: newAttendance });
  };

  const handleContinue = () => {
    // Save attendance data to context
    dispatch({ type: 'SET_AFTER_PARTY_ATTENDANCE', payload: attendance });
    router.push('/invitation/food-selection');
  };

  const handleSkip = () => {
    // Save attendance data to context
    dispatch({ type: 'SET_AFTER_PARTY_ATTENDANCE', payload: attendance });
    router.push('/invitation/food-selection');
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
        <div className="relative w-full max-w-[1000px] bg-white rounded-2xl border border-[#B7B7B7] p-0 shadow-md mx-auto z-10" style={{ minHeight: 700 }}>
          {/* Decorative Corners and Sparkles (inside card) */}
          <Image src="/images/invitation/leaf_left.png" alt="leaf left" width={180} height={180} className="absolute left-0 top-0 z-0" style={{ pointerEvents: 'none' }} />
          <Image src="/images/invitation/sparkle_left.png" alt="sparkle left" width={180} height={40} className="absolute left-5 top-0 z-0" style={{ pointerEvents: 'none' }} />
          <Image src="/images/invitation/leaf_right.png" alt="leaf right" width={180} height={180} className="absolute right-0 bottom-0 z-0" style={{ pointerEvents: 'none' }} />
          <Image src="/images/invitation/sparkle_right.png" alt="sparkle right" width={200} height={40} className="absolute right-5 bottom-10 z-0" style={{ pointerEvents: 'none' }} />

          {/* Main Content */}
          <div className="w-full max-w-[700px] mx-auto flex flex-col items-center mb-8 mt-2 z-10 px-16 pt-12 pb-8">
            <div className="text-center w-full mb-2">
              <div className="flex flex-col items-center">
                <span className="text-3xl md:text-4xl" style={{ fontFamily: 'Sail, cursive', fontWeight: 400, color: '#E5B574', letterSpacing: '0.5px', lineHeight: 1.1 }}>Wedding After</span>
                <span className="text-4xl md:text-5xl" style={{ fontFamily: 'Sail, cursive', fontWeight: 400, color: '#08080A', letterSpacing: '0.5px', lineHeight: 1.1, marginTop: '-0.5rem' }}>Day Party</span>
              </div>
              <div className="w-24 h-[2px] bg-[#B7B7B7] mx-auto my-4" />
              <div className="text-base md:text-lg mb-12 tracking-normal" style={{ color: '#08080A', fontWeight: 400, fontFamily: 'Montserrat', letterSpacing: '0.01em' }}>
                Sunday, May 24, 2026
              </div>
            </div>
            {/* Guest List Grid */}
            <div className="w-full grid grid-cols-3 gap-x-6 gap-y-6 mb-12 mt-2">
              {guests.map((guestName) => (
                <React.Fragment key={guestName}>
                  <div className="flex items-center justify-end pr-2">
                    <span className="font-semibold text-sm md:text-base text-[#08080A] uppercase" style={{ fontFamily: 'Montserrat', minWidth: 140, letterSpacing: '0.5px' }}>{guestName}</span>
                  </div>
                  <button
                    className={`w-full py-3 rounded-md text-base transition-colors focus:outline-none ${attendance[guestName] === 'will' ? 'bg-[#08080A] text-white' : 'bg-[#F5F5F5] text-[#08080A]'}`}
                    style={{ fontFamily: 'Montserrat' }}
                    onClick={() => handleSelect(guestName, 'will')}
                  >
                    Will Attend
                  </button>
                  <button
                    className={`w-full py-3 rounded-md text-base transition-colors focus:outline-none ${attendance[guestName] === 'cant' ? 'bg-[#08080A] text-white' : 'bg-[#F5F5F5] text-[#08080A]'}`}
                    style={{ fontFamily: 'Montserrat' }}
                    onClick={() => handleSelect(guestName, 'cant')}
                  >
                    Can't Attend
                  </button>
                </React.Fragment>
              ))}
            </div>
            {/* Continue & Skip Buttons */}
            <div className="w-full flex flex-row gap-6 justify-center mt-4">
              <button
                className="w-full max-w-xs bg-[#08080A] text-white py-5 rounded-md text-lg hover:bg-[#222] transition-colors focus:outline-none"
                style={{ fontFamily: 'Montserrat' }}
                onClick={handleContinue}
              >
                Continue
              </button>
              <button
                className="w-full max-w-xs bg-[#08080A] text-white py-5 rounded-md text-lg hover:bg-[#222] transition-colors focus:outline-none"
                style={{ fontFamily: 'Montserrat' }}
                onClick={handleSkip}
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 