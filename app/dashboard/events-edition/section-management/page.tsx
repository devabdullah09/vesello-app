"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from '@/components/supabase-auth-provider';
import supabase from '@/lib/supabase';
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
      venueNameEn?: string;
      venueNamePl?: string;
      description: string;
      date: string;
      time: string;
      location: string;
      details?: string;
      mapUrl?: string;
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
  };
}

// Section config will be created dynamically using translations

export default function SectionManagementPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const sectionConfig = [
    { key: 'heroSection', name: t.sectionVisibility.sections.heroSection, description: t.sectionVisibility.sections.heroSectionDescription },
    { key: 'timelineSection', name: t.sectionVisibility.sections.timelineSection, description: t.sectionVisibility.sections.timelineSectionDescription },
    { key: 'ceremonySection', name: t.sectionVisibility.sections.ceremonySection, description: t.sectionVisibility.sections.ceremonySectionDescription },
    { key: 'ceremonyVenueSection', name: t.sectionVisibility.sections.ceremonyVenueSection, description: t.sectionVisibility.sections.ceremonyVenueSectionDescription },
    { key: 'seatingChartSection', name: t.sectionVisibility.sections.seatingChartSection, description: t.sectionVisibility.sections.seatingChartSectionDescription },
    { key: 'menuSection', name: t.sectionVisibility.sections.menuSection, description: t.sectionVisibility.sections.menuSectionDescription },
    { key: 'wishesAndGiftsSection', name: t.sectionVisibility.sections.wishesAndGiftsSection, description: t.sectionVisibility.sections.wishesAndGiftsSectionDescription },
    { key: 'teamSection', name: t.sectionVisibility.sections.teamSection, description: t.sectionVisibility.sections.teamSectionDescription },
    { key: 'accommodationSection', name: t.sectionVisibility.sections.accommodationSection, description: t.sectionVisibility.sections.accommodationSectionDescription },
    { key: 'transportationSection', name: t.sectionVisibility.sections.transportationSection, description: t.sectionVisibility.sections.transportationSectionDescription },
    { key: 'additionalInfoSection', name: t.sectionVisibility.sections.additionalInfoSection, description: t.sectionVisibility.sections.additionalInfoSectionDescription },
  ];

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
          {t.common.back}
        </button>
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

      {/* Section Toggles */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-black mb-6">{t.sectionVisibility.pageSections}</h2>
        <p className="text-gray-600 mb-6">
          {t.sectionVisibility.toggleDescription}
        </p>

        <div className="space-y-4">
          {sectionConfig.map((section) => (
            <div key={section.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-black">{section.name}</h3>
                <p className="text-sm text-gray-600">{section.description}</p>
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

      {/* Preview Link */}
      <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-black mb-4">{t.sectionVisibility.previewEventPage}</h3>
        <p className="text-gray-600 mb-4">
          {t.sectionVisibility.viewEventPage}
        </p>
        <a
          href={`/${wwwId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 bg-[#E5B574] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#D59C58] transition-colors"
        >
          <span>{t.sectionVisibility.previewEventPage}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}
