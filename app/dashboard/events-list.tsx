"use client";
import Sidebar from "@/components/layout/Sidebar";
import { useEffect, useState } from "react";

const mockEvents = Array(8).fill({
  wwwId: "TK91513",
  date: "6/3/2025",
  status: "Planned",
  gallery: true,
  rsvp: true,
});

export default function EventsListPage() {
  const [user, setUser] = useState<{ role: "organizer" | "superadmin" } | null>(null);

  useEffect(() => {
    const auth = localStorage.getItem("vesello_auth");
    if (auth) {
      const parsed = JSON.parse(auth);
      setUser(parsed);
    }
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar role={user.role} />
      <div className="flex-1 p-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-black">EVENTS LIST</h1>
          <button className="bg-gradient-to-r from-[#E5B574] via-[#D59C58] to-[#C18037] text-white font-semibold px-6 py-2 rounded-md shadow-md hover:from-[#D59C58] hover:to-[#E5B574] transition-colors">Add Event</button>
        </div>
        <div className="grid grid-cols-5 gap-4 mb-4">
          <input className="border rounded px-3 py-2" placeholder="Enter WWW ID..." />
          <input className="border rounded px-3 py-2" placeholder="Enter Date" />
          <input className="border rounded px-3 py-2" placeholder="Enter Status..." />
          <input className="border rounded px-3 py-2" placeholder="Enter Gallery..." />
          <input className="border rounded px-3 py-2" placeholder="Enter RSVP..." />
        </div>
        <button className="mb-6 bg-gray-400 text-white px-6 py-2 rounded">Clear Filters</button>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg border">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">WWW ID</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">DATE</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">STATUS</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">GALLERY</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">RSVP</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {mockEvents.map((event, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{event.wwwId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{event.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{event.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">{event.gallery ? <input type="checkbox" checked readOnly /> : null}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">{event.rsvp ? <span role="img" aria-label="rsvp">📷</span> : null}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-blue-600 font-semibold mr-4">Edit</button>
                    <button className="text-red-500 font-semibold">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 