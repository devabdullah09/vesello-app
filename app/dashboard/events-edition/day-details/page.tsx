"use client";
import { useRouter } from "next/navigation";

export default function EventsDayDetailsPage() {
  const router = useRouter();

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
        <div className="flex flex-col items-end space-y-2">
          <button className="bg-gradient-to-r from-[#E5B574] via-[#D59C58] to-[#C18037] text-white font-semibold px-6 py-2 rounded-md shadow-md hover:from-[#D59C58] hover:to-[#E5B574] transition-colors">
            Edit Website
          </button>
          <span className="text-sm text-black">*required</span>
        </div>
      </div>
      
      <h1 className="text-3xl font-bold text-black mb-8">EVENT'S DAY DETAILS MANAGEMENT</h1>
      
      <div className="flex justify-between items-start">
        {/* Left content - Event Link Section */}
        <div className="flex-1">
          <div className="mb-6">
            <p className="text-lg text-gray-700 mb-4">
              Copy the link and invite guests to your event details page
            </p>
            <div className="text-2xl font-bold text-black  mb-4">
              www.vasello.com/15fg75t
            </div>

            <p className="text-sm text-gray-700 mb-4">
              Download the QR code and share the event's main page with your guests:
            </p>
          </div>
        </div>
        
        {/* Right content - QR Code Section */}
        <div className="flex flex-col items-center ml-12">
          <div className="bg-black w-32 h-32 mb-4 flex items-center justify-center">
            <div className="text-white text-xs text-center">
              QR Code
            </div>
          </div>
          <div className="text-left">
            <button className="text-[#E5B574] font-semibold hover:underline">
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 