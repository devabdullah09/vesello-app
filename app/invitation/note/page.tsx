"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useInvitation } from '@/components/invitation-context';

export default function NotePage() {
  const { state, dispatch } = useInvitation();
  const [notes, setNotes] = useState<{ [guestName: string]: string }>({});
  const router = useRouter();

  // Memoize guest names to prevent infinite loops
  const guests = useMemo(() => {
    const names = [state.mainGuest.name, ...state.additionalGuests.map(g => g.name)];
    return names.filter(name => name.trim() !== '');
  }, [state.mainGuest.name, state.additionalGuests]);

  // Initialize notes state when guests change
  useEffect(() => {
    const initialNotes: { [guestName: string]: string } = {};
    guests.forEach(guestName => {
      if (guestName.trim()) {
        initialNotes[guestName] = state.notes[guestName] || '';
      }
    });
    setNotes(initialNotes);
  }, [guests, state.notes]);

  const handleNoteChange = (guestName: string, value: string) => {
    const newNotes = { ...notes, [guestName]: value };
    setNotes(newNotes);
    dispatch({ type: 'SET_NOTES', payload: newNotes });
  };

  const handleContinue = () => {
    // Save notes data to context
    dispatch({ type: 'SET_NOTES', payload: notes });
    router.push('/invitation/confirmation');
  };

  const handleSkip = () => {
    // Save notes data to context
    dispatch({ type: 'SET_NOTES', payload: notes });
    router.push('/invitation/confirmation');
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
          <div className="w-full max-w-[900px] mx-auto flex flex-col items-center mb-8 mt-2 z-10 px-16 pt-12 pb-8">
            <div className="text-center w-full mb-6">
              <div className="flex flex-col items-center">
                <span className="text-4xl md:text-5xl" style={{ fontFamily: 'Sail, cursive', fontWeight: 400, color: '#E5B574', letterSpacing: '0.5px', lineHeight: 1.1 }}>Send A Note</span>
                <span className="text-3xl md:text-4xl" style={{ fontFamily: 'Sail, cursive', fontWeight: 400, color: '#08080A', letterSpacing: '0.5px', lineHeight: 1.1, fontStyle: 'italic', marginTop: '.5rem' }}>To The Couple</span>
                <div className="w-24 h-[2px] bg-[#B7B7B7] mx-auto my-4" />
              </div>
            </div>
            {/* Guest Notes */}
            <div className="w-full max-w-[900px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 mb-12 mt-2">
              {guests.map((guestName, idx) => (
                <div key={guestName} className="flex flex-col items-center w-full">
                  <div className={`text-sm md:text-base text-[#08080A] uppercase mb-2 text-left w-full ${idx % 2 === 1 ? 'text-right' : ''}`} style={{ fontFamily: 'Montserrat', letterSpacing: '0.5px' }}>{guestName}</div>
                  <textarea
                    className="w-full h-32 rounded-md border border-[#B7B7B7] bg-[#F5F5F5] p-4 text-base focus:outline-none focus:border-[#E5B574] resize-none"
                    style={{ fontFamily: 'Montserrat', fontSize: '15px' }}
                    value={notes[guestName] || ''}
                    onChange={e => handleNoteChange(guestName, e.target.value)}
                    placeholder="Write your message here..."
                  />
                </div>
              ))}
            </div>
            {/* Continue & Skip Buttons */}
            <div className="w-full flex flex-col gap-4 justify-center mt-4 max-w-md mx-auto">
              <button
                className="w-full bg-[#08080A] text-white py-5 rounded-md text-lg hover:bg-[#222] transition-colors focus:outline-none"
                style={{ fontFamily: 'Montserrat' }}
                onClick={handleContinue}
              >
                Continue
              </button>
              <button
                className="w-full bg-[#08080A] text-white py-5 rounded-md text-lg hover:bg-[#222] transition-colors focus:outline-none"
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