"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
// If you want to use a QR code generator, you can use 'qrcode.react' or similar. For now, let's use a static image placeholder.

export default function QRCodeLinkPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push("/dashboard/events-edition/gallery");
  };

  return (
    <div className="flex-1 p-0 bg-white min-h-screen flex flex-col">
      {/* Main content area */}
      <div className="flex flex-col items-center justify-start w-full pt-12">
        <div className="w-full max-w-5xl">
          <button
            onClick={handleBack}
            className="bg-black text-white px-8 py-2 rounded font-semibold hover:bg-gray-800 transition-colors mb-8 ml-2"
            style={{ width: 120 }}
          >
            Back
          </button>
        </div>
        <h1 className="text-3xl font-bold text-black mb-8 w-full max-w-5xl text-left ml-2">QR CODE/LINK</h1>
        <div className="w-full max-w-5xl bg-[#F7F7F7] rounded-lg shadow-md flex flex-row justify-between items-center px-12 py-10">
          {/* Left content - Event Link Section */}
          <div className="flex-1">
            <p className="text-lg text-black mb-4">
              Copy the link and invite guests to your event details page
            </p>
            <div className="text-2xl font-bold text-black mb-2 select-all">
              www.vasello.com/15fg75t/gallery
            </div>
            <p className="text-sm text-gray-700 mb-0">
              Download the QR code and share the event's main page with your guests:
            </p>
          </div>
          {/* Right content - QR Code Section */}
          <div className="flex flex-col items-center ml-12">
            <div className="bg-white w-36 h-36 mb-2 flex items-center justify-center rounded shadow border border-gray-200">
              {/* Replace with a real QR code if available */}
              <Image src="/images/placeholder-logo.png" alt="QR Code" width={128} height={128} />
            </div>
            <button className="text-[#E5B574] font-semibold hover:underline mt-2 text-base">
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 