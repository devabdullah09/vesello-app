"use client";
import React from "react";
import { useRouter, usePathname } from "next/navigation";

const sidebarNav: Record<"superadmin" | "organizer", { label: string; href: string; subNav?: { label: string; href: string }[] }[]> = {
  superadmin: [
    { label: "EVENTS LIST", href: "/dashboard/events-list" },
    {
      label: "EVENTS EDITION",
      href: "/dashboard/events-edition",
      subNav: [
        { label: "EVENT'S GENERAL INFO", href: "/dashboard/events-edition/general-info" },
        { label: "EVENT'S DAY DETAILS MANAGEMENT", href: "/dashboard/events-edition/day-details" },
        { label: "GALLERY MANAGEMENT", href: "/dashboard/events-edition/gallery" },
        { label: "RSVP MANAGEMENT", href: "/dashboard/events-edition/rsvp" },
      ],
    },
    { label: "ORGANIZERS", href: "/dashboard/organizers" },
    { label: "CLIENTS LIST", href: "/dashboard/clients-list" },
    { label: "MODULES LIST", href: "/dashboard/modules-list" },
    { label: "WEBHOOKS LIST", href: "/dashboard/webhooks-list" },
    {
      label: "SUBSCRIPTION",
      href: "/dashboard/subscription",
      subNav: [
        { label: "MANAGE SUBSCRIPTION", href: "/dashboard/subscription" },
        { label: "BILLING HISTORY", href: "/dashboard/billing" },
      ],
    },
  ],
  organizer: [
    { label: "DASHBOARD", href: "/dashboard/organizer" },
    {
      label: "EVENT MANAGEMENT",
      href: "/dashboard/events-edition",
      subNav: [
        { label: "EVENT SETTINGS", href: "/dashboard/events-edition/general-info" },
        { label: "DAY DETAILS", href: "/dashboard/events-edition/day-details" },
        { label: "GALLERY", href: "/dashboard/events-edition/gallery" },
        { label: "RSVP", href: "/dashboard/events-edition/rsvp" },
      ],
    },
    {
      label: "SUBSCRIPTION",
      href: "/dashboard/subscription",
      subNav: [
        { label: "MANAGE SUBSCRIPTION", href: "/dashboard/subscription" },
        { label: "BILLING HISTORY", href: "/dashboard/billing" },
      ],
    },
  ],
};

type Role = keyof typeof sidebarNav;

export default function Sidebar({ role }: { role: Role }) {
  const router = useRouter();
  const pathname = usePathname();
  const navItems = sidebarNav[role] || sidebarNav.organizer;
  return (
    <aside className="w-72 bg-black text-white flex flex-col min-h-screen fixed left-0 top-20 z-40 overflow-y-auto">
      <div className="px-8 py-6 cursor-pointer select-none" onClick={() => router.push("/dashboard") }>
        <div className="font-bold text-lg mb-1 hover:underline">ADMIN DASHBOARD</div>
        <div className="text-xs text-gray-300 mb-6">({role === "superadmin" ? "Super Admin" : "Organizer"})</div>
      </div>
      <nav className="flex flex-col gap-2 px-8 pb-8">
        {navItems.map((item: { label: string; href: string; subNav?: { label: string; href: string }[] }) => {
          const isActive = pathname === item.href || (item.subNav && item.subNav.some(sub => pathname === sub.href));
          return (
            <div key={item.label}>
              <button
                onClick={() => router.push(item.href)}
                className={`w-full py-2 px-4 rounded text-left text-base border-b border-white/10 last:border-b-0 transition-colors ${isActive ? "bg-gradient-to-r from-[#E5B574] via-[#D59C58] to-[#C18037] text-black font-bold" : "hover:bg-white/10"}`}
              >
                {item.label}
              </button>
              {/* Sub-navigation for EVENTS EDITION */}
              {isActive && item.subNav && (
                <ul className="ml-4 mt-2 mb-2 space-y-1">
                  {item.subNav.map((sub) => {
                    const isSubActive = pathname === sub.href;
                    return (
                      <li key={sub.label} className="text-xs text-white flex items-center">
                        <span className="mr-2 text-lg leading-none">&bull;</span>
                        <button
                          onClick={() => router.push(sub.href)}
                          className={`text-left hover:text-[#E5B574] transition-colors cursor-pointer ${isSubActive ? "text-[#E5B574] font-semibold" : ""}`}
                        >
                          {sub.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
} 