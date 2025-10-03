"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { useInvitation } from "@/components/invitation-context";
import EventHeader from "@/components/layout/EventHeader";

export default function DynamicConfirmationPage() {
  const params = useParams();
  const wwwId = params?.wwwId as string;
  const { state, dispatch } = useInvitation();
  const [sendEmail, setSendEmail] = useState(true);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [eventId, setEventId] = useState<string | null>(null);
  const [eventData, setEventData] = useState<{coupleNames: string, eventDate: string, venue: string, galleryEnabled: boolean, rsvpEnabled: boolean} | null>(null);
  const router = useRouter();

  // Load existing email data from context
  useEffect(() => {
    setEmail(state.email);
    setSendEmail(state.sendEmailConfirmation);
  }, [state.email, state.sendEmailConfirmation]);

  // Fetch the actual event ID and event data from the database
  useEffect(() => {
    const fetchEventData = async () => {
      if (!wwwId) return;
      
      try {
        const response = await fetch(`/api/event-id/${wwwId}`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.success && data.data) {
            setEventId(data.data.id);
            setEventData({
              coupleNames: data.data.coupleNames,
              eventDate: data.data.eventDate,
              venue: data.data.venue,
              galleryEnabled: data.data.galleryEnabled,
              rsvpEnabled: data.data.rsvpEnabled
            });
          }
        }
      } catch (error) {
        // Error fetching event data
      }
    };

    fetchEventData();
  }, [wwwId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (sendEmail && !email.trim()) {
      setError("Please enter your email address");
      return;
    }

    // Temporarily use wwwId directly for testing
    const testEventId = eventId || wwwId;
    
    if (!testEventId) {
      setError("Loading event details, please try again in a moment");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Save email data to context
      dispatch({ type: 'SET_EMAIL', payload: email });
      dispatch({ type: 'SET_EMAIL_CONFIRMATION', payload: sendEmail });

      // Prepare RSVP data for submission
      const rsvpData = {
        eventId: testEventId,
        mainGuest: state.mainGuest,
        additionalGuests: state.additionalGuests.filter(guest => guest.name.trim() !== ''),
        weddingDayAttendance: state.weddingDayAttendance,
        afterPartyAttendance: state.afterPartyAttendance,
        foodPreferences: state.foodPreferences,
        accommodationNeeded: state.accommodationNeeded,
        transportationNeeded: state.transportationNeeded,
        notes: state.notes,
        customResponses: state.customResponses,
        email: sendEmail ? email : "",
        sendEmailConfirmation: sendEmail,
      };

      // Submit RSVP to backend
      const response = await fetch('/api/invitation/rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rsvpData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to submit RSVP: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Redirect to response summary page
        router.push(`/event-id/${wwwId}/invitation/response`);
      } else {
        setError(result.error || 'Failed to submit RSVP');
      }
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to submit RSVP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <EventHeader 
        eventId={wwwId}
        galleryEnabled={eventData?.galleryEnabled || false}
        rsvpEnabled={eventData?.rsvpEnabled || false}
        currentPage="rsvp"
      />
      <div className="min-h-screen flex flex-col justify-between bg-[#fff] pt-20" style={{ fontFamily: 'Montserrat, Arial, Helvetica, sans-serif' }}>
      {/* Header */}
      <div className="flex flex-col items-center w-full pt-10 pb-4 md:pb-8">
        <div className="w-full max-w-[1000px] bg-white rounded-2xl border border-[#B7B7B7] p-0 shadow-md mx-auto z-10 relative mb-8 md:mb-12" style={{ minHeight: 700 }}>
          {/* Decorative Corners and Sparkles */}
          <Image src="/images/invitation/leaf_left.png" alt="leaf left" width={180} height={180} className="absolute left-0 top-0 z-0" style={{ pointerEvents: 'none' }} />
          <Image src="/images/invitation/sparkle_left.png" alt="sparkle left" width={180} height={40} className="absolute left-5 top-0 z-0" style={{ pointerEvents: 'none' }} />
          <Image src="/images/invitation/leaf_right.png" alt="leaf right" width={180} height={180} className="absolute right-0 bottom-0 z-0" style={{ pointerEvents: 'none' }} />
          <Image src="/images/invitation/sparkle_right.png" alt="sparkle right" width={200} height={40} className="absolute right-5 bottom-10 z-0" style={{ pointerEvents: 'none' }} />

          {/* Main Content */}
          <div className="w-full max-w-[600px] mx-auto flex flex-col items-center mb-8 mt-2 z-10 px-4 sm:px-8 pt-10 sm:pt-16 pb-8">
            <div className="text-center w-full mb-6">
              <span className="text-3xl sm:text-4xl md:text-5xl" style={{ fontFamily: 'Sail, cursive', fontWeight: 400, color: '#08080A', letterSpacing: '0.5px', lineHeight: 1.1 }}>Last Step!</span>
              <div className="w-full flex flex-col items-center mt-2">
                <span className="text-sm sm:text-base md:text-lg mt-2 mb-2 tracking-normal" style={{ color: '#08080A', fontWeight: 400, fontFamily: 'Montserrat', letterSpacing: '0.01em' }}>
                  Send Your RSVP To {eventData?.coupleNames || 'Loading...'}'s Wedding
                </span>
                <div className="w-24 h-[2px] bg-[#B7B7B7] mx-auto my-2" />
              </div>
            </div>
            
            {error && (
              <div className="w-full mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSend} className="w-full flex flex-col items-center gap-6">
              <div className="flex items-center w-full justify-center mb-2">
                <input
                  id="sendEmail"
                  type="checkbox"
                  checked={sendEmail}
                  onChange={() => setSendEmail(!sendEmail)}
                  className="mr-2 accent-[#08080A]"
                  style={{ width: 16, height: 16 }}
                />
                <label htmlFor="sendEmail" className="text-sm sm:text-base text-[#08080A]" style={{ fontFamily: 'Montserrat' }}>
                  Send me an RSVP confirmation by email
                </label>
              </div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#F5F5F5] border border-[#B7B7B7] rounded-md p-4 text-sm sm:text-base focus:outline-none focus:border-[#E5B574]"
                style={{ fontFamily: 'Montserrat', fontSize: '15px' }}
                disabled={!sendEmail}
                required={sendEmail}
              />
              <div className="w-full flex flex-col gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting || !eventId}
                  className="w-full bg-[#08080A] text-white py-4 sm:py-5 rounded-md text-base sm:text-lg hover:bg-[#222] transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'Montserrat' }}
                >
                  {isSubmitting ? 'Submitting...' : !eventId ? 'Loading...' : 'Send RSVP'}
                </button>
                {/* <button
                  type="button"
                  onClick={() => {
                    // Save email data to context even when skipping
                    dispatch({ type: 'SET_EMAIL', payload: email });
                    dispatch({ type: 'SET_EMAIL_CONFIRMATION', payload: sendEmail });
                    // Skip to response page
                    router.push(`/event-id/${wwwId}/invitation/response`);
                  }}
                  className="w-full bg-[#E5B574] text-[#08080A] py-4 sm:py-5 rounded-md text-base sm:text-lg hover:bg-[#D4A463] transition-colors focus:outline-none"
                  style={{ fontFamily: 'Montserrat' }}
                >
                  Skip & Continue
                </button> */}
              </div>
            </form>
            <div className="w-full flex flex-col items-center mt-8">
              <a href="#" className="text-xs sm:text-sm text-[#08080A] underline hover:text-[#E5B574]" style={{ fontFamily: 'Montserrat' }}>
                View Our Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </div>
      
    </div>
    </>
  );
}
