'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface EventContextType {
  coupleNames: string | null;
  setCoupleNames: (coupleNames: string | null) => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: ReactNode }) {
  const [coupleNames, setCoupleNames] = useState<string | null>(null);

  return (
    <EventContext.Provider value={{ coupleNames, setCoupleNames }}>
      {children}
    </EventContext.Provider>
  );
}

export function useEvent() {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvent must be used within an EventProvider');
  }
  return context;
}
