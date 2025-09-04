"use client";
import Image from 'next/image';
import { useRouter } from "next/navigation";
import React, { useState, useRef, useEffect } from 'react';

const albums = [
  {
    id: "wedding-day",
    title: "Wedding Day",
    image: "/images/Gallery/maingallery.jpg",
    overlayColor: "#E5B574",
  },
  {
    id: "party-day",
    title: "Party Day",
    image: "/images/Gallery/maingallery.jpg",
    overlayColor: "#C18037",
  },
];

export default function AdminAlbumsPage() {
  const router = useRouter();
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [contextAlbumId, setContextAlbumId] = useState<string | null>(null);

  // For copied link popup (optional, can be removed if not needed)
  const [showCopiedPopup, setShowCopiedPopup] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleCopyLink = () => {
    const partyLink = window.location.origin + '/gallery/party-day';
    navigator.clipboard.writeText(partyLink);
    setShowCopiedPopup(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setShowCopiedPopup(false);
    }, 5000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleAlbumClick = (albumId: string) => {
    // Route to album detail page (admin version)
    router.push(`/dashboard/events-edition/gallery/albums/${albumId}`);
  };

  const handleContextMenu = (e: React.MouseEvent, albumId: string) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextAlbumId(albumId);
    setShowContextMenu(true);
  };

  return (
    <div className="flex-1 p-12 bg-white min-h-screen relative">
      {/* Top bar with Back and Logout */}
      <div className="flex justify-between items-start mb-8">
        <button
          onClick={() => router.push("/dashboard/events-edition/gallery")}
          className="bg-black text-white px-6 py-2 rounded font-semibold hover:bg-gray-800 transition-colors"
        >
          Back
        </button>
        
      </div>

      <h1 className="text-3xl font-bold text-black mb-10 text-center">ALBUM MANAGEMENT</h1>

      {/* Albums grid */}
      <div className="flex flex-col md:flex-row gap-8 justify-center items-center w-full mb-8">
        {albums.map((album) => (
          <div key={album.id} className="flex flex-col items-center">
            <div className="relative w-[270px] h-[220px] md:w-[370px] md:h-[260px] mb-2 group block cursor-pointer" onClick={() => handleAlbumClick(album.id)}>
              <Image src={album.image} alt={album.title} fill style={{ objectFit: 'cover', borderRadius: '0 0 180px 180px/0 0 220px 0' }} className="shadow-lg" />
              <div className={`absolute inset-0 flex flex-col items-center justify-center opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-300`} style={{ background: `${album.overlayColor}B3`, borderRadius: '0 0 180px 180px/0 0 220px 0px' }}>
                <div className="text-white text-center font-semibold mb-2" style={{ fontFamily: 'Montserrat', fontWeight: 400, fontSize: '16px', color: '#fff', letterSpacing: '0.01em', lineHeight: 1.4 }}>Got Photos?<br />Add Them Now!</div>
                <button className="border border-white text-white rounded px-6 py-1 bg-transparent hover:bg-white hover:text-[#C18037] transition" style={{ fontFamily: 'Montserrat', fontWeight: 600, fontSize: '16px', letterSpacing: '0.01em', lineHeight: 1.4 }}
                  onClick={e => { e.stopPropagation(); /* handle upload here */ }}
                >Upload</button>
              </div>
              {/* 3-dot menu for admin */}
              <button
                onClick={e => { e.stopPropagation(); handleContextMenu(e, album.id); }}
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 z-20 bg-white bg-opacity-80 rounded-full px-2 py-1"
                aria-label="Album options"
              >
                ⋮
              </button>
            </div>
            <div className="text-center mt-2" style={{ fontFamily: 'Montserrat', fontWeight: 400, fontSize: '16px', color: '#08080A', letterSpacing: '0.01em', lineHeight: 1.4 }}>{album.title}</div>
          </div>
        ))}
      </div>

      {/* Context Menu */}
      {showContextMenu && (
        <div
          className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-lg py-2 min-w-[180px]"
          style={{ left: contextMenuPosition.x, top: contextMenuPosition.y }}
        >
          <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Rename Album</div>
          <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Upload Photos Or Videos</div>
          <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Set Cover Photo</div>
          <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-600">Delete Album</div>
        </div>
      )}
      {/* Click outside to close context menu */}
      {showContextMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowContextMenu(false)} />
      )}

      {/* Link Copied Popup (optional) */}
      {showCopiedPopup && (
        <div
          style={{
            position: 'fixed',
            right: 24,
            bottom: 32,
            zIndex: 50,
            background: '#fff',
            border: '1px solid #E5B574',
            borderRadius: 12,
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            padding: '14px 18px',
            minWidth: 220,
            textAlign: 'center',
          }}
        >
          <div style={{ color: '#C18037', fontWeight: 600, fontSize: 16, fontFamily: 'Montserrat', marginBottom: 8 }}>
            Link Copied!
          </div>
          <div style={{ color: '#08080A', fontWeight: 400, fontSize: 13, fontFamily: 'Montserrat', marginBottom: 2 }}>
            This Link Is As Exclusive As Your Invite.<br />
            Please Share Only With Fellow Guests!
          </div>
        </div>
      )}
    </div>
  );
} 