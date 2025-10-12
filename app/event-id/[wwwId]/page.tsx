"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useEvent } from "@/components/event-context";
import TimelineSection from "@/components/sections/TimelineSection";
import DynamicTimelineSection from "@/components/sections/DynamicTimelineSection";
import CeremonySection from "@/components/sections/CeremonySection";
import DynamicCeremonySection from "@/components/sections/DynamicCeremonySection";
import DynamicCeremonyVenueSection from "@/components/sections/DynamicCeremonyVenueSection";
import DynamicMenuSection from "@/components/sections/DynamicMenuSection";
import DynamicTeamSection from "@/components/sections/DynamicTeamSection";
import DynamicAdditionalInfoSection from "@/components/sections/DynamicAdditionalInfoSection";
import CeremonyVenueSection from "@/components/sections/CeremonyVenueSection";
import SeatingChartSection from "@/components/sections/SeatingChartSection";
import MenuSection from "@/components/sections/MenuSection";
import WishesAndGiftsSection from "@/components/sections/WishesAndGiftsSection";
import TeamSection from "@/components/sections/TeamSection";
import AccommodationSection from "@/components/sections/AccommodationSection";
import TransportationSection from "@/components/sections/TransportationSection";
import AdditionalInfoSection from "@/components/sections/AdditionalInfoSection";
import { AdminEditProvider } from "@/components/admin-edit-provider";
import AdminToggle from "@/components/inline-edit/AdminToggle";
import EventHeader from "@/components/layout/EventHeader";
import EditableSection from "@/components/inline-edit/EditableSection";
import HeroSectionEditor from "@/components/inline-edit/HeroSectionEditor";
import TimelineSectionEditor from "@/components/inline-edit/TimelineSectionEditor";
import CeremonySectionEditor from "@/components/inline-edit/CeremonySectionEditor";
import VenueSectionEditor from "@/components/inline-edit/VenueSectionEditor";
import MenuSectionEditor from "@/components/inline-edit/MenuSectionEditor";
import AdditionalInfoSectionEditor from "@/components/inline-edit/AdditionalInfoSectionEditor";
import TeamSectionEditor from "@/components/inline-edit/TeamSectionEditor";
import AccommodationSectionEditor from "@/components/inline-edit/AccommodationSectionEditor";
import TransportationSectionEditor from "@/components/inline-edit/TransportationSectionEditor";
import WishesAndGiftsSectionEditor from "@/components/inline-edit/WishesAndGiftsSectionEditor";
import SeatingChartSectionEditor from "@/components/inline-edit/SeatingChartSectionEditor";

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
  organizerId: string;
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
  sectionContent: {
    heroSection: {
      coupleNames: string;
      eventDate: string;
      venue?: string;
      customMessage?: string;
    };
    timelineSection: {
      title: string;
      events: Array<{
        id: string;
        time: string;
        title: string;
        description?: string;
        icon?: string;
      }>;
    };
    ceremonySection: {
      title: string;
      description: string;
      date: string;
      time: string;
      location: string;
      details?: string;
      mapUrl?: string;
    };
    ceremonyVenueSection: {
      title: string;
      venueName: string;
      address: string;
      description?: string;
      mapUrl?: string;
    };
    menuSection: {
      title: string;
      description?: string;
      courses: Array<{
        id: string;
        courseName: string;
        items: Array<{
          name: string;
          description?: string;
          allergens?: string[];
        }>;
      }>;
    };
    additionalInfoSection: {
      title: string;
      content: string;
      items: Array<{
        id: string;
        title: string;
        description: string;
      }>;
    };
    teamSection?: {
      title: string;
      description?: string;
      members: Array<{
        id: string;
        name: string;
        role: string;
        photo: string;
        bio?: string;
      }>;
    };
    accommodationSection?: {
      title: string;
      description?: string;
      hotels: Array<{
        id: string;
        name: string;
        address: string;
        phone?: string;
        website?: string;
        description?: string;
        priceRange?: string;
      }>;
    };
    transportationSection?: {
      title: string;
      description?: string;
      options: Array<{
        id: string;
        type: string;
        description: string;
        details?: string;
      }>;
    };
    wishesAndGiftsSection?: {
      title: string;
      description?: string;
      wishesMessage?: string;
      place?: string;
      when?: string;
      giftSuggestions?: string;
    };
    seatingChartSection?: {
      title: string;
      description?: string;
      tables: Array<{
        id: string;
        tableNumber: string;
        guests: string[];
        specialNotes?: string;
      }>;
    };
  };
}

export default function PublicEventPage() {
  const params = useParams();
  const wwwId = params.wwwId as string;
  const { setCoupleNames } = useEvent();
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  
  // Inline editing states
  const [heroEditorOpen, setHeroEditorOpen] = useState(false);
  const [timelineEditorOpen, setTimelineEditorOpen] = useState(false);
  const [ceremonyEditorOpen, setCeremonyEditorOpen] = useState(false);
  const [venueEditorOpen, setVenueEditorOpen] = useState(false);
  const [menuEditorOpen, setMenuEditorOpen] = useState(false);
  const [teamEditorOpen, setTeamEditorOpen] = useState(false);
  const [additionalInfoEditorOpen, setAdditionalInfoEditorOpen] = useState(false);
  const [accommodationEditorOpen, setAccommodationEditorOpen] = useState(false);
  const [transportationEditorOpen, setTransportationEditorOpen] = useState(false);
  const [wishesAndGiftsEditorOpen, setWishesAndGiftsEditorOpen] = useState(false);
  const [seatingChartEditorOpen, setSeatingChartEditorOpen] = useState(false);

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
      // Calculate countdown to event date - use custom date if available
      const customEventDate = eventData.sectionContent?.heroSection?.eventDate || eventData.eventDate;
      const eventDate = new Date(customEventDate);
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
          const customEventDate = eventData.sectionContent?.heroSection?.eventDate || eventData.eventDate;
          const eventDate = new Date(customEventDate);
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

  // Handle smooth scrolling to team section when coming from gallery
  useEffect(() => {
    if (window.location.hash === '#team-section') {
      let hasScrolled = false;
      
      const scrollToTeamSection = () => {
        if (hasScrolled) return; // Prevent multiple scrolls
        
        const element = document.getElementById('team-section');
        if (element && element.offsetTop > 0) {
          hasScrolled = true;
          
          // Scroll to the element with some offset from the header
          const headerOffset = 100;
          const elementPosition = element.offsetTop;
          const offsetPosition = elementPosition - headerOffset;

          // Use direct scroll without smooth behavior to prevent conflicts
          window.scrollTo(0, offsetPosition);

          // Clear the hash immediately to prevent browser default behavior
          window.history.replaceState(null, '', window.location.pathname);
          
          // Force scroll position again after a short delay to ensure it stays
          setTimeout(() => {
            window.scrollTo(0, offsetPosition);
          }, 50);
        }
      };

      // Try scrolling when eventData is loaded
      if (eventData) {
        scrollToTeamSection();
      }

      // Fallback scroll after a delay
      const timeoutId = setTimeout(scrollToTeamSection, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [eventData]); // Only depend on eventData

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
      
      // Set couple names in context for footer
      const coupleNames = result.data.sectionContent?.heroSection?.coupleNames || result.data.coupleNames;
      setCoupleNames(coupleNames);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load event');
    } finally {
      setLoading(false);
    }
  };


  // Save functions for inline editing
  const saveHeroSection = async (heroData: any) => {
    if (!eventData) return;

    const updatedContent = {
      ...eventData.sectionContent,
      heroSection: heroData
    };

    await updateEventContent(updatedContent);
  };

  const saveTimelineSection = async (timelineData: any) => {
    if (!eventData) return;

    const updatedContent = {
      ...eventData.sectionContent,
      timelineSection: timelineData
    };

    await updateEventContent(updatedContent);
  };

  const saveCeremonySection = async (ceremonyData: any) => {
    if (!eventData) return;

    const updatedContent = {
      ...eventData.sectionContent,
      ceremonySection: ceremonyData
    };

    await updateEventContent(updatedContent);
  };

  const saveVenueSection = async (venueData: any) => {
    if (!eventData) return;

    const updatedContent = {
      ...eventData.sectionContent,
      ceremonyVenueSection: venueData
    };

    await updateEventContent(updatedContent);
  };

  const saveMenuSection = async (menuData: any) => {
    if (!eventData) return;

    const updatedContent = {
      ...eventData.sectionContent,
      menuSection: menuData
    };

    await updateEventContent(updatedContent);
  };

  const saveTeamSection = async (teamData: any) => {
    if (!eventData) return;

    const updatedContent = {
      ...eventData.sectionContent,
      teamSection: teamData
    };

    await updateEventContent(updatedContent);
  };

  const saveAdditionalInfoSection = async (additionalInfoData: any) => {
    if (!eventData) return;

    const updatedContent = {
      ...eventData.sectionContent,
      additionalInfoSection: additionalInfoData
    };

    await updateEventContent(updatedContent);
  };

  const saveAccommodationSection = async (accommodationData: any) => {
    if (!eventData) return;

    const updatedContent = {
      ...eventData.sectionContent,
      accommodationSection: accommodationData
    };

    await updateEventContent(updatedContent);
  };

  const saveTransportationSection = async (transportationData: any) => {
    if (!eventData) return;

    const updatedContent = {
      ...eventData.sectionContent,
      transportationSection: transportationData
    };

    await updateEventContent(updatedContent);
  };

  const saveWishesAndGiftsSection = async (wishesAndGiftsData: any) => {
    if (!eventData) return;

    const updatedContent = {
      ...eventData.sectionContent,
      wishesAndGiftsSection: wishesAndGiftsData
    };

    await updateEventContent(updatedContent);
  };

  const saveSeatingChartSection = async (seatingChartData: any) => {
    if (!eventData) return;

    const updatedContent = {
      ...eventData.sectionContent,
      seatingChartSection: seatingChartData
    };

    await updateEventContent(updatedContent);
  };

  const updateEventContent = async (sectionContent: any) => {
    try {
      const response = await fetch(`/api/event-id/${wwwId}/update-content`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sectionContent }),
      });

      if (!response.ok) {
        throw new Error('Failed to update content');
      }

      // Update local state immediately for real-time UI updates
      setEventData(prev => prev ? {
        ...prev,
        sectionContent
      } : null);

    } catch (error) {
      throw error;
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
    <AdminEditProvider eventOwnerId={eventData.organizerId || undefined}>
      <main>
        {/* Google Fonts */}
        <link href="https://fonts.googleapis.com/css2?family=Sail&family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      
      {/* Header Navigation */}
      <EventHeader 
        eventId={wwwId}
        galleryEnabled={eventData.galleryEnabled}
        rsvpEnabled={eventData.rsvpEnabled}
        currentPage="home"
      />

      {/* Hero Section with Dynamic Data */}
      <EditableSection
        onEdit={() => setHeroEditorOpen(true)}
        sectionName="Hero Section"
        className="relative w-full overflow-hidden bg-white pt-16"
      >
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
              {eventData.sectionContent?.heroSection?.coupleNames || eventData.coupleNames}
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
                {eventData.sectionContent?.heroSection?.customMessage || "WE'RE GETTING MARRIED!"}
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
      </EditableSection>

      {/* All the wedding sections - conditionally rendered based on sectionVisibility */}
      {(eventData.sectionVisibility?.timelineSection ?? true) && (
        <EditableSection
          onEdit={() => setTimelineEditorOpen(true)}
          sectionName="Timeline Section"
        >
          <DynamicTimelineSection 
            title={eventData.sectionContent?.timelineSection?.title || 'Wedding Day'}
            events={eventData.sectionContent?.timelineSection?.events || []}
          />
        </EditableSection>
      )}
      {(eventData.sectionVisibility?.ceremonySection ?? true) && (
        <EditableSection
          onEdit={() => setCeremonyEditorOpen(true)}
          sectionName="Ceremony Section"
        >
          <DynamicCeremonySection 
            title={eventData.sectionContent?.ceremonySection?.title || 'Wedding Ceremony'}
            description={eventData.sectionContent?.ceremonySection?.description || 'We Invite You To Join Us For Our'}
            date={eventData.sectionContent?.ceremonySection?.date || eventData.eventDate}
            time={eventData.sectionContent?.ceremonySection?.time || '12:00 PM'}
            location={eventData.sectionContent?.ceremonySection?.location || eventData.venue || 'Wedding Venue'}
            details={eventData.sectionContent?.ceremonySection?.details}
            mapUrl={eventData.sectionContent?.ceremonySection?.mapUrl}
          />
        </EditableSection>
      )}
      {(eventData.sectionVisibility?.ceremonyVenueSection ?? true) && (
        <EditableSection
          onEdit={() => setVenueEditorOpen(true)}
          sectionName="Venue Section"
        >
          <DynamicCeremonyVenueSection 
            title={eventData.sectionContent?.ceremonyVenueSection?.title || 'Our Wedding'}
            venueName={eventData.sectionContent?.ceremonyVenueSection?.venueName || eventData.venue || 'Wedding Venue'}
            address={eventData.sectionContent?.ceremonyVenueSection?.address || ''}
            description={eventData.sectionContent?.ceremonyVenueSection?.description}
            mapUrl={eventData.sectionContent?.ceremonyVenueSection?.mapUrl}
          />
        </EditableSection>
      )}
      {(eventData.sectionVisibility?.seatingChartSection ?? true) && (
        <EditableSection
          onEdit={() => setSeatingChartEditorOpen(true)}
          sectionName="Seating Chart Section"
        >
          <SeatingChartSection 
            title={eventData.sectionContent?.seatingChartSection?.title || 'Seating Chart'}
            description={eventData.sectionContent?.seatingChartSection?.description || 'Find your seat for the reception.'}
            tables={eventData.sectionContent?.seatingChartSection?.tables || []}
          />
        </EditableSection>
      )}
      {(eventData.sectionVisibility?.menuSection ?? true) && (
        <EditableSection
          onEdit={() => setMenuEditorOpen(true)}
          sectionName="Menu Section"
        >
          <DynamicMenuSection 
            title={eventData.sectionContent?.menuSection?.title || 'Menu'}
            description={eventData.sectionContent?.menuSection?.description}
            courses={eventData.sectionContent?.menuSection?.courses || []}
          />
        </EditableSection>
      )}
      {(eventData.sectionVisibility?.wishesAndGiftsSection ?? true) && (
        <EditableSection
          onEdit={() => setWishesAndGiftsEditorOpen(true)}
          sectionName="Wishes & Gifts Section"
        >
          <WishesAndGiftsSection 
            title={eventData.sectionContent?.wishesAndGiftsSection?.title || 'Wishes & Gifts'}
            description={eventData.sectionContent?.wishesAndGiftsSection?.description || 'Your presence is the greatest gift, but if you wish to honor us with a gift, here are some suggestions.'}
            wishesMessage={eventData.sectionContent?.wishesAndGiftsSection?.wishesMessage || 'We are so grateful for your love and support!'}
            place={eventData.sectionContent?.wishesAndGiftsSection?.place || 'At the church'}
            when={eventData.sectionContent?.wishesAndGiftsSection?.when || 'After ceremony next to church'}
            giftSuggestions={eventData.sectionContent?.wishesAndGiftsSection?.giftSuggestions || 'flowers, bottle of wine, lottery coupon'}
          />
        </EditableSection>
      )}
      {(eventData.sectionVisibility?.teamSection ?? true) && (
        <EditableSection
          onEdit={() => setTeamEditorOpen(true)}
          sectionName="Team Section"
        >
          <div id="team-section" className="pt-20">
            <DynamicTeamSection 
              title={eventData.sectionContent?.teamSection?.title || 'Team'}
              description={eventData.sectionContent?.teamSection?.description}
              members={eventData.sectionContent?.teamSection?.members || []}
            />
          </div>
        </EditableSection>
      )}
      {(eventData.sectionVisibility?.accommodationSection ?? true) && (
        <EditableSection
          onEdit={() => setAccommodationEditorOpen(true)}
          sectionName="Accommodation Section"
        >
          <AccommodationSection 
            title={eventData.sectionContent?.accommodationSection?.title || 'Accommodation'}
            description={eventData.sectionContent?.accommodationSection?.description || 'Here are some hotel options for out-of-town guests.'}
            hotels={eventData.sectionContent?.accommodationSection?.hotels || []}
          />
        </EditableSection>
      )}
      {(eventData.sectionVisibility?.transportationSection ?? true) && (
        <EditableSection
          onEdit={() => setTransportationEditorOpen(true)}
          sectionName="Transportation Section"
        >
          <TransportationSection 
            title={eventData.sectionContent?.transportationSection?.title || 'Transportation'}
            description={eventData.sectionContent?.transportationSection?.description || 'Information about getting to and from the venue.'}
            options={eventData.sectionContent?.transportationSection?.options || []}
          />
        </EditableSection>
      )}
      {(eventData.sectionVisibility?.additionalInfoSection ?? true) && (
        <EditableSection
          onEdit={() => setAdditionalInfoEditorOpen(true)}
          sectionName="Additional Info Section"
        >
          <DynamicAdditionalInfoSection 
            title={eventData.sectionContent?.additionalInfoSection?.title || 'Additional Information'}
            content={eventData.sectionContent?.additionalInfoSection?.content || ''}
            items={eventData.sectionContent?.additionalInfoSection?.items || []}
          />
        </EditableSection>
      )}

      {/* Admin Toggle Button */}
      <AdminToggle />

      {/* Inline Editor Modals */}
      <HeroSectionEditor
        isOpen={heroEditorOpen}
        onClose={() => setHeroEditorOpen(false)}
        data={eventData?.sectionContent?.heroSection}
        onSave={saveHeroSection}
      />

      <TimelineSectionEditor
        isOpen={timelineEditorOpen}
        onClose={() => setTimelineEditorOpen(false)}
        data={eventData?.sectionContent?.timelineSection}
        onSave={saveTimelineSection}
      />

      <CeremonySectionEditor
        isOpen={ceremonyEditorOpen}
        onClose={() => setCeremonyEditorOpen(false)}
        data={eventData?.sectionContent?.ceremonySection}
        onSave={saveCeremonySection}
      />

      <VenueSectionEditor
        isOpen={venueEditorOpen}
        onClose={() => setVenueEditorOpen(false)}
        data={eventData?.sectionContent?.ceremonyVenueSection}
        onSave={saveVenueSection}
      />

      <MenuSectionEditor
        isOpen={menuEditorOpen}
        onClose={() => setMenuEditorOpen(false)}
        data={eventData?.sectionContent?.menuSection}
        onSave={saveMenuSection}
      />

      <AdditionalInfoSectionEditor
        isOpen={additionalInfoEditorOpen}
        onClose={() => setAdditionalInfoEditorOpen(false)}
        data={eventData?.sectionContent?.additionalInfoSection}
        onSave={saveAdditionalInfoSection}
      />

      <TeamSectionEditor
        isOpen={teamEditorOpen}
        onClose={() => setTeamEditorOpen(false)}
        data={eventData?.sectionContent?.teamSection || { title: 'Team', description: '', members: [] }}
        onSave={saveTeamSection}
      />

      <AccommodationSectionEditor
        isOpen={accommodationEditorOpen}
        onClose={() => setAccommodationEditorOpen(false)}
        data={eventData?.sectionContent?.accommodationSection || { title: 'Accommodation', description: '', hotels: [] }}
        onSave={saveAccommodationSection}
      />

      <TransportationSectionEditor
        isOpen={transportationEditorOpen}
        onClose={() => setTransportationEditorOpen(false)}
        data={eventData?.sectionContent?.transportationSection || { title: 'Transportation', description: '', options: [] }}
        onSave={saveTransportationSection}
      />

      <WishesAndGiftsSectionEditor
        isOpen={wishesAndGiftsEditorOpen}
        onClose={() => setWishesAndGiftsEditorOpen(false)}
        data={eventData?.sectionContent?.wishesAndGiftsSection || { 
          title: 'Wishes & Gifts', 
          description: 'Your presence is the greatest gift, but if you wish to honor us with a gift, here are some suggestions.',
          wishesMessage: 'We are so grateful for your love and support!',
          place: 'At the church',
          when: 'After ceremony next to church',
          giftSuggestions: 'flowers, bottle of wine, lottery coupon'
        }}
        onSave={saveWishesAndGiftsSection}
      />

      <SeatingChartSectionEditor
        isOpen={seatingChartEditorOpen}
        onClose={() => setSeatingChartEditorOpen(false)}
        data={eventData?.sectionContent?.seatingChartSection || { title: 'Seating Chart', description: '', tables: [] }}
        onSave={saveSeatingChartSection}
      />
    </main>
    </AdminEditProvider>
  );
}
