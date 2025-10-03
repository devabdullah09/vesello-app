"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from '@/components/supabase-auth-provider';
import supabase from '@/lib/supabase';

interface EventData {
  id: string;
  wwwId: string;
  title: string;
  coupleNames: string;
  eventDate: string;
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
}

const sectionConfig = [
  { key: 'heroSection', name: 'Hero Section', description: 'Main banner with couple names and countdown timer', icon: '🏠' },
  { key: 'timelineSection', name: 'Wedding Timeline', description: 'Schedule of events for the wedding day', icon: '⏰' },
  { key: 'ceremonySection', name: 'Ceremony Details', description: 'Information about the wedding ceremony', icon: '💒' },
  { key: 'ceremonyVenueSection', name: 'Ceremony Venue', description: 'Details about the ceremony location', icon: '📍' },
  { key: 'seatingChartSection', name: 'Seating Chart', description: 'Guest seating arrangements', icon: '🪑' },
  { key: 'menuSection', name: 'Menu', description: 'Food and beverage options', icon: '🍽️' },
  { key: 'wishesAndGiftsSection', name: 'Wishes & Gifts', description: 'Gift registry and well wishes', icon: '🎁' },
  { key: 'teamSection', name: 'Wedding Team', description: 'Bridal party and wedding team', icon: '👥' },
  { key: 'accommodationSection', name: 'Accommodation', description: 'Hotel and lodging information', icon: '🏨' },
  { key: 'transportationSection', name: 'Transportation', description: 'Travel and parking details', icon: '🚗' },
  { key: 'additionalInfoSection', name: 'Additional Information', description: 'Extra details and special notes', icon: '📋' },
];

export default function ContentEditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const wwwId = searchParams.get('wwwId');

  useEffect(() => {
    if (!wwwId) {
      setError('Event ID is required');
      setLoading(false);
      return;
    }

    fetchEventData();
  }, [wwwId]);

  const fetchEventData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch(`/api/dashboard/events/day-details?wwwId=${wwwId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch event details');
      }

      const result = await response.json();
      setEventData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch event details');
    } finally {
      setLoading(false);
    }
  };

  const handleSectionToggle = async (sectionKey: string, isEnabled: boolean) => {
    if (!eventData) return;

    try {
      setSaving(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const updatedVisibility = {
        ...eventData.sectionVisibility,
        [sectionKey]: isEnabled
      };

      const response = await fetch(`/api/dashboard/events/section-visibility`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          wwwId,
          sectionVisibility: updatedVisibility
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update section visibility');
      }

      setEventData(prev => prev ? {
        ...prev,
        sectionVisibility: updatedVisibility
      } : null);

    } catch (err) {
      alert('Failed to update section. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.push(`/dashboard/events-edition/day-details?wwwId=${wwwId}`);
  };

  if (loading) {
    return (
      <div className="flex-1 p-12 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading event details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-12 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-lg">Error: {error}</div>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="flex-1 p-12 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-lg">No event details found</div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-12 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-start mb-8">
        <button
          onClick={handleBack}
          className="bg-black text-white px-6 py-2 rounded font-semibold hover:bg-gray-800 transition-colors"
        >
          Back
        </button>
        <div className="text-right">
          <h1 className="text-3xl font-bold text-black">Section Visibility</h1>
          <p className="text-gray-600 mt-2">Control which sections appear on your event page</p>
        </div>
      </div>

      {/* Event Info */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-xl font-semibold text-black mb-4">Event Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">Event Title</label>
            <p className="text-lg font-medium text-black">{eventData.title}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Couple Names</label>
            <p className="text-lg font-medium text-black">{eventData.coupleNames}</p>
          </div>
        </div>
      </div>

      {/* Section Visibility Toggles */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold text-black mb-6">Page Sections</h2>
        <p className="text-gray-600 mb-6">
          Toggle sections on/off to control what your guests see. Content editing is done directly on the event page using the inline editor.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sectionConfig.map((section) => (
            <div key={section.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{section.icon}</span>
                <div>
                  <h3 className="text-lg font-medium text-black">{section.name}</h3>
                  <p className="text-sm text-gray-600">{section.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`text-sm font-medium ${eventData.sectionVisibility[section.key as keyof typeof eventData.sectionVisibility] ? 'text-green-600' : 'text-gray-400'}`}>
                  {eventData.sectionVisibility[section.key as keyof typeof eventData.sectionVisibility] ? 'Visible' : 'Hidden'}
                </span>
                <button
                  onClick={() => handleSectionToggle(section.key, !eventData.sectionVisibility[section.key as keyof typeof eventData.sectionVisibility])}
                  disabled={saving}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#E5B574] focus:ring-offset-2 ${
                    eventData.sectionVisibility[section.key as keyof typeof eventData.sectionVisibility]
                      ? 'bg-[#E5B574]'
                      : 'bg-gray-200'
                  } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      eventData.sectionVisibility[section.key as keyof typeof eventData.sectionVisibility]
                        ? 'translate-x-6'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>

        {saving && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center space-x-2 text-[#E5B574]">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#E5B574]"></div>
              <span>Saving changes...</span>
            </div>
          </div>
        )}
      </div>

      {/* Content Editing Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <div className="flex items-start space-x-3">
          <div className="text-blue-600 text-xl">💡</div>
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Content Editing</h3>
            <p className="text-blue-800 mb-3">
              To edit the actual content of each section (text, images, details), visit your event page and use the inline editor.
            </p>
            <ol className="text-blue-800 text-sm space-y-1 ml-4">
              <li>1. Visit your event page using the preview link below</li>
              <li>2. Click "Edit Mode" button in the bottom-right corner</li>
              <li>3. Click the edit icon (✏️) on any section to edit its content</li>
              <li>4. Make your changes and save - they'll appear immediately!</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Preview Link */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-black mb-4">Preview & Edit Your Event Page</h3>
        <p className="text-gray-600 mb-4">
          View your event page and use the inline editor to customize all content.
        </p>
        <a
          href={`/event-id/${wwwId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 bg-[#E5B574] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#D59C58] transition-colors"
        >
          <span>Open Event Page & Edit Content</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}