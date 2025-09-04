"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EventsGeneralInfoPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);

  const handleBack = () => {
    router.push("/dashboard/events-edition");
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
        {/* Event URL Section */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Your event's unique URL:
          </label>
          <div className="text-2xl font-bold text-black">
            www.vasello.com/l5fg75t
          </div>
        </div>

        {/* Event Date Section */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Enter the date of your event
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="MM/DD/YY"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              onClick={() => setShowCalendar(true)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              📅
            </button>
          </div>
        </div>

        {/* Calendar Popup */}
        {showCalendar && (
          <div className="absolute z-50 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <button className="text-gray-500 hover:text-gray-700">‹</button>
              <div className="font-semibold">Aug 2023</div>
              <button className="text-gray-500 hover:text-gray-700">›</button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 mb-4">
              <div className="text-center text-sm text-gray-500">S</div>
              <div className="text-center text-sm text-gray-500">M</div>
              <div className="text-center text-sm text-gray-500">T</div>
              <div className="text-center text-sm text-gray-500">W</div>
              <div className="text-center text-sm text-gray-500">T</div>
              <div className="text-center text-sm text-gray-500">F</div>
              <div className="text-center text-sm text-gray-500">S</div>
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 31 }, (_, i) => (
                <button
                  key={i + 1}
                  className={`w-8 h-8 text-sm rounded-full hover:bg-gray-100 ${
                    i + 1 === 17 ? "bg-purple-500 text-white" : "text-gray-700"
                  }`}
                  onClick={() => {
                    setSelectedDate(`08/${String(i + 1).padStart(2, '0')}/23`);
                    setShowCalendar(false);
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
              <button
                onClick={() => setShowCalendar(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowCalendar(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 