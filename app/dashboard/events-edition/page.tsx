"use client";
import { useRouter } from "next/navigation";

const subNav = [
  "EVENT'S GENERAL INFO",
  "EVENT'S DAY DETAILS MANAGEMENT",
  "GALLERY MANAGEMENT",
  "RSVP MANAGEMENT",
];

const cards = [
  {
    title: "EVENT'S GENERAL INFO",
    description: "",
    href: "/dashboard/events-edition/general-info",
  },
  {
    title: "EVENT'S DAY DETAILS MANAGEMENT",
    description: "",
    href: "/dashboard/events-edition/day-details",
  },
  {
    title: "GALLERY MANAGEMENT",
    description: "",
    href: "/dashboard/events-edition/gallery",
  },
  {
    title: "RSVP MANAGEMENT",
    description: "",
    href: "/dashboard/events-edition/rsvp",
  },
];

export default function EventsEditionPage() {
  const router = useRouter();

  return (
    <div className="flex-1 p-12">
      <h1 className="text-3xl font-bold text-black mb-10">EVENTS EDITION</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {cards.map((card, idx) => (
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
              Manage
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 