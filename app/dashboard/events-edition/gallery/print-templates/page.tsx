"use client";
import { useRouter } from "next/navigation";

export default function PrintTemplatesPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push("/dashboard/events-edition/gallery");
  };

  return (
    <div className="flex-1 p-12 bg-white min-h-screen">
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
      
      {/* A5 FORMAT Section */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-black mb-8">A5 FORMAT</h2>
        <div className="flex gap-6 justify-start">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="bg-gray-300 w-24 h-32 rounded mb-2"></div>
              <span className="text-black font-medium">Template {i + 1}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* BUSINESS CARD FORMAT Section */}
      <div>
        <h2 className="text-3xl font-bold text-black mb-8">BUSINESS CARD FORMAT</h2>
        <div className="flex gap-6 justify-start">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="bg-gray-300 w-32 h-20 rounded mb-2"></div>
              <span className="text-black font-medium">Template {i + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 