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
  const isDynamicEvent = pathname?.startsWith("/event-id/");
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