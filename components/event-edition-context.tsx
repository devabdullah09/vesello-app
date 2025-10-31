"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './supabase-auth-provider';
import { supabase } from '@/lib/supabase';

interface EventData {
  id: string;
  wwwId: string;
  title: string;
  coupleNames: string;
  eventDate: string;
  venue?: string;
  status: string;
  galleryEnabled: boolean;
  rsvpEnabled: boolean;
  eventUrl: string;
}

interface EventEditionContextType {
  selectedEvent: EventData | null;
  setSelectedEvent: (event: EventData | null) => void;
  loading: boolean;
  refetchEvents: () => Promise<void>;
}

const EventEditionContext = createContext<EventEditionContextType | undefined>(undefined);

export function EventEditionProvider({ children }: { children: ReactNode }) {
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, userProfile } = useAuth();

  // Load selected event from localStorage on mount
  useEffect(() => {
    const loadSelectedEvent = async () => {
      // Check if we're in the browser environment
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }
      
      const storedEventId = localStorage.getItem('selectedEventId');
      if (storedEventId && user) {
        await loadEventById(storedEventId);
      } else {
        setLoading(false);
      }
    };
    
    loadSelectedEvent();
  }, [user]);

  const loadEventById = async (wwwId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/dashboard/events/day-details?wwwId=${wwwId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.data) {
          const eventData: EventData = {
            id: result.data.eventId,
            wwwId: result.data.wwwId,
            title: result.data.title,
            coupleNames: result.data.coupleNames,
            eventDate: result.data.eventDate,
            venue: result.data.venue,
            status: result.data.status,
            galleryEnabled: result.data.galleryEnabled,
            rsvpEnabled: result.data.rsvpEnabled,
            eventUrl: result.data.eventUrl
          };
          setSelectedEvent(eventData);
          localStorage.setItem('selectedEventId', wwwId);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading event:', error);
      setLoading(false);
    }
  };

  const refetchEvents = async () => {
    if (selectedEvent) {
      await loadEventById(selectedEvent.wwwId);
    }
  };

  const handleSetSelectedEvent = (event: EventData | null) => {
    setSelectedEvent(event);
    if (event) {
      localStorage.setItem('selectedEventId', event.wwwId);
    } else {
      localStorage.removeItem('selectedEventId');
    }
  };

  return (
    <EventEditionContext.Provider 
      value={{ 
        selectedEvent, 
        setSelectedEvent: handleSetSelectedEvent, 
        loading,
        refetchEvents
      }}
    >
      {children}
    </EventEditionContext.Provider>
  );
}

export function useEventEdition() {
  const context = useContext(EventEditionContext);
  if (context === undefined) {
    throw new Error('useEventEdition must be used within an EventEditionProvider');
  }
  return context;
}

