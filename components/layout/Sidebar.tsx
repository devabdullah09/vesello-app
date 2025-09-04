"use client";
import React from "react";
import { useRouter, usePathname } from "next/navigation";

const sidebarNav: Record<"superadmin" | "organizer", { label: string; href: string; subNav?: string[] }[]> = {
  superadmin: [
    { label: "EVENTS LIST", href: "/dashboard/events-list" },
    {
      label: "EVENTS EDITION",
      href: "/dashboard/events-edition",
      subNav: [
        "EVENT'S GENERAL INFO",
        "EVENT'S DAY DETAILS MANAGEMENT",
        "GALLERY MANAGEMENT",
        "RSVP MANAGEMENT",
      ],
    },
    { label: "CLIENTS LIST", href: "/dashboard/clients-list" },
    { label: "MODULES LIST", href: "/dashboard/modules-list" },
    { label: "WEBHOOKS LIST", href: "/dashboard/webhooks-list" },
  ],
  organizer: [
    { label: "EVENTS LIST", href: "/dashboard/events-list" },
    {
      label: "EVENTS EDITION",
      href: "/dashboard/events-edition",
      subNav: [
        "EVENT'S GENERAL INFO",
        "EVENT'S DAY DETAILS MANAGEMENT",
        "GALLERY MANAGEMENT",
        "RSVP MANAGEMENT",
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
    <aside className="w-72 bg-black text-white flex flex-col min-h-full">
      <div className="px-8 py-6 cursor-pointer select-none" onClick={() => router.push("/dashboard") }>
        <div className="font-bold text-lg mb-1 hover:underline">ADMIN DASHBOARD</div>
        <div className="text-xs text-gray-300 mb-6">({role === "superadmin" ? "Super Admin" : "Organizer"})</div>
      </div>
      <nav className="flex flex-col gap-2 px-8">
        {navItems.map((item: { label: string; href: string; subNav?: string[] }) => {
          const isActive = pathname === item.href;
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
                  {item.subNav.map((sub, i) => (
                    <li key={sub} className="text-xs text-white flex items-center">
                      <span className="mr-2 text-lg leading-none">&bull;</span>
                      <span>{sub}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
} 