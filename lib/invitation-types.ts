export interface InvitationGuest {
  name: string;
  surname: string;
  isChild: boolean;
  age?: string;
}

export interface InvitationRSVP {
  id?: string;
  eventId: string;
  mainGuest: InvitationGuest;
  additionalGuests: InvitationGuest[];
  weddingDayAttendance: {
    [guestName: string]: 'will' | 'cant';
  };
  afterPartyAttendance: {
    [guestName: string]: 'will' | 'cant';
  };
  foodPreferences: {
    [guestName: string]: 'Regular' | 'Vegetarian' | 'Vegan';
  };
  accommodationNeeded: {
    [guestName: string]: 'Yes' | 'No';
  };
  transportationNeeded: {
    [guestName: string]: 'Yes' | 'No';
  };
  notes: {
    [guestName: string]: string;
  };
  email?: string;
  sendEmailConfirmation: boolean;
  submittedAt: Date;
  status: 'pending' | 'confirmed' | 'cancelled';
}

export interface InvitationFlowData {
  mainGuest: InvitationGuest;
  additionalGuests: InvitationGuest[];
  currentStep: 'guests' | 'attendance' | 'after-party' | 'food' | 'accommodation' | 'transportation' | 'notes' | 'confirmation';
}
