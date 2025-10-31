"use client";
import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLanguage } from "@/components/language-context";

const getSidebarNav = (t: any): Record<"superadmin" | "organizer", { label: string; href: string; subNav?: { label: string; href: string }[] }[]> => ({
  superadmin: [
    { label: t.dashboard.eventsList, href: "/dashboard/events-list" },
    {
      label: t.dashboard.eventsEdition,
      href: "/dashboard/events-edition",
      subNav: [
        { label: t.dashboard.generalInfo, href: "/dashboard/events-edition/general-info" },
        { label: t.dashboard.dayDetails, href: "/dashboard/events-edition/day-details" },
        { label: t.dashboard.galleryManagement, href: "/dashboard/events-edition/gallery" },
        { label: t.dashboard.rsvpManagement, href: "/dashboard/events-edition/rsvp" },
      ],
    },
    { label: t.dashboard.organizers, href: "/dashboard/organizers" },
    { label: t.dashboard.clientsList, href: "/dashboard/clients-list" },
    { label: t.dashboard.modulesList, href: "/dashboard/modules-list" },
    { label: t.dashboard.webhooksList, href: "/dashboard/webhooks-list" },
    {
      label: t.dashboard.subscription,
      href: "/dashboard/subscription",
      subNav: [
        { label: t.dashboard.manageSubscription, href: "/dashboard/subscription" },
        { label: t.dashboard.billingHistory, href: "/dashboard/billing" },
      ],
    },
  ],
  organizer: [
    { label: t.dashboard.dashboard, href: "/dashboard/organizer" },
    {
      label: t.dashboard.eventManagement,
      href: "/dashboard/events-edition",
      subNav: [
        { label: t.dashboard.eventSettings, href: "/dashboard/events-edition/general-info" },
        { label: t.dashboard.dayDetails, href: "/dashboard/events-edition/day-details" },
        { label: t.dashboard.gallery, href: "/dashboard/events-edition/gallery" },
        { label: t.dashboard.rsvp, href: "/dashboard/events-edition/rsvp" },
      ],
    },
    {
      label: t.dashboard.subscription,
      href: "/dashboard/subscription",
      subNav: [
        { label: t.dashboard.manageSubscription, href: "/dashboard/subscription" },
        { label: t.dashboard.billingHistory, href: "/dashboard/billing" },
      ],
    },
  ],
});

type Role = "superadmin" | "organizer";

interface SidebarProps {
  role: Role;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ role, isOpen = true, onClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();
  const navItems = getSidebarNav(t)[role] || getSidebarNav(t).organizer;

  const handleLinkClick = (href: string) => {
    router.push(href);
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      <aside 
        className={`
          w-72 bg-black text-white flex flex-col min-h-screen fixed left-0 top-20 z-50 overflow-y-auto
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0
        `}
      >
        <div className="px-8 py-6 cursor-pointer select-none" onClick={() => handleLinkClick("/dashboard")}>
          <div className="font-bold text-lg mb-1 hover:underline">{t.dashboard.adminDashboard}</div>
          <div className="text-xs text-gray-300 mb-6">({role === "superadmin" ? t.dashboard.superAdmin : t.dashboard.organizer})</div>
        </div>
        <nav className="flex flex-col gap-2 px-8 pb-8">
          {navItems.map((item: { label: string; href: string; subNav?: { label: string; href: string }[] }) => {
            const isActive = pathname === item.href || (item.subNav && item.subNav.some(sub => pathname === sub.href));
            return (
              <div key={item.label}>
                <button
                  onClick={() => handleLinkClick(item.href)}
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
                            onClick={() => handleLinkClick(sub.href)}
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
    </>
  );
} 