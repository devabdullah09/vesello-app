// Dashboard Types for Supabase Database Schema

export interface Event {
  id: string;
  wwwId: string;
  title: string;
  coupleNames: string;
  eventDate: string; // ISO date string
  venue?: string;
  description?: string;
  organizerId: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  galleryEnabled: boolean;
  rsvpEnabled: boolean;
  settings: Record<string, any>;
  sectionVisibility: {
    heroSection: boolean;
    timelineSection: boolean;
    ceremonySection: boolean;
    ceremonyVenueSection: boolean;
    seatingChartSection: boolean;
    menuSection: boolean;
    wishesAndGiftsSection: boolean;
    teamSection: boolean;
    accommodationSection: boolean;
    transportationSection: boolean;
    additionalInfoSection: boolean;
  };
  sectionContent: {
    heroSection: {
      coupleNames: string;
      eventDate: string;
      venue?: string;
      backgroundImage?: string;
      customMessage?: string;
    };
    timelineSection: {
      title: string;
      events: Array<{
        id: string;
        time: string;
        title: string;
        description?: string;
        icon?: string;
      }>;
    };
    ceremonySection: {
      title: string;
      description: string;
      date: string;
      time: string;
      location: string;
      details?: string;
    };
    ceremonyVenueSection: {
      title: string;
      venueName: string;
      address: string;
      description?: string;
      mapUrl?: string;
      images?: string[];
    };
    seatingChartSection: {
      title: string;
      description?: string;
      tables: Array<{
        id: string;
        tableNumber: string;
        guests: string[];
        specialNotes?: string;
      }>;
    };
    menuSection: {
      title: string;
      description?: string;
      courses: Array<{
        id: string;
        courseName: string;
        items: Array<{
          name: string;
          description?: string;
          allergens?: string[];
        }>;
      }>;
    };
    wishesAndGiftsSection: {
      title: string;
      description?: string;
      registryLinks: Array<{
        id: string;
        storeName: string;
        url: string;
        description?: string;
      }>;
      wishesMessage?: string;
    };
    teamSection: {
      title: string;
      description?: string;
      members: Array<{
        id: string;
        name: string;
        role: string;
        photo?: string;
        bio?: string;
      }>;
    };
    accommodationSection: {
      title: string;
      description?: string;
      hotels: Array<{
        id: string;
        name: string;
        address: string;
        phone?: string;
        website?: string;
        specialRate?: string;
        bookingCode?: string;
      }>;
    };
    transportationSection: {
      title: string;
      description?: string;
      options: Array<{
        id: string;
        type: string;
        description: string;
        details?: string;
        contactInfo?: string;
      }>;
    };
    additionalInfoSection: {
      title: string;
      content: string;
      items: Array<{
        id: string;
        title: string;
        description: string;
      }>;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventData {
  title: string;
  coupleNames: string;
  eventDate: string;
  venue?: string;
  description?: string;
  galleryEnabled?: boolean;
  rsvpEnabled?: boolean;
  settings?: Record<string, any>;
}

export interface UpdateEventData extends Partial<CreateEventData> {
  status?: 'planned' | 'active' | 'completed' | 'cancelled';
  sectionVisibility?: {
    heroSection: boolean;
    timelineSection: boolean;
    ceremonySection: boolean;
    ceremonyVenueSection: boolean;
    seatingChartSection: boolean;
    menuSection: boolean;
    wishesAndGiftsSection: boolean;
    teamSection: boolean;
    accommodationSection: boolean;
    transportationSection: boolean;
    additionalInfoSection: boolean;
  };
  sectionContent?: Event['sectionContent'];
}

export interface GalleryAlbum {
  id: string;
  eventId: string;
  name: string;
  description?: string;
  coverImageUrl?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGalleryAlbumData {
  eventId: string;
  name: string;
  description?: string;
  coverImageUrl?: string;
  isPublic?: boolean;
}

export interface GalleryImage {
  id: string;
  albumId: string;
  eventId: string;
  filename: string;
  originalFilename: string;
  fileSize?: number;
  mimeType?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  uploadedBy?: string;
  isApproved: boolean;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface UploadImageData {
  albumId: string;
  eventId: string;
  filename: string;
  originalFilename: string;
  fileSize?: number;
  mimeType?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  metadata?: Record<string, any>;
}

export interface RSVPForm {
  id: string;
  eventId: string;
  questions: RSVPQuestion[];
  settings: RSVPFormSettings;
  createdAt: string;
  updatedAt: string;
}

export interface RSVPQuestion {
  id: string;
  type: 'text' | 'select' | 'checkbox' | 'radio' | 'textarea';
  label: string;
  required: boolean;
  options?: string[]; // For select, radio, checkbox types
  placeholder?: string;
  order: number;
}

export interface RSVPFormSettings {
  allowAdditionalGuests: boolean;
  requireEmail: boolean;
  sendConfirmationEmail: boolean;
  maxGuests?: number;
  customFields?: Record<string, any>;
}

export interface CreateRSVPFormData {
  eventId: string;
  questions?: RSVPQuestion[];
  settings?: Partial<RSVPFormSettings>;
}

export interface EventSettings {
  id: string;
  eventId: string;
  generalInfo: EventGeneralInfo;
  dayDetails: EventDayDetails;
  timeline: TimelineItem[];
  menu: EventMenu;
  transportation: TransportationInfo;
  accommodation: AccommodationInfo;
  createdAt: string;
  updatedAt: string;
}

export interface EventGeneralInfo {
  eventUrl?: string;
  eventDate?: string;
  venue?: string;
  address?: string;
  dressCode?: string;
  specialInstructions?: string;
}

export interface EventDayDetails {
  ceremonyTime?: string;
  receptionTime?: string;
  afterPartyTime?: string;
  ceremonyVenue?: string;
  receptionVenue?: string;
  afterPartyVenue?: string;
  timeline?: string[];
}

export interface TimelineItem {
  id: string;
  time: string;
  event: string;
  location?: string;
  description?: string;
}

export interface EventMenu {
  appetizers?: string[];
  mainCourses?: string[];
  desserts?: string[];
  beverages?: string[];
  dietaryOptions?: string[];
}

export interface TransportationInfo {
  provided?: boolean;
  details?: string;
  pickupLocations?: string[];
  schedule?: string[];
}

export interface AccommodationInfo {
  provided?: boolean;
  details?: string;
  nearbyHotels?: Array<{
    name: string;
    address: string;
    phone?: string;
    website?: string;
    distance?: string;
  }>;
}

export interface DashboardStats {
  totalEvents: number;
  activeEvents: number;
  totalPhotos: number;
  pendingRSVPs: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'event_created' | 'rsvp_received' | 'photo_uploaded' | 'event_updated';
  message: string;
  timestamp: string;
  eventId?: string;
  userId?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  role: 'superadmin' | 'organizer' | 'guest';
  eventId?: string;
  createdAt: string;
  lastLogin: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Filter and search types
export interface EventFilters {
  status?: 'planned' | 'active' | 'completed' | 'cancelled';
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface GalleryFilters {
  albumId?: string;
  isApproved?: boolean;
  uploadedBy?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface RSVPFilters {
  status?: 'pending' | 'confirmed' | 'cancelled';
  eventId?: string;
  dateFrom?: string;
  dateTo?: string;
}
