"use client";
import { useRouter, useParams } from "next/navigation";
import React, { useState } from "react";
import Image from "next/image";

const mockPhotos = [
  {
    id: "1",
    url: "/images/Gallery/maingallery.jpg",
    hidden: false,
  },
  {
    id: "2",
    url: "/images/wedding-couple.jpg",
    hidden: false,
  },
  {
    id: "3",
    url: "/images/Gallery/weddingDay.png",
    hidden: false,
  },
  {
    id: "4",
    url: "/images/Gallery/afterPArty.png",
    hidden: false,
  },
];

export default function AdminAlbumDetailPage() {
  const router = useRouter();
  const params = useParams();
  const albumId = params?.albumId || "";
  const albumTitle = albumId === "wedding-day" ? "Wedding Day" : albumId === "party-day" ? "Party Day" : "Album";

  const [activeTab, setActiveTab] = useState<"photos" | "videos">("photos");
  const [photos, setPhotos] = useState(mockPhotos);

  const handleHidePhoto = (id: string) => {
    setPhotos((prev) => prev.map((p) => p.id === id ? { ...p, hidden: !p.hidden } : p));
  };
  const handleDeletePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="flex-1 p-12 bg-white min-h-screen">
      {/* Top bar */}
      <div className="flex justify-between items-start mb-8">
        <button
          onClick={() => router.push('/dashboard/events-edition/gallery/albums')}
          className="bg-black text-white px-6 py-2 rounded font-semibold hover:bg-gray-800 transition-colors"
        >
          Back
        </button>
        
      </div>
      <h1 className="text-3xl font-bold text-black mb-10 text-left">{albumTitle.toUpperCase()}</h1>
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`px-6 py-2 font-semibold text-lg border-b-2 transition-colors ${activeTab === "photos" ? "border-[#E5B574] text-black" : "border-transparent text-gray-400"}`}
          onClick={() => setActiveTab("photos")}
        >
          Photos
        </button>
        <button
          className={`px-6 py-2 font-semibold text-lg border-b-2 transition-colors ${activeTab === "videos" ? "border-[#E5B574] text-black" : "border-transparent text-gray-400"}`}
          onClick={() => setActiveTab("videos")}
        >
          Videos
        </button>
      </div>
      {/* Upload and date */}
      <div className="flex justify-between items-center mb-6">
        <div></div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-black text-base">UPLOAD PHOTOS/VIDEOS</span>
          <span className="text-xs text-gray-400 ml-2">Uploaded By 20.06.2025</span>
        </div>
      </div>
      {/* Photos grid */}
      {activeTab === "photos" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {/* Upload card */}
          <div className="relative group flex flex-col items-center justify-center bg-[#E5B574]/60 rounded-lg h-64 cursor-pointer border border-[#E5B574]">
            <span className="absolute top-2 right-2 text-gray-600 text-xl">{/* empty for spacing */}</span>
            <div className="flex flex-col items-center justify-center h-full w-full">
              <span className="text-white text-lg font-semibold mb-4 text-center">Upload</span>
              <button className="border border-white text-white px-6 py-2 rounded font-semibold hover:bg-white hover:text-[#C18037] transition-colors">Upload</button>
            </div>
          </div>
          {photos.map((photo) => (
            <div key={photo.id} className="relative group rounded-lg overflow-hidden h-64 border border-gray-200">
              <Image src={photo.url} alt="Photo" fill style={{ objectFit: 'cover' }} />
              {/* Overlay for hidden */}
              {photo.hidden && (
                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-10">
                  <span className="text-white text-lg font-bold">Hidden</span>
                </div>
              )}
              {/* Controls */}
              <div className="absolute top-2 left-2 flex flex-col gap-2 z-20">
                <button
                  className="bg-white bg-opacity-80 rounded-full p-2 hover:bg-gray-200 transition"
                  title={photo.hidden ? "Unhide Photo" : "Hide Photo"}
                  onClick={() => handleHidePhoto(photo.id)}
                >
                  {photo.hidden ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575m2.1-2.1A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.403 3.22-1.125 4.575m-2.1 2.1A9.956 9.956 0 0112 21c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-9.879 4.121A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.403 3.22-1.125 4.575m-2.1 2.1A9.956 9.956 0 0112 21c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575" /></svg>
                  )}
                </button>
                <button
                  className="bg-white bg-opacity-80 rounded-full p-2 hover:bg-red-100 transition"
                  title="Delete Photo"
                  onClick={() => handleDeletePhoto(photo.id)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              {/* View icon (optional, right corner) */}
              <span className="absolute top-2 right-2 text-gray-600 bg-white bg-opacity-80 rounded-full p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-9.879 4.121A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.403 3.22-1.125 4.575m-2.1 2.1A9.956 9.956 0 0112 21c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575" /></svg>
              </span>
            </div>
          ))}
        </div>
      )}
      {/* Videos tab placeholder */}
      {activeTab === "videos" && (
        <div className="text-gray-400 text-center py-20">No videos uploaded yet.</div>
      )}
    </div>
  );
} 