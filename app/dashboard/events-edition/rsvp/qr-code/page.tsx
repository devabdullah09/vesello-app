"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

const eventLink = "www.vasello.com/15fg75t/rsvp";
const qrCodeUrl = "/images/qr-code-placeholder.png"; // Replace with actual QR code logic if needed
const templateImg = "/images/template1.png";

const templates = [1, 2, 3, 4, 5];

export default function QrCodePrintGuestsPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push("/dashboard/events-edition/rsvp");
  };

  const handleTemplateClick = (idx: number) => {
    router.push(`/dashboard/events-edition/rsvp/template/${idx + 1}`);
  };

  const handleAddTemplate = () => {
    alert("Organizer can add template from Canva (integration pending)");
  };

  return (
    <div className="flex-1 p-4 sm:p-8 md:p-12 bg-white min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
        <button
          onClick={handleBack}
          className="bg-black text-white px-6 py-2 rounded font-semibold hover:bg-gray-800 transition-colors"
        >
          Back
        </button>
      </div>
      <div className="bg-[#F5F5F5] rounded-lg p-4 sm:p-8 flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
        <div className="flex-1 mb-6 md:mb-0 w-full">
          <div className="text-base sm:text-lg mb-2">Copy the link and invite guests to your event details page</div>
          <div className="text-xl sm:text-3xl font-bold mb-2 break-all">{eventLink}</div>
          <div className="text-gray-600 text-sm sm:text-base">Download the QR code and share the event’s main page with your guests:</div>
        </div>
        <div className="flex flex-col items-center w-full md:w-auto">
          <Image src={qrCodeUrl} alt="QR Code" width={140} height={140} />
          <button className="mt-2 text-black underline text-sm">Download</button>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-2 gap-4">
        <div className="w-full sm:w-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-black">PRINT READY GUESTS</h2>
          <div className="text-sm sm:text-base text-gray-700">These cards can be printed and included with your wedding invitations to guide your guests</div>
        </div>
        <button
          onClick={handleAddTemplate}
          className="border border-black px-6 py-2 rounded font-medium hover:bg-gray-100 transition-colors w-full sm:w-auto"
        >
          Add Templates
        </button>
      </div>
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-6">
        {templates.map((num, idx) => (
          <div key={num} className="flex flex-col items-center cursor-pointer" onClick={() => handleTemplateClick(idx)}>
            <div className="w-40 h-40 xs:w-48 xs:h-48 relative mb-2">
              <Image src={templateImg} alt={`Template ${num}`} fill className="object-cover rounded-lg border border-gray-200" />
            </div>
            <div className="text-center text-base font-medium mt-2">Template {num}</div>
          </div>
        ))}
      </div>
    </div>
  );
} 