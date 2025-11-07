"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from '@/components/supabase-auth-provider';
import supabase from '@/lib/supabase';
import { useEventEdition } from "@/components/event-edition-context";
import { useLanguage } from '@/components/language-context';

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

// Section config will be created dynamically using translations

export default function ContentEditorPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { user } = useAuth();
  const { selectedEvent, setSelectedEvent } = useEventEdition();
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const sectionConfig = [
    { key: 'heroSection', name: t.sectionVisibility.sections.heroSection, description: t.sectionVisibility.sections.heroSectionDescription, icon: '🏠' },
    { key: 'timelineSection', name: t.sectionVisibility.sections.timelineSection, description: t.sectionVisibility.sections.timelineSectionDescription, icon: '⏰' },
    { key: 'ceremonySection', name: t.sectionVisibility.sections.ceremonySection, description: t.sectionVisibility.sections.ceremonySectionDescription, icon: '💒' },
    { key: 'ceremonyVenueSection', name: t.sectionVisibility.sections.ceremonyVenueSection, description: t.sectionVisibility.sections.ceremonyVenueSectionDescription, icon: '📍' },
    { key: 'seatingChartSection', name: t.sectionVisibility.sections.seatingChartSection, description: t.sectionVisibility.sections.seatingChartSectionDescription, icon: '🪑' },
    { key: 'menuSection', name: t.sectionVisibility.sections.menuSection, description: t.sectionVisibility.sections.menuSectionDescription, icon: '🍽️' },
    { key: 'wishesAndGiftsSection', name: t.sectionVisibility.sections.wishesAndGiftsSection, description: t.sectionVisibility.sections.wishesAndGiftsSectionDescription, icon: '🎁' },
    { key: 'teamSection', name: t.sectionVisibility.sections.teamSection, description: t.sectionVisibility.sections.teamSectionDescription, icon: '👥' },
    { key: 'accommodationSection', name: t.sectionVisibility.sections.accommodationSection, description: t.sectionVisibility.sections.accommodationSectionDescription, icon: '🏨' },
    { key: 'transportationSection', name: t.sectionVisibility.sections.transportationSection, description: t.sectionVisibility.sections.transportationSectionDescription, icon: '🚗' },
    { key: 'additionalInfoSection', name: t.sectionVisibility.sections.additionalInfoSection, description: t.sectionVisibility.sections.additionalInfoSectionDescription, icon: '📋' },
  ];

  useEffect(() => {
    if (selectedEvent) {
      fetchEventData();
    } else {
      setLoading(false);
    }
  }, [selectedEvent]);

  const fetchEventData = async () => {
    if (!selectedEvent?.wwwId) return;

    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch(`/api/dashboard/events/day-details?wwwId=${selectedEvent.wwwId}`, {
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
    if (!eventData || !selectedEvent) return;

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
          wwwId: selectedEvent.wwwId,
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
    router.push(`/dashboard/events-edition/day-details`);
  };

  const handleSwitchEvent = () => {
    setSelectedEvent(null);
    router.push("/dashboard/events-edition/select-event");
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

  if (!selectedEvent || !eventData) {
    return (
      <div className="flex-1 p-12 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg mb-4">No event selected</div>
          <button
            onClick={() => router.push("/dashboard/events-edition/select-event")}
            className="bg-gradient-to-r from-[#E5B574] via-[#D59C58] to-[#C18037] text-white font-semibold px-6 py-3 rounded-md shadow-md hover:from-[#D59C58] hover:to-[#E5B574] transition-colors"
          >
            Select Event
          </button>
        </div>
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
          {t.common.back}
        </button>
        <button
          onClick={handleSwitchEvent}
          className="bg-gray-200 text-black px-4 py-2 rounded font-semibold hover:bg-gray-300 transition-colors"
        >
          {t.galleryContentEdit.switchEvent}
        </button>
      </div>
      <div className="flex justify-between items-start mb-8">
        <div className="text-right">
          <h1 className="text-3xl font-bold text-black">{t.sectionVisibility.title}</h1>
          <p className="text-gray-600 mt-2">{t.sectionVisibility.controlWhichSections}</p>
        </div>
      </div>

      {/* Event Info */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-xl font-semibold text-black mb-4">{t.sectionVisibility.eventInformation}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">{t.sectionVisibility.eventTitle}</label>
            <p className="text-lg font-medium text-black">{eventData.title}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">{t.sectionVisibility.coupleNames}</label>
            <p className="text-lg font-medium text-black">{eventData.coupleNames}</p>
          </div>
        </div>
      </div>

      {/* Section Visibility Toggles */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold text-black mb-6">{t.sectionVisibility.pageSections}</h2>
        <p className="text-gray-600 mb-6">
          {t.sectionVisibility.toggleDescription}
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
                  {eventData.sectionVisibility[section.key as keyof typeof eventData.sectionVisibility] ? t.sectionVisibility.visible : t.sectionVisibility.hidden}
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
              <span>{t.sectionVisibility.savingChanges}</span>
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
              {t.sectionVisibility.contentEditingDescription}
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
        <h3 className="text-lg font-semibold text-black mb-4">{t.sectionVisibility.previewEventPage}</h3>
        <p className="text-gray-600 mb-4">
          {t.sectionVisibility.viewEventPage}
        </p>
        <a
          href={`/${selectedEvent.wwwId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 bg-[#E5B574] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#D59C58] transition-colors"
        >
          <span>{t.sectionVisibility.openEventPageEditContent}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}
