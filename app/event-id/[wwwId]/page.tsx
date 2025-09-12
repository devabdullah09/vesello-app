"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import TimelineSection from "@/components/sections/TimelineSection";
import CeremonySection from "@/components/sections/CeremonySection";
import CeremonyVenueSection from "@/components/sections/CeremonyVenueSection";
import SeatingChartSection from "@/components/sections/SeatingChartSection";
import MenuSection from "@/components/sections/MenuSection";
import WishesAndGiftsSection from "@/components/sections/WishesAndGiftsSection";
import TeamSection from "@/components/sections/TeamSection";
import AccommodationSection from "@/components/sections/AccommodationSection";
import TransportationSection from "@/components/sections/TransportationSection";
import AdditionalInfoSection from "@/components/sections/AdditionalInfoSection";
import DynamicRSVPSection from "@/components/sections/DynamicRSVPSection";

interface EventData {
  id: string;
  wwwId: string;
  title: string;
  coupleNames: string;
  eventDate: string;
  venue?: string;
  description?: string;
  galleryEnabled: boolean;
  rsvpEnabled: boolean;
  status: string;
  sectionVisibility: {
    heroSection: boolean;
    timelineSection: boolean;
    ceremonySection: boolean;
    ceremonyVenueSection: boolean;
    seatingChartSection: boolean;
    menuSection: boolean;
    wishesAndGiftsSection: boolean;
    teamSection: boolean;
    accommodationSection: boolean;
    transportationSection: boolean;
    additionalInfoSection: boolean;
  };
}

export default function PublicEventPage() {
  const params = useParams();
  const wwwId = params.wwwId as string;
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!wwwId) {
      setError('Invalid event link');
      setLoading(false);
      return;
    }

    fetchEventData();
  }, [wwwId]);

  useEffect(() => {
    if (eventData) {
      // Calculate countdown to event date
      const eventDate = new Date(eventData.eventDate);
      const now = new Date();
      const timeDiff = eventDate.getTime() - now.getTime();

      if (timeDiff > 0) {
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });

        // Update countdown every second
        const timer = setInterval(() => {
          const now = new Date();
          const timeDiff = eventDate.getTime() - now.getTime();

          if (timeDiff > 0) {
            const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

            setTimeLeft({ days, hours, minutes, seconds });
          } else {
            setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            clearInterval(timer);
          }
        }, 1000);

        return () => clearInterval(timer);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }
  }, [eventData]);

  const fetchEventData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/event-id/${wwwId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Event not found');
        }
        throw new Error('Failed to load event');
      }

      const result = await response.json();
      setEventData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E5B574] mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Event Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            href="/"
            className="bg-[#E5B574] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#D59C58] transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (!eventData) {
    return null;
  }

  return (
    <main>
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Sail&family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      
      {/* Header Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src="/images/logo.png"
                alt="Vasello"
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="text-xl font-bold text-gray-800">Vasello</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/" className="text-gray-600 hover:text-[#E5B574] transition-colors">
                Home
              </Link>
              {eventData.galleryEnabled && (
                <Link href={`/event-id/${wwwId}/gallery`} className="text-gray-600 hover:text-[#E5B574] transition-colors">
                  Gallery
                </Link>
              )}
              {eventData.rsvpEnabled && (
                <Link href={`/event-id/${wwwId}/rsvp`} className="text-gray-600 hover:text-[#E5B574] transition-colors">
                  Reply to Invitation
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Dynamic Data */}
      <div className="relative w-full overflow-hidden bg-white pt-16">
        <div className="flex flex-col md:flex-row h-full min-h-[420px] md:min-h-[420px]">
          {/* Left side content */}
          <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-8 md:px-16 py-6 sm:py-8 md:py-8 z-20">
            {/* Names in elegant box */}
            <div className="border border-black px-4 sm:px-6 md:px-8 py-2 sm:py-3 mb-4 sm:mb-6 inline-block" 
                 style={{ 
                   fontFamily: 'Sail', 
                   fontSize: 'clamp(1.5rem, 5vw, 2.2rem)', 
                   letterSpacing: '0.02em' 
                 }}>
              {eventData.coupleNames}
            </div>
            
            {/* Save The Date */}
            <div className="mb-2">
              <h2
                className="font-normal mb-1"
                style={{
                  fontFamily: 'Sail',
                  background: 'linear-gradient(90deg, #E5B574 0%, #C18037 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'inline-block',
                  letterSpacing: '1px',
                  lineHeight: 1.1,
                  fontSize: 'clamp(1.8rem, 6vw, 2.7rem)',
                }}
              >
                Save The Date
              </h2>
            </div>

            {/* Countdown Timer */}
            <div className="mb-6 sm:mb-8">
              <p className="text-black font-semibold tracking-[0.12em]" 
                 style={{ 
                   fontFamily: 'Montserrat', 
                   letterSpacing: '0.12em',
                   fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)'
                 }}>
                WE'RE GETTING MARRIED!
              </p>
            </div>

            <div className="flex gap-2 sm:gap-3 md:gap-4 mb-2">
              {[
                { value: timeLeft.days, label: 'DAYS' },
                { value: timeLeft.hours, label: 'HOURS' },
                { value: timeLeft.minutes, label: 'MINUTES' },
                { value: timeLeft.seconds, label: 'SECONDS' },
              ].map((item, idx) => (
                <div key={item.label} className="text-center">
                  <div
                    className="font-bold py-2 sm:py-3 px-3 sm:px-4 md:px-5 rounded mb-1 sm:mb-2"
                    style={{
                      background: 'linear-gradient(90deg, #E5B574 0%, #C18037 100%)',
                      color: 'white',
                      minWidth: 'clamp(48px, 12vw, 64px)',
                      fontFamily: 'Montserrat',
                      fontSize: 'clamp(1rem, 3vw, 1.5rem)',
                    }}
                  >
                    {String(item.value).padStart(2, '0')}
                  </div>
                  <div className="text-black font-semibold tracking-wide" 
                       style={{ 
                         fontFamily: 'Montserrat',
                         fontSize: 'clamp(0.625rem, 1.5vw, 0.875rem)'
                       }}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right side image */}
          <div className="flex-2 flex items-center justify-center">
            <img
              src="/images/herosection.png"
              alt="Wedding couple"
              className="w-full h-full object-cover object-center max-h-[420px] img-responsive"
              style={{ maxWidth: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* All the wedding sections - conditionally rendered based on sectionVisibility */}
      {eventData.sectionVisibility.timelineSection && <TimelineSection />}
      {eventData.sectionVisibility.ceremonySection && <CeremonySection />}
      {eventData.sectionVisibility.ceremonyVenueSection && <CeremonyVenueSection />}
      {eventData.sectionVisibility.seatingChartSection && <SeatingChartSection />}
      {eventData.sectionVisibility.menuSection && <MenuSection />}
      {eventData.sectionVisibility.wishesAndGiftsSection && <WishesAndGiftsSection />}
      {eventData.sectionVisibility.teamSection && <TeamSection />}
      {eventData.sectionVisibility.accommodationSection && <AccommodationSection />}
      {eventData.sectionVisibility.transportationSection && <TransportationSection />}
      {eventData.sectionVisibility.additionalInfoSection && <AdditionalInfoSection />}
      
      {/* Dynamic RSVP Section - Only shows if RSVP is enabled */}
      <DynamicRSVPSection
        eventId={eventData.id}
        wwwId={eventData.wwwId}
        coupleNames={eventData.coupleNames}
        eventDate={eventData.eventDate}
        venue={eventData.venue}
        rsvpEnabled={eventData.rsvpEnabled}
      />
    </main>
  );
}
