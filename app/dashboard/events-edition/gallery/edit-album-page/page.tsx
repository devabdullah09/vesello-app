"use client";
import { useLanguage } from '@/components/language-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { useEventEdition } from "@/components/event-edition-context";

interface Event {
  id: string;
  wwwId: string;
  title: string;
  coupleNames: string;
  eventDate: string;
  venue?: string;
  status: string;
  galleryEnabled: boolean;
}

interface GalleryContent {
  welcomeText: string;
  coupleNames: string;
  weddingText: string;
  uploadButtonText: string;
  viewGalleryButtonText: string;
  missionTitle: string;
  missionText: string;
  goalText: string;
  countMeInButtonText: string;
  visible: boolean;
}

export default function EditAlbumPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedEvent: contextEvent, setSelectedEvent: setContextSelectedEvent, loading: contextLoading } = useEventEdition();
  const [galleryContent, setGalleryContent] = useState<GalleryContent>({
    welcomeText: "Welcome To",
    coupleNames: "",
    weddingText: "Wedding",
    uploadButtonText: "Add Your Photos & Videos Now",
    viewGalleryButtonText: "View Gallery",
    missionTitle: "Dear Guests - We Have An Important Mission For You:",
    missionText: "Like, Follow, And Tag The Amazing Team Behind Today's Magic. Every Click Is A Like A Loud 'Thank You!' To Them!",
    goalText: "Our Goal: 50 New Followers!",
    countMeInButtonText: "COUNT ME IN!",
    visible: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (contextEvent) {
      fetchEventGalleryContent();
    } else if (!contextLoading) {
      setLoading(false);
    }
  }, [contextEvent, contextLoading]);

  const fetchEventGalleryContent = async () => {
    if (!contextEvent?.wwwId) return;

    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Please log in to access this feature");
        return;
      }

      // Get or create gallery content
      const contentResponse = await fetch(`/api/dashboard/events/gallery-content?wwwId=${encodeURIComponent(contextEvent.wwwId)}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (contentResponse.ok) {
        const contentResult = await contentResponse.json();
        if (contentResult.success && contentResult.data) {
          setGalleryContent(contentResult.data);
        } else {
          // Use event data as defaults
          if (contextEvent) {
            setGalleryContent(prev => ({
              ...prev,
              coupleNames: contextEvent.coupleNames
            }));
          }
        }
      } else {
        // Use event data as defaults
        if (contextEvent) {
          setGalleryContent(prev => ({
            ...prev,
            coupleNames: contextEvent.coupleNames
          }));
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch gallery content');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push("/dashboard/events-edition/gallery");
  };

  const handleSwitchEvent = () => {
    setContextSelectedEvent(null);
    router.push("/dashboard/events-edition/select-event");
  };

  const handleSave = async () => {
    if (!contextEvent) return;

    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/dashboard/events/gallery-content', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wwwId: contextEvent.wwwId,
          content: galleryContent
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        if (errorData.sqlNeeded) {
          alert(`Database Setup Required!\n\nPlease run this SQL in your Supabase SQL Editor:\n\nCREATE TABLE gallery_content (\n  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,\n  event_id TEXT NOT NULL,\n  content JSONB NOT NULL,\n  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),\n  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),\n  UNIQUE(event_id)\n);\n\nCREATE INDEX idx_gallery_content_event_id ON gallery_content(event_id);\n\nCREATE POLICY "Service role can manage all gallery content" ON gallery_content FOR ALL USING (auth.role() = 'service_role');`);
          return;
        }
        
        throw new Error(errorData.error || 'Failed to save gallery content');
      }

      alert('Gallery content saved successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save gallery content');
    } finally {
      setSaving(false);
    }
  };

  const handleContentChange = (field: keyof GalleryContent, value: string | boolean) => {
    setGalleryContent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex-1 p-12 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
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

  if (contextLoading) {
    return (
      <div className="flex-1 p-12 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!contextEvent) {
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
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100">
      {/* Editor Panel */}
      <div className="w-full lg:w-1/2 p-4 md:p-8 bg-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
          <button
            onClick={handleBack}
            className="bg-black text-white px-4 md:px-6 py-2 rounded font-semibold hover:bg-gray-800 transition-colors text-sm md:text-base"
          >
            {t.galleryContentEdit.back}
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleSwitchEvent}
              className="bg-gray-200 text-black px-4 py-2 rounded font-semibold hover:bg-gray-300 transition-colors text-sm"
            >
              {t.galleryContentEdit.switchEvent}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#E5B574] text-white px-4 md:px-6 py-2 rounded font-semibold hover:bg-[#D59C58] transition-colors disabled:opacity-50 text-sm md:text-base"
            >
              {saving ? t.galleryContentEdit.saving : t.galleryContentEdit.saveChanges}
            </button>
          </div>
        </div>

        <h1 className="text-xl md:text-2xl font-bold text-black mb-4 md:mb-6">{t.galleryContentEdit.title}</h1>
        <p className="text-gray-600 mb-4 md:mb-6 text-sm md:text-base">{t.galleryContentEdit.editing}: <span className="font-semibold">{contextEvent.title}</span></p>

        <div className="space-y-6">
          {/* Visibility Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="text-sm font-medium text-gray-700">{t.galleryContentEdit.galleryVisibility}</label>
              <p className="text-xs text-gray-500">{t.galleryContentEdit.galleryVisibilityDescription}</p>
            </div>
            <button
              className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${galleryContent.visible ? 'bg-[#E5B574]' : 'bg-gray-300'}`}
              onClick={() => handleContentChange('visible', !galleryContent.visible)}
            >
              <span
                className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${galleryContent.visible ? 'translate-x-6' : ''}`}
              />
            </button>
          </div>

          {/* Welcome Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.galleryContentEdit.welcomeText}</label>
            <input
              type="text"
              value={galleryContent.welcomeText}
              onChange={(e) => handleContentChange('welcomeText', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E5B574]"
            />
          </div>

          {/* Couple Names */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.galleryContentEdit.coupleNames}</label>
            <input
              type="text"
              value={galleryContent.coupleNames}
              onChange={(e) => handleContentChange('coupleNames', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E5B574]"
              placeholder={contextEvent.coupleNames}
            />
          </div>

          {/* Wedding Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Wedding Text (e.g., "Wedding", "Wesele")</label>
            <input
              type="text"
              value={galleryContent.weddingText || 'Wedding'}
              onChange={(e) => handleContentChange('weddingText', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E5B574]"
              placeholder="Wedding"
            />
          </div>

          {/* Upload Button Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.galleryContentEdit.uploadButtonText}</label>
            <input
              type="text"
              value={galleryContent.uploadButtonText}
              onChange={(e) => handleContentChange('uploadButtonText', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E5B574]"
            />
          </div>

          {/* View Gallery Button Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.galleryContentEdit.viewGalleryButtonText}</label>
            <input
              type="text"
              value={galleryContent.viewGalleryButtonText}
              onChange={(e) => handleContentChange('viewGalleryButtonText', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E5B574]"
            />
          </div>

          {/* Mission Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.galleryContentEdit.missionTitle}</label>
            <input
              type="text"
              value={galleryContent.missionTitle}
              onChange={(e) => handleContentChange('missionTitle', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E5B574]"
            />
          </div>

          {/* Mission Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.galleryContentEdit.missionText}</label>
            <textarea
              value={galleryContent.missionText}
              onChange={(e) => handleContentChange('missionText', e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E5B574]"
            />
          </div>

          {/* Goal Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.galleryContentEdit.goalText}</label>
            <input
              type="text"
              value={galleryContent.goalText}
              onChange={(e) => handleContentChange('goalText', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E5B574]"
            />
          </div>

          {/* Count Me In Button Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.galleryContentEdit.countMeInButtonText}</label>
            <input
              type="text"
              value={galleryContent.countMeInButtonText}
              onChange={(e) => handleContentChange('countMeInButtonText', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E5B574]"
            />
          </div>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="w-full lg:w-1/2 p-4 md:p-8 bg-gray-50 border-t lg:border-t-0 lg:border-l">
        <h2 className="text-lg md:text-xl font-semibold text-black mb-4 md:mb-6">{t.galleryContentEdit.livePreview}</h2>
        
        {/* Preview of gallery page */}
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 max-w-md mx-auto" style={{ transformOrigin: 'top' }}>
          {galleryContent.visible ? (
            <div className="flex flex-col items-center justify-center relative z-10">
              <div className="text-center mt-2 mb-6">
                <div className="text-xs md:text-sm" style={{ fontFamily: 'Montserrat', fontWeight: 400 }}>{galleryContent.welcomeText}</div>
                <div className="text-xl md:text-2xl font-sail" style={{ fontWeight: 400, marginTop: 4, marginBottom: 0, letterSpacing: '0.5px', lineHeight: 1.1 }}>
                  {galleryContent.coupleNames || contextEvent.coupleNames}
                </div>
                <div className="text-base md:text-lg font-sail" style={{ background: 'linear-gradient(90deg, #E5B574 0%, #C18037 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginTop: -4, fontWeight: 400, letterSpacing: '0.5px', lineHeight: 1.1 }}>
                  {galleryContent.weddingText || 'Wedding'}
                </div>
              </div>

              {/* Upload Box */}
              <div className="w-full border border-[#E5B574] rounded-md py-6 px-4 flex flex-col items-center mb-6 bg-white" style={{ minHeight: 120 }}>
                <Image src="/images/Gallery/photo_icon.png" alt="Add Photos" width={30} height={30} className="mb-2" />
                <div className="text-xs text-[#08080A] mt-1 text-center" style={{ fontFamily: 'Montserrat', fontWeight: 500 }}>
                  {galleryContent.uploadButtonText}
                </div>
              </div>

              {/* View Gallery Button */}
              <button className="bg-gradient-to-r from-[#E5B574] to-[#C18037] text-white font-semibold rounded-md px-6 py-1 mb-6 shadow text-xs md:text-sm" 
               style={{ fontFamily: 'Montserrat', fontWeight: 600 }}>
                {galleryContent.viewGalleryButtonText}
              </button>

              {/* Mission Statement */}
              <div className="text-center text-[#08080A] mb-6 text-xs" style={{ fontFamily: 'Montserrat', fontWeight: 400, lineHeight: 1.4 }}>
                <div className="mb-1 font-medium">{galleryContent.missionTitle}</div>
                <div className="mb-1">{galleryContent.missionText}</div>
                <div className="font-bold">{galleryContent.goalText}</div>
              </div>

              {/* Count Me In Button */}
              <button className="bg-black text-white font-bold rounded px-4 py-1 shadow text-xs" style={{ fontFamily: 'Montserrat', fontWeight: 700 }}>
                {galleryContent.countMeInButtonText}
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48">
              <div className="text-lg font-bold text-gray-700 mb-2">{t.gallery.notAvailable}</div>
              <div className="text-gray-500 text-sm">{t.gallery.notAvailable}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}