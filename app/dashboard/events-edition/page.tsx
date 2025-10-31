"use client";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/language-context";
import { useEventEdition } from "@/components/event-edition-context";

export default function EventsEditionPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { selectedEvent, setSelectedEvent } = useEventEdition();

  const allCards = [
    {
      title: t.dashboard.generalInfo,
      description: "",
      href: "/dashboard/events-edition/general-info",
      alwaysShow: true,
      type: 'general',
    },
    {
      title: t.dashboard.dayDetails,
      description: "",
      href: "/dashboard/events-edition/day-details",
      alwaysShow: true,
      type: 'general',
    },
    {
      title: t.dashboard.galleryManagement,
      description: "",
      href: "/dashboard/events-edition/gallery",
      alwaysShow: true,
      type: 'gallery',
    },
    {
      title: t.dashboard.rsvpManagement,
      description: "",
      href: "/dashboard/events-edition/rsvp",
      alwaysShow: true,
      type: 'rsvp',
    },
  ];

  const handleSwitchEvent = () => {
    setSelectedEvent(null);
    router.push("/dashboard/events-edition/select-event");
  };

  return (
    <div className="flex-1 p-12">
      {/* Event Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">{t.dashboard.eventsEdition}</h1>
          {selectedEvent && (
            <div className="mt-2">
              <p className="text-gray-600">
                Managing: <strong className="text-black">{selectedEvent.title}</strong>
              </p>
              <p className="text-sm text-gray-500">
                {selectedEvent.coupleNames} • {new Date(selectedEvent.eventDate).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
        {selectedEvent && (
          <button
            onClick={handleSwitchEvent}
            className="bg-gray-200 text-black px-4 py-2 rounded font-semibold hover:bg-gray-300 transition-colors"
          >
            Switch Event
          </button>
        )}
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8`}>
        {allCards.map((card, idx) => {
          const isEnabled = card.type === 'general' || (card.type === 'gallery' && selectedEvent?.galleryEnabled) || (card.type === 'rsvp' && selectedEvent?.rsvpEnabled);
          
          return (
            <div
              key={card.title}
              className="bg-black text-white rounded-xl w-full h-64 flex flex-col items-center justify-center shadow-lg"
            >
              <div className="text-xl font-bold text-center mb-8 px-4 leading-tight">
                {card.title}
              </div>
              {isEnabled ? (
                <button
                  className="bg-gradient-to-r from-[#E5B574] via-[#D59C58] to-[#C18037] text-white font-semibold px-8 py-2 rounded-md shadow-md hover:from-[#D59C58] hover:to-[#E5B574] transition-colors"
                  onClick={() => router.push(card.href)}
                >
                  {t.dashboard.manage}
                </button>
              ) : (
                <div className="bg-gray-600 text-white font-semibold px-8 py-2 rounded-md shadow-md cursor-not-allowed">
                  Disabled
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
} 