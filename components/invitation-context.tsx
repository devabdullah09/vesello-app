"use client";
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { InvitationGuest, InvitationFlowData } from '@/lib/invitation-types';

interface InvitationState {
  mainGuest: InvitationGuest;
  additionalGuests: InvitationGuest[];
  weddingDayAttendance: { [guestName: string]: 'will' | 'cant' };
  afterPartyAttendance: { [guestName: string]: 'will' | 'cant' };
  foodPreferences: { [guestName: string]: 'Regular' | 'Vegetarian' | 'Vegan' };
  accommodationNeeded: { [guestName: string]: 'Yes' | 'No' };
  transportationNeeded: { [guestName: string]: 'Yes' | 'No' };
  notes: { [guestName: string]: string };
  email: string;
  sendEmailConfirmation: boolean;
}

type InvitationAction =
  | { type: 'SET_MAIN_GUEST'; payload: InvitationGuest }
  | { type: 'SET_ADDITIONAL_GUESTS'; payload: InvitationGuest[] }
  | { type: 'SET_WEDDING_ATTENDANCE'; payload: { [guestName: string]: 'will' | 'cant' } }
  | { type: 'SET_AFTER_PARTY_ATTENDANCE'; payload: { [guestName: string]: 'will' | 'cant' } }
  | { type: 'SET_FOOD_PREFERENCES'; payload: { [guestName: string]: 'Regular' | 'Vegetarian' | 'Vegan' } }
  | { type: 'SET_ACCOMMODATION_NEEDED'; payload: { [guestName: string]: 'Yes' | 'No' } }
  | { type: 'SET_TRANSPORTATION_NEEDED'; payload: { [guestName: string]: 'Yes' | 'No' } }
  | { type: 'SET_NOTES'; payload: { [guestName: string]: string } }
  | { type: 'SET_EMAIL'; payload: string }
  | { type: 'SET_EMAIL_CONFIRMATION'; payload: boolean }
  | { type: 'RESET_STATE' };

const initialState: InvitationState = {
  mainGuest: { name: '', surname: '', isChild: false },
  additionalGuests: [],
  weddingDayAttendance: {},
  afterPartyAttendance: {},
  foodPreferences: {},
  accommodationNeeded: {},
  transportationNeeded: {},
  notes: {},
  email: '',
  sendEmailConfirmation: true,
};

function invitationReducer(state: InvitationState, action: InvitationAction): InvitationState {
  switch (action.type) {
    case 'SET_MAIN_GUEST':
      return { ...state, mainGuest: action.payload };
    case 'SET_ADDITIONAL_GUESTS':
      return { ...state, additionalGuests: action.payload };
    case 'SET_WEDDING_ATTENDANCE':
      return { ...state, weddingDayAttendance: action.payload };
    case 'SET_AFTER_PARTY_ATTENDANCE':
      return { ...state, afterPartyAttendance: action.payload };
    case 'SET_FOOD_PREFERENCES':
      return { ...state, foodPreferences: action.payload };
    case 'SET_ACCOMMODATION_NEEDED':
      return { ...state, accommodationNeeded: action.payload };
    case 'SET_TRANSPORTATION_NEEDED':
      return { ...state, transportationNeeded: action.payload };
    case 'SET_NOTES':
      return { ...state, notes: action.payload };
    case 'SET_EMAIL':
      return { ...state, email: action.payload };
    case 'SET_EMAIL_CONFIRMATION':
      return { ...state, sendEmailConfirmation: action.payload };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
}

interface InvitationContextType {
  state: InvitationState;
  dispatch: React.Dispatch<InvitationAction>;
  getGuestByName: (guestName: string) => InvitationGuest | null;
}

const InvitationContext = createContext<InvitationContextType | undefined>(undefined);

export function InvitationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(invitationReducer, initialState);

  const getGuestByName = (guestName: string) => {
    if (state.mainGuest.name === guestName) {
      return state.mainGuest;
    }
    
    const additionalGuest = state.additionalGuests.find(guest => guest.name === guestName);
    return additionalGuest || null;
  };

  const value = {
    state,
    dispatch,
    getGuestByName,
  };

  return (
    <InvitationContext.Provider value={value}>
      {children}
    </InvitationContext.Provider>
  );
}

export function useInvitation() {
  const context = useContext(InvitationContext);
  if (context === undefined) {
    throw new Error('useInvitation must be used within an InvitationProvider');
  }
  return context;
}
