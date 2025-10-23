"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from '@/components/supabase-auth-provider';
import { supabase } from "@/lib/supabase";

export default function EventsGeneralInfoPage() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading } = useAuth();
  const [wwwId, setWwwId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [generalInfo, setGeneralInfo] = useState<{
    coupleNames: string;
    venue?: string;
    eventDate?: string;
    eventUrl?: string;
    title?: string;
    eventId?: string;
    wwwId?: string;
  } | null>(null);
  const [editDate, setEditDate] = useState("");
  const [organizerEvents, setOrganizerEvents] = useState<any[]>([]);
  const [checkingOrganizer, setCheckingOrganizer] = useState(true);

  const handleBack = () => {
    router.push("/dashboard/events-edition");
  };

  // Check if organizer has events and auto-load single event
  useEffect(() => {
    if (!authLoading && user && userProfile?.role === 'organizer') {
      fetchOrganizerEvents();
    } else if (!authLoading && user && userProfile?.role !== 'organizer') {
      setCheckingOrganizer(false);
    }
  }, [user, userProfile, authLoading]);

  const fetchOrganizerEvents = async () => {
    try {
      setCheckingOrganizer(true);
      console.log('Fetching organizer events...');
      
      // Get the session token from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || '';
      
      // Get organizer's assigned events
      const response = await fetch('/api/dashboard/organizer/event', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch events data');
      }

      const result = await response.json();
      console.log('Organizer events result:', result);
      
      if (result.success && result.data) {
        console.log('Setting organizer events:', result.data);
        
        // Handle both array and single object responses
        const eventsArray = Array.isArray(result.data) ? result.data : [result.data];
        setOrganizerEvents(eventsArray);
        
        // If organizer has only one event, automatically load its info
        if (eventsArray.length === 1) {
          const event = eventsArray[0];
          console.log('Single event found, auto-loading:', event.www_id);
          setWwwId(event.www_id);
          await loadGeneralInfo(event.www_id);
          return;
        } else {
          console.log('Multiple events found:', eventsArray.length);
        }
      } else {
        console.log('No events found or error:', result);
      }
    } catch (error) {
      console.error('Error fetching organizer events:', error);
    } finally {
      setCheckingOrganizer(false);
    }
  };

  const formattedDate = useMemo(() => {
    if (!generalInfo?.eventDate) return "";
    try {
      const d = new Date(generalInfo.eventDate);
      if (isNaN(d.getTime())) return generalInfo.eventDate;
      return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return generalInfo?.eventDate ?? "";
    }
  }, [generalInfo]);

  const loadGeneralInfo = async (id: string) => {
    if (!id) return;
    console.log('Loading general info for:', id);
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const res = await fetch(`/api/dashboard/events/general-info?wwwId=${encodeURIComponent(id)}` , {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Failed to load event info");
      }
      const result = await res.json();
      console.log('General info loaded:', result.data);
      setGeneralInfo(result.data);
      // initialize editable date
      const iso = result?.data?.eventDate as string | undefined;
      if (iso) {
        const d = new Date(iso);
        if (!isNaN(d.getTime())) setEditDate(d.toISOString().slice(0, 10));
      } else {
        setEditDate("");
      }
      // Auto-show modal for single event organizers
      console.log('Setting showModal to true');
      setShowModal(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to fetch event info");
      setShowModal(false);
    } finally {
      setLoading(false);
    }
  };

  const saveDate = async () => {
    if (!generalInfo?.wwwId) return;
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const res = await fetch(`/api/dashboard/events/general-info`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ wwwId: generalInfo.wwwId, eventDate: editDate }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Failed to update date");
      }
      const result = await res.json();
      setGeneralInfo(result.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to update");
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking organizer events
  if (checkingOrganizer) {
    return (
      <div className="flex-1 p-12 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // If organizer has multiple events, show event selection
  if (userProfile?.role === 'organizer' && organizerEvents && organizerEvents.length > 1) {
    return (
      <div className="flex-1 p-12 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-start mb-8">
          <button
            onClick={handleBack}
            className="bg-black text-white px-6 py-2 rounded font-semibold hover:bg-gray-800 transition-colors"
          >
            Back
          </button>
          <div className="text-black font-semibold">
            Logout
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-black mb-10">SELECT EVENT TO MANAGE</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {organizerEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => {
                setWwwId(event.www_id);
                loadGeneralInfo(event.www_id);
              }}
            >
              <div className="text-xl font-bold text-black mb-4">
                {event.title}
              </div>
              <div className="text-gray-600 mb-2">
                <strong>Couple:</strong> {event.couple_names}
              </div>
              <div className="text-gray-600 mb-2">
                <strong>Date:</strong> {new Date(event.event_date).toLocaleDateString()}
              </div>
              <div className="text-gray-600 mb-4">
                <strong>Event ID:</strong> {event.www_id}
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-2 py-1 rounded text-sm ${
                  event.gallery_enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {event.gallery_enabled ? 'Gallery' : 'No Gallery'}
                </span>
                <span className={`px-2 py-1 rounded text-sm ${
                  event.rsvp_enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {event.rsvp_enabled ? 'RSVP' : 'No RSVP'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Debug logging
  console.log('Render check:', {
    role: userProfile?.role,
    eventsLength: organizerEvents.length,
    showModal,
    hasGeneralInfo: !!generalInfo,
    organizerEvents
  });

  // If organizer has single event and we have general info, show it directly
  if (userProfile?.role === 'organizer' && organizerEvents && organizerEvents.length === 1 && generalInfo) {
    return (
      <div className="flex-1 p-12 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-start mb-8">
          <button
            onClick={handleBack}
            className="bg-black text-white px-6 py-2 rounded font-semibold hover:bg-gray-800 transition-colors"
          >
            Back
          </button>
          <div className="text-black font-semibold">
            Logout
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-black mb-10">EVENTS GENERAL INFO</h1>
        
        {/* Show the modal content directly instead of as an overlay */}
        <div className="bg-white w-full max-w-2xl mx-auto rounded-xl shadow-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-black">Event's General Info</h2>
            <button
              onClick={() => setShowModal(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event URL</label>
              <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                {generalInfo.eventUrl || `http://localhost:3000/event-id/${generalInfo.wwwId}`}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Couple Names</label>
              <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                {generalInfo.coupleNames}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
              <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                {generalInfo.venue || 'Not specified'}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
              <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                {formattedDate}
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              WWW ID: {generalInfo.wwwId}
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="bg-black text-white px-4 py-2 rounded font-semibold hover:bg-gray-800 transition-colors"
            >
              Close
            </button>
          </div>
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
          Back
        </button>
        <div className="text-black font-semibold">
          Logout
        </div>
      </div>
      
      <h1 className="text-3xl font-bold text-black mb-10">EVENTS GENERAL INFO</h1>
      
      <div className="max-w-2xl space-y-8">
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Enter your event WWW ID</label>
          <div className="flex gap-3 items-center">
            <input
              value={wwwId}
              onChange={(e) => setWwwId(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter") loadGeneralInfo(wwwId.trim())
              }}
              placeholder="e.g. TK91513"
              className="w-full px-4 py-3 border border-gray-300 rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent tracking-widest uppercase"
            />
            <button
              onClick={() => loadGeneralInfo(wwwId.trim())}
              className="bg-gradient-to-r from-[#E5B574] via-[#D59C58] to-[#C18037] text-white font-semibold px-6 py-3 rounded-md shadow-md hover:from-[#D59C58] hover:to-[#E5B574] transition-colors disabled:opacity-50"
              disabled={loading || !wwwId.trim()}
            >
              {loading ? "Loading..." : "Load"}
            </button>
          </div>
          {error && <div className="mt-2 text-red-600 text-sm">{error}</div>}
        </div>
      </div>

      {showModal && generalInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-white w-full max-w-2xl mx-4 rounded-xl shadow-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl font-bold text-black">Event's General Info</h2>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="space-y-6">
              <div>
                <div className="text-sm text-gray-600 mb-1">Event URL</div>
                <div className="flex items-center gap-2">
                  <div className="text-xl font-semibold text-black break-all">{generalInfo.eventUrl}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Couple Names</div>
                  <div className="text-lg font-semibold text-black">{generalInfo.coupleNames || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Venue</div>
                  <div className="text-lg font-semibold text-black">{generalInfo.venue || '-'}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Event Date</div>
                  <div className="text-lg font-semibold text-black">{formattedDate || '-'}</div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Update Date</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="text-xs text-gray-500">WWW ID: {generalInfo.wwwId}</div>
                <button
                  onClick={saveDate}
                  className="bg-black text-white px-6 py-2 rounded-md font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Date"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 