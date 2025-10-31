"use client";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/language-context";
import { useEventEdition } from "@/components/event-edition-context";
import { useEffect } from "react";

export default function GalleryManagementPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { selectedEvent, setSelectedEvent } = useEventEdition();

  useEffect(() => {
    if (!selectedEvent) {
      router.push("/dashboard/events-edition/select-event");
    } else if (!selectedEvent.galleryEnabled) {
      router.push("/dashboard/events-edition");
    }
  }, [selectedEvent, router]);

  const galleryCards = [
    {
      title: "QR CODE/LINK",
      href: "/dashboard/events-edition/gallery/qr-code",
    },
    {
      title: "PRINT TEMPLATES",
      href: "/dashboard/events-edition/gallery/print-templates",
    },
    {
      title: "EDIT ALBUM PAGE",
      href: "/dashboard/events-edition/gallery/edit-album-page", // Route to new admin edit album page
    },
    {
      title: "ALBUMS MANAGEMENT",
      href: "/dashboard/events-edition/gallery/albums",
    },
  ];

  const handleBack = () => {
    router.push("/dashboard/events-edition");
  };

  const handleSwitchEvent = () => {
    setSelectedEvent(null);
    router.push("/dashboard/events-edition/select-event");
  };

  if (!selectedEvent || !selectedEvent.galleryEnabled) {
    return null;
  }

  return (
    <div className="flex-1 p-12 bg-white min-h-screen">
      <div className="flex justify-between items-start mb-8">
        <button
          onClick={handleBack}
          className="bg-black text-white px-6 py-2 rounded font-semibold hover:bg-gray-800 transition-colors"
        >
          {t.dashboard.back}
        </button>
        <button
          onClick={handleSwitchEvent}
          className="bg-gray-200 text-black px-4 py-2 rounded font-semibold hover:bg-gray-300 transition-colors"
        >
          Switch Event
        </button>
      </div>
      
      <h1 className="text-3xl font-bold text-black mb-10">{t.dashboard.galleryManagement}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {galleryCards.map((card, idx) => (
          <div
            key={card.title}
            className="bg-black text-white rounded-xl w-full h-64 flex flex-col items-center justify-center shadow-lg"
          >
            <div className="text-xl font-bold text-center mb-8 px-4 leading-tight">
              {card.title}
            </div>
            <button
              className="bg-gradient-to-r from-[#E5B574] via-[#D59C58] to-[#C18037] text-white font-semibold px-8 py-2 rounded-md shadow-md hover:from-[#D59C58] hover:to-[#E5B574] transition-colors"
              onClick={() => router.push(card.href)}
            >
              {t.dashboard.manage}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 