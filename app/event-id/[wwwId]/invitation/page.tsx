"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Trash } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useInvitation } from "@/components/invitation-context";
import EventHeader from "@/components/layout/EventHeader";

const childAges = [
  "1 Year Old",
  "2 Year Old",
  "3 Year Old",
  "4 Year Old",
  "5 Year Old",
  "6 Year Old",
  "7 Year Old",
  "8 Year Old",
  "9 Year Old",
  "10 Year Old",
];

export default function DynamicInvitationReplyPage() {
  const params = useParams();
  const wwwId = params?.wwwId as string;
  const { state, dispatch } = useInvitation();
  const [mainGuest, setMainGuest] = useState({ name: "", surname: "", isChild: false });
  const [eventData, setEventData] = useState<{coupleNames: string, eventDate: string, venue: string, galleryEnabled: boolean, rsvpEnabled: boolean} | null>(null);
  const [guests, setGuests] = useState<{ name: string; surname: string; isChild: boolean; age?: string }[]>([
    { name: "", surname: "", isChild: true, age: childAges[1] },
    { name: "", surname: "", isChild: true, age: childAges[1] },
    { name: "", surname: "", isChild: false, age: "" },
  ]);
  const router = useRouter();

  // Load existing data from context on component mount
  useEffect(() => {
    if (state.mainGuest.name || state.mainGuest.surname) {
      setMainGuest(state.mainGuest);
    }
    if (state.additionalGuests.length > 0) {
      setGuests(state.additionalGuests);
    }
    
    // Fetch event data
    if (wwwId) {
      fetchEventData();
    }
  }, [state.mainGuest, state.additionalGuests, wwwId]);

  const fetchEventData = async () => {
    try {
      const response = await fetch(`/api/event-id/${wwwId}`);
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

  const handleMainGuestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedGuest = { ...mainGuest, [e.target.name]: e.target.value };
    setMainGuest(updatedGuest);
    dispatch({ type: 'SET_MAIN_GUEST', payload: updatedGuest });
  };

  const handleGuestChange = (idx: number, field: string, value: string | boolean) => {
    const updatedGuests = guests.map((g, i) =>
      i === idx ? { ...g, [field]: value } : g
    );
    setGuests(updatedGuests);
    dispatch({ type: 'SET_ADDITIONAL_GUESTS', payload: updatedGuests });
  };

  const handleAddGuest = () => {
    const newGuests = [...guests, { name: "", surname: "", isChild: false, age: "" }];
    setGuests(newGuests);
    dispatch({ type: 'SET_ADDITIONAL_GUESTS', payload: newGuests });
  };

  const handleRemoveGuest = (idx: number) => {
    const newGuests = guests.filter((_, i) => i !== idx);
    setGuests(newGuests);
    dispatch({ type: 'SET_ADDITIONAL_GUESTS', payload: newGuests });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save current state to context
    dispatch({ type: 'SET_MAIN_GUEST', payload: mainGuest });
    dispatch({ type: 'SET_ADDITIONAL_GUESTS', payload: guests });
    
    // Navigate to next step
    router.push(`/event-id/${wwwId}/invitation/attendance`);
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
      <div className="flex-1 flex flex-col items-center justify-center py-16 relative">
        <div className="relative w-full max-w-3xl bg-white rounded-2xl border border-[#C7B299] p-8 md:p-12 shadow-md mx-auto z-10" style={{ minHeight: 700 }}>
          {/* Decorative Corners and Sparkles (inside card) */}
          <Image src="/images/invitation/leaf_left.png" alt="leaf left" width={180} height={180} className="absolute left-0 top-10 z-0" style={{ pointerEvents: 'none' }} />
          <Image src="/images/invitation/leaf_right.png" alt="leaf right" width={180} height={180} className="absolute right-0 bottom-10 z-0" style={{ pointerEvents: 'none' }} />
          <Image src="/images/invitation/sparkle_left.png" alt="sparkle left" width={120} height={40} className="absolute left-8 top-40 z-0" style={{ pointerEvents: 'none' }} />
          <Image src="/images/invitation/sparkle_right.png" alt="sparkle right" width={120} height={40} className="absolute right-8 bottom-40 z-0" style={{ pointerEvents: 'none' }} />

          {/* Main Content */}
          <div className="w-full flex flex-col items-center mb-8 mt-2 z-10">
            <div className="text-center">
              <div className="text-4xl md:text-5xl sail-font" style={{ fontWeight: 100, color: '#08080A', letterSpacing: '0.5px', lineHeight: 1.1 }}>
                {eventData?.coupleNames || 'Loading...'}
              </div>
              <div className="text-3xl md:text-4xl sail-font" style={{ background: 'linear-gradient(90deg, #E5B574 0%, #C18037 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 400, marginTop: '-8px', letterSpacing: '0.5px', lineHeight: 1.1 }}>
                Wedding
              </div>
              <div className="text-base md:text-lg mt-4 mb-2 tracking-widest" style={{ color: '#08080A', fontWeight: 200, fontFamily: 'Montserrat', letterSpacing: '0.35em' }}>
                {eventData?.eventDate ? new Date(eventData.eventDate).toLocaleDateString('en-GB').replace(/\//g, ' . ') : 'Loading...'}
              </div>
              <div className="text-2xl md:text-3xl mb-1" style={{ fontFamily: 'Montserrat',fontWeight: 200, color: '#08080A' }}>{eventData?.venue || 'Loading...'}</div>
              <div className="w-24 h-[1.5px] mx-auto my-4 bg-[#08080A]" />
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="relative z-10 flex flex-col items-center"
            style={{ width: '100%' }}
          >
            
              <div className="text-sm text-[#08080A] mb-7 text-center" style={{ fontFamily: 'Montserrat', fontWeight: 400 }}>
                If you're responding for you and a guest (or your family),<br />you'll be able to RSVP for your entire group.
              </div>

              
              {/* Main Guest Fields */}
              <div className="flex justify-between mb-6 w-full">
                <input
                  type="text"
                  name="name"
                  value={mainGuest.name}
                  onChange={handleMainGuestChange}
                  placeholder="Name"
                  className="bg-[#f6f6f6] rounded-md px-8 py-2 w-94 min-w-[330px] text-base border border-[#e0e0e0] focus:outline-none focus:ring-2 focus:ring-[#C18037] placeholder:text-[#bdbdbd]"
                  style={{ fontFamily: 'Montserrat' }}
                  required
                />
                <input
                  type="text"
                  name="surname"
                  value={mainGuest.surname}
                  onChange={handleMainGuestChange}
                  placeholder="Surname"
                  className="bg-[#f6f6f6] rounded-md px-8 py-2 w-64 min-w-[330px] text-base border border-[#e0e0e0] focus:outline-none focus:ring-2 focus:ring-[#C18037] placeholder:text-[#bdbdbd]"
                  style={{ fontFamily: 'Montserrat' }}
                  required
                />
              </div>
           

            <div className="w-full mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-lg font-semibold" style={{ fontFamily: 'Montserrat', color: '#08080A' }}>Add Plus Ones or Household</div>
                <div className="text-base font-normal text-[#08080A]" style={{ fontFamily: 'Montserrat' }}>Is it a child?</div>
              </div>
              <div className="flex flex-col gap-3">
                {guests.map((guest, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Name"
                      value={guest.name}
                      onChange={e => handleGuestChange(idx, "name", e.target.value)}
                      className="bg-[#f6f6f6] rounded-md px-8 py-2 w-40 min-w-[220px] text-base border border-[#e0e0e0] focus:outline-none focus:ring-2 focus:ring-[#C18037] placeholder:text-[#bdbdbd]"
                      style={{ fontFamily: 'Montserrat' }}
                    />
                    <input
                      type="text"
                      placeholder="Surname"
                      value={guest.surname}
                      onChange={e => handleGuestChange(idx, "surname", e.target.value)}
                      className="bg-[#f6f6f6] rounded-md px-8 py-2 w-40 min-w-[220px] text-base border border-[#e0e0e0] focus:outline-none focus:ring-2 focus:ring-[#C18037] placeholder:text-[#bdbdbd]"
                      style={{ fontFamily: 'Montserrat' }}
                    />
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex w-5 h-5 rounded-full border-2 items-center justify-center cursor-pointer ${guest.isChild ? 'border-[#C18037] bg-[#C18037]' : 'border-[#bdbdbd] bg-white'}`}
                        onClick={() => handleGuestChange(idx, "isChild", !guest.isChild)}
                        style={{ transition: 'all 0.2s' }}
                      >
                        {guest.isChild && <span className="block w-3 h-3 rounded-full bg-white" />}
                      </span>
                    </div>
                    {guest.isChild ? (
                      <select
                        value={guest.age}
                        onChange={e => handleGuestChange(idx, "age", e.target.value)}
                        className="bg-[#f6f6f6] rounded-md px-2 py-2 w-32 text-base border border-[#e0e0e0] focus:outline-none focus:ring-2 focus:ring-[#C18037] placeholder:text-[#bdbdbd]"
                        style={{ fontFamily: 'Montserrat' }}
                      >
                        <option value="">Age</option>
                        {childAges.map((age) => (
                          <option key={age} value={age}>{age}</option>
                        ))}
                      </select>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => handleRemoveGuest(idx)}
                      className="text-[#bdbdbd] hover:text-[#C18037] text-xl px-2 flex items-center"
                      aria-label="Remove guest"
                      style={{ background: 'none', border: 'none', padding: 0 }}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex w-full gap-4 mt-4">
              <button
                type="button"
                onClick={handleAddGuest}
                className="min-w-[220px] border border-[#C18037] text-[#08080A] rounded-md px-6 py-3 font-semibold hover:bg-[#f6f6f6] transition-colors"
                style={{ fontFamily: 'Montserrat' }}
              >
                Add Guests
              </button>
              <button
                type="submit"
                className="min-w-[220px] bg-[#08080A] text-white rounded-md px-6 py-3 font-semibold hover:bg-[#C18037] hover:text-white transition-colors"
                style={{ fontFamily: 'Montserrat' }}
              >
                Continue
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    </>
  );
}
