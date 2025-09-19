"use client";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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
  uploadButtonText: string;
  viewGalleryButtonText: string;
  missionTitle: string;
  missionText: string;
  goalText: string;
  countMeInButtonText: string;
  visible: boolean;
}

export default function EditAlbumPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [galleryContent, setGalleryContent] = useState<GalleryContent>({
    welcomeText: "Welcome To",
    coupleNames: "",
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

  const wwwId = searchParams.get('wwwId');

  useEffect(() => {
    if (!wwwId) {
      fetchEvents();
    } else {
      fetchEventGalleryContent();
    }
  }, [wwwId]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch('/api/dashboard/events', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch events');
      }

      const result = await response.json();
      // Filter events to only show those with gallery enabled
      const allEvents = result.data.data || [];
      const galleryEnabledEvents = allEvents.filter((event: Event) => event.galleryEnabled);
      setEvents(galleryEnabledEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const fetchEventGalleryContent = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Please log in to access this feature");
        return;
      }

      // Get event data
      const eventResponse = await fetch(`/api/event-id/${wwwId}`);
      if (!eventResponse.ok) {
        throw new Error('Event not found');
      }
      
      const eventResult = await eventResponse.json();
      const event = eventResult.data;
      setSelectedEvent(event);

      // Get or create gallery content
      const contentResponse = await fetch(`/api/dashboard/events/gallery-content?wwwId=${encodeURIComponent(wwwId || '')}`, {
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
          setGalleryContent(prev => ({
            ...prev,
            coupleNames: event.coupleNames
          }));
        }
      } else {
        // Use event data as defaults
        setGalleryContent(prev => ({
          ...prev,
          coupleNames: event.coupleNames
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch gallery content');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (wwwId) {
      router.push("/dashboard/events-edition/gallery/edit-album-page");
    } else {
      router.push("/dashboard/events-edition/gallery");
    }
  };

  const handleEventSelect = (selectedWwwId: string) => {
    router.push(`/dashboard/events-edition/gallery/edit-album-page?wwwId=${selectedWwwId}`);
  };

  const handleSave = async () => {
    if (!selectedEvent) return;

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
          wwwId: selectedEvent.wwwId,
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

  // Show event selection interface when no wwwId is provided
  if (!wwwId) {
    return (
      <div className="flex-1 p-12 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-start mb-8">
          <button
            onClick={handleBack}
            className="bg-black text-white px-6 py-2 rounded font-semibold hover:bg-gray-800 transition-colors"
          >
            Back
          </button>
        </div>
        
        <h1 className="text-3xl font-bold text-black mb-8">EDIT ALBUM PAGE</h1>
        
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-lg">Loading events...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-red-600 text-lg">Error: {error}</div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-black mb-6">Select an Event to Edit</h2>
            <p className="text-gray-600 mb-6">
              Choose an event to customize its gallery page content and appearance.
            </p>
            
            {events.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No events with gallery enabled found.</p>
                <p className="text-gray-500 text-sm mb-6">
                  To edit gallery content, you need to enable the gallery feature for your events first.
                </p>
                <button
                  onClick={() => router.push('/dashboard/events-list')}
                  className="bg-[#E5B574] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#D59C58] transition-colors"
                >
                  Manage Events
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => handleEventSelect(event.wwwId)}
                    className="border border-gray-200 rounded-lg p-6 hover:border-[#E5B574] hover:shadow-md transition-all cursor-pointer"
                  >
                    <h3 className="text-lg font-semibold text-black mb-2">{event.title}</h3>
                    <p className="text-[#E5B574] font-medium mb-3">{event.coupleNames}</p>
                    <p className="text-gray-600 text-sm mb-2">
                      {new Date(event.eventDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    {event.venue && (
                      <p className="text-gray-500 text-sm mb-3">{event.venue}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          event.status === 'active' ? 'bg-green-100 text-green-800' :
                          event.status === 'planned' ? 'bg-blue-100 text-blue-800' :
                          event.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </span>
                        <span className="px-2 py-1 rounded text-xs font-medium bg-[#E5B574] text-white">
                          Gallery Enabled
                        </span>
                      </div>
                      <span className="text-[#E5B574] text-sm font-medium">Edit →</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Show gallery content editor when event is selected
  if (!selectedEvent) {
    return (
      <div className="flex-1 p-12 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading event details...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Editor Panel */}
      <div className="w-1/2 p-8 bg-white">
        <div className="flex justify-between items-start mb-8">
          <button
            onClick={handleBack}
            className="bg-black text-white px-6 py-2 rounded font-semibold hover:bg-gray-800 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#E5B574] text-white px-6 py-2 rounded font-semibold hover:bg-[#D59C58] transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <h1 className="text-2xl font-bold text-black mb-6">Edit Gallery Content</h1>
        <p className="text-gray-600 mb-6">Editing: <span className="font-semibold">{selectedEvent.title}</span></p>

        <div className="space-y-6">
          {/* Visibility Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="text-sm font-medium text-gray-700">Gallery Visibility</label>
              <p className="text-xs text-gray-500">Show or hide the gallery section</p>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Welcome Text</label>
            <input
              type="text"
              value={galleryContent.welcomeText}
              onChange={(e) => handleContentChange('welcomeText', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E5B574]"
            />
          </div>

          {/* Couple Names */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Couple Names</label>
            <input
              type="text"
              value={galleryContent.coupleNames}
              onChange={(e) => handleContentChange('coupleNames', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E5B574]"
              placeholder={selectedEvent.coupleNames}
            />
          </div>

          {/* Upload Button Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Button Text</label>
            <input
              type="text"
              value={galleryContent.uploadButtonText}
              onChange={(e) => handleContentChange('uploadButtonText', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E5B574]"
            />
          </div>

          {/* View Gallery Button Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">View Gallery Button Text</label>
            <input
              type="text"
              value={galleryContent.viewGalleryButtonText}
              onChange={(e) => handleContentChange('viewGalleryButtonText', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E5B574]"
            />
          </div>

          {/* Mission Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mission Title</label>
            <input
              type="text"
              value={galleryContent.missionTitle}
              onChange={(e) => handleContentChange('missionTitle', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E5B574]"
            />
          </div>

          {/* Mission Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mission Text</label>
            <textarea
              value={galleryContent.missionText}
              onChange={(e) => handleContentChange('missionText', e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E5B574]"
            />
          </div>

          {/* Goal Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Goal Text</label>
            <input
              type="text"
              value={galleryContent.goalText}
              onChange={(e) => handleContentChange('goalText', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E5B574]"
            />
          </div>

          {/* Count Me In Button Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Count Me In Button Text</label>
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
      <div className="w-1/2 p-8 bg-gray-50">
        <h2 className="text-xl font-semibold text-black mb-6">Live Preview</h2>
        
        {/* Preview of gallery page */}
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto" style={{ transform: 'scale(0.8)', transformOrigin: 'top' }}>
          {galleryContent.visible ? (
            <div className="flex flex-col items-center justify-center relative z-10">
              <div className="text-center mt-2 mb-6">
                <div className="text-sm" style={{ fontFamily: 'Montserrat', fontWeight: 400 }}>{galleryContent.welcomeText}</div>
                <div className="text-2xl font-sail" style={{ fontWeight: 400, marginTop: 4, marginBottom: 0, letterSpacing: '0.5px', lineHeight: 1.1 }}>
                  {galleryContent.coupleNames || selectedEvent.coupleNames}
                </div>
                <div className="text-lg font-sail" style={{ background: 'linear-gradient(90deg, #E5B574 0%, #C18037 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginTop: -4, fontWeight: 400, letterSpacing: '0.5px', lineHeight: 1.1 }}>
                  Wedding
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
              <button className="bg-gradient-to-r from-[#E5B574] to-[#C18037] text-white font-semibold rounded-md px-6 py-1 mb-6 shadow text-sm" 
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
              <div className="text-lg font-bold text-gray-700 mb-2">Gallery Hidden</div>
              <div className="text-gray-500 text-sm">This section is currently unavailable</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}