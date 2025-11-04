"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { useInvitation } from '@/components/invitation-context';
import { useInvitationFlow } from '@/hooks/use-invitation-flow';
import { useLanguage } from '@/components/language-context';
import EventHeader from '@/components/layout/EventHeader';
import EventFooter from '@/components/layout/EventFooter';

export default function DynamicAttendancePage() {
  const params = useParams();
  const wwwId = params?.wwwId as string;
  const { state, dispatch } = useInvitation();
  const { t } = useLanguage();
  const [attendance, setAttendance] = useState<{ [guestName: string]: 'will' | 'cant' }>({});
  const [eventData, setEventData] = useState<{coupleNames: string, eventDate: string, venue: string, galleryEnabled: boolean, rsvpEnabled: boolean} | null>(null);
  const router = useRouter();
  const { customQuestions, navigateToNextStep } = useInvitationFlow(wwwId || '');

  // Fetch event data
  useEffect(() => {
    if (wwwId) {
      fetchEventData();
    }
  }, [wwwId]);

  const fetchEventData = async () => {
    try {
      const response = await fetch(`/api/${wwwId}`);
      if (response.ok) {
        const result = await response.json();
        setEventData({
          coupleNames: result.data.coupleNames,
          eventDate: result.data.eventDate,
          venue: result.data.venue,
          galleryEnabled: result.data.galleryEnabled,
          rsvpEnabled: result.data.rsvpEnabled
        });
      }
    } catch (error) {
      console.error('Error fetching event data:', error);
    }
  };

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
        initialAttendance[guestName] = state.weddingDayAttendance[guestName] || 'will';
      }
    });
    setAttendance(initialAttendance);
  }, [guests, state.weddingDayAttendance]);

  const handleSelect = (guestName: string, value: 'will' | 'cant') => {
    const newAttendance = { ...attendance, [guestName]: value };
    setAttendance(newAttendance);
    dispatch({ type: 'SET_WEDDING_ATTENDANCE', payload: newAttendance });
  };

  const handleContinue = () => {
    // Save attendance data to context
    dispatch({ type: 'SET_WEDDING_ATTENDANCE', payload: attendance });
    // Use dynamic navigation to include custom questions
    navigateToNextStep('attendance');
  };

  if (guests.length === 0) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#fff]">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">No guests found</h1>
          <p className="text-gray-600">Please go back and add guest information first.</p>
          <button
            onClick={() => router.push(`/${wwwId}/invitation`)}
            className="mt-4 bg-[#08080A] text-white px-6 py-2 rounded-md hover:bg-[#C18037] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <EventHeader 
        eventId={wwwId}
        galleryEnabled={eventData?.galleryEnabled || false}
        rsvpEnabled={eventData?.rsvpEnabled || false}
        currentPage="rsvp"
      />
      <div className="min-h-screen flex flex-col justify-between bg-[#fff] pt-20" style={{ fontFamily: 'Montserrat, Arial, Helvetica, sans-serif' }}>
      {/* Main Content Centered */}
      <div className="flex flex-col items-center justify-center flex-1 py-8 md:py-12 px-4">
        <div className="relative w-full max-w-[1000px] bg-white rounded-2xl border border-[#B7B7B7] p-0 shadow-md mx-auto z-10" style={{ minHeight: 700 }}>
          {/* Decorative Corners and Sparkles (inside card) */}
          <Image src="/images/invitation/leaf_left.png" alt="leaf left" width={180} height={180} className="absolute left-0 top-0 z-0 hidden md:block" style={{ pointerEvents: 'none' }} />
          <Image src="/images/invitation/sparkle_left.png" alt="sparkle left" width={180} height={40} className="absolute left-5 top-0 z-0 hidden md:block" style={{ pointerEvents: 'none' }} />
          <Image src="/images/invitation/leaf_right.png" alt="leaf right" width={180} height={180} className="absolute right-0 bottom-0 z-0 hidden md:block" style={{ pointerEvents: 'none' }} />
          <Image src="/images/invitation/sparkle_right.png" alt="sparkle right" width={200} height={40} className="absolute right-5 bottom-10 z-0 hidden md:block" style={{ pointerEvents: 'none' }} />

          {/* Main Content */}
          <div className="w-full max-w-[700px] mx-auto flex flex-col items-center mb-8 mt-2 z-10 px-4 md:px-16 pt-8 md:pt-12 pb-8">
            <div className="text-center w-full">
              <div className="text-3xl md:text-4xl lg:text-5xl" style={{ fontFamily: 'Great Vibes, cursive', fontWeight: 500, color: '#08080A', letterSpacing: '0.5px', lineHeight: 1.1 }}>
                {t.invitation.weddingDay}
              </div>
              {/* Horizontal Divider */}
              <div className="w-24 h-[2px] bg-[#B7B7B7] mx-auto my-4" />
              <div className="text-sm md:text-base lg:text-lg mb-8 md:mb-12 tracking-normal" style={{ color: '#08080A', fontWeight: 400, fontFamily: 'Montserrat', letterSpacing: '0.01em' }}>
                {eventData?.eventDate ? new Date(eventData.eventDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }) : 'Loading...'}
              </div>
            </div>

            {/* Guest List Grid */}
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-x-4 md:gap-x-6 gap-y-4 md:gap-y-6 mb-8 md:mb-12 mt-2">
              {guests.map((guestName) => (
                <React.Fragment key={guestName}>
                  <div className="flex items-center justify-center md:justify-end pr-0 md:pr-2">
                    <span className="font-semibold text-sm md:text-base text-[#08080A] uppercase text-center md:text-left" style={{ fontFamily: 'Montserrat', minWidth: 140, letterSpacing: '0.5px' }}>{guestName}</span>
                  </div>
                  <button
                    className={`w-full py-3 rounded-md text-sm md:text-base transition-colors focus:outline-none ${attendance[guestName] === 'will' ? 'bg-[#08080A] text-white' : 'bg-[#F5F5F5] text-[#08080A]'}`}
                    style={{ fontFamily: 'Montserrat' }}
                    onClick={() => handleSelect(guestName, 'will')}
                  >
                    {t.invitation.willAttend}
                  </button>
                  <button
                    className={`w-full py-3 rounded-md text-sm md:text-base transition-colors focus:outline-none ${attendance[guestName] === 'cant' ? 'bg-[#08080A] text-white' : 'bg-[#F5F5F5] text-[#08080A]'}`}
                    style={{ fontFamily: 'Montserrat' }}
                    onClick={() => handleSelect(guestName, 'cant')}
                  >
                    {t.invitation.cantAttend}
                  </button>
                </React.Fragment>
              ))}
            </div>

            {/* Continue Button */}
            <button
              className="w-full max-w-md bg-[#08080A] text-white py-4 md:py-5 rounded-md font-semibold text-base md:text-lg mt-6 md:mt-8 hover:bg-[#222] transition-colors focus:outline-none"
              style={{ fontFamily: 'Montserrat' }}
              onClick={handleContinue}
            >
              {t.invitation.continue}
            </button>
          </div>
        </div>
      </div>
   
      {/* Event Footer */}
      <div className="mt-auto">
        <EventFooter />
      </div>
    </div>
    </>
  );
}
