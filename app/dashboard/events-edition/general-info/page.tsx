"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function EventsGeneralInfoPage() {
  const router = useRouter();
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

  const handleBack = () => {
    router.push("/dashboard/events-edition");
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
      setGeneralInfo(result.data);
      // initialize editable date
      const iso = result?.data?.eventDate as string | undefined;
      if (iso) {
        const d = new Date(iso);
        if (!isNaN(d.getTime())) setEditDate(d.toISOString().slice(0, 10));
      } else {
        setEditDate("");
      }
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