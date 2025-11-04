"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Header from '@/components/layout/Header';
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/components/supabase-auth-provider";
import { EventProvider } from "@/components/event-context";

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");
  // Check if pathname matches dynamic event pattern (e.g., /NFE2MJ1, /NFE2MJ1/gallery, etc.)
  // Exclude dashboard, login, pricing, and other static routes
  const isDynamicEvent = pathname && !pathname.startsWith("/dashboard") && !pathname.startsWith("/login") && !pathname.startsWith("/pricing") && !pathname.startsWith("/gallery") && !pathname.startsWith("/invitation") && !pathname.startsWith("/api") && pathname !== "/" && pathname.split("/").length >= 1 && pathname.split("/")[1] && pathname.split("/")[1].length > 3;
  return (
    <AuthProvider>
      <EventProvider>
        {!isDashboard && !isDynamicEvent && <Header />}
        <main className={!isDashboard ? "pt-20" : undefined}>{children}</main>
        {!isDashboard && !isDynamicEvent && <Footer />}
      </EventProvider>
    </AuthProvider>
  );
} 