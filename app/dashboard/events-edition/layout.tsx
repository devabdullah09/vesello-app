"use client";

import { useEventEdition } from "@/components/event-edition-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function EventsEditionLayout({ children }: { children: React.ReactNode }) {
  const { selectedEvent, loading } = useEventEdition();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect to select-event if no event is selected (except on the select-event page itself)
  useEffect(() => {
    if (!loading && !selectedEvent && !pathname.includes('/select-event')) {
      router.push('/dashboard/events-edition/select-event');
    }
  }, [selectedEvent, loading, pathname, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C18037] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

