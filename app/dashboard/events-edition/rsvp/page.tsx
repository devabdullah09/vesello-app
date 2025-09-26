"use client";
import { useRouter } from "next/navigation";

export default function RSVPManagementPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push("/dashboard/events-edition");
  };

  const handleModuleClick = (module: string) => {
    router.push(`/dashboard/events-edition/rsvp/${module}`);
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
      </div>
      
      <h1 className="text-3xl font-bold text-black mb-8">RSVP MANAGEMENT</h1>
      
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-semibold text-black mb-6">RSVP Management Modules</h2>
        <p className="text-gray-600 mb-8">
          Choose a module to manage different aspects of your RSVP system.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* QR CODE & PRINT GUESTS Module */}
          <div 
            onClick={() => handleModuleClick('qr-code')}
            className="bg-black text-white rounded-lg p-8 cursor-pointer hover:bg-gray-800 transition-colors group"
          >
            <div className="text-center">
              <h4 className="text-lg font-bold text-white uppercase mb-4">QR CODE & PRINT GUESTS</h4>
              <p className="text-gray-300 text-sm mb-6">
                Generate QR codes and print templates for guest RSVP management
              </p>
              <button className="bg-gradient-to-r from-[#E5B574] to-[#D59C58] text-white px-6 py-3 rounded font-semibold hover:from-[#D59C58] hover:to-[#C18037] transition-all">
                Manage
              </button>
            </div>
          </div>

          {/* MANAGE FORM Module */}
          <div 
            onClick={() => handleModuleClick('manage-form')}
            className="bg-black text-white rounded-lg p-8 cursor-pointer hover:bg-gray-800 transition-colors group"
          >
            <div className="text-center">
              <h4 className="text-lg font-bold text-white uppercase mb-4">MANAGE FORM</h4>
              <p className="text-gray-300 text-sm mb-6">
                Customize RSVP form fields and manage form settings
              </p>
              <button className="bg-gradient-to-r from-[#E5B574] to-[#D59C58] text-white px-6 py-3 rounded font-semibold hover:from-[#D59C58] hover:to-[#C18037] transition-all">
                Manage
              </button>
            </div>
          </div>

          {/* MANAGE GUESTS Module */}
          <div 
            onClick={() => handleModuleClick('manage-guests')}
            className="bg-black text-white rounded-lg p-8 cursor-pointer hover:bg-gray-800 transition-colors group"
          >
            <div className="text-center">
              <h4 className="text-lg font-bold text-white uppercase mb-4">MANAGE GUESTS</h4>
              <p className="text-gray-300 text-sm mb-6">
                View guest responses, manage guest lists, and track RSVPs
              </p>
              <button className="bg-gradient-to-r from-[#E5B574] to-[#D59C58] text-white px-6 py-3 rounded font-semibold hover:from-[#D59C58] hover:to-[#C18037] transition-all">
                Manage
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}