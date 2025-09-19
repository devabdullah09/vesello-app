"use client";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

interface Event {
  id: string;
  wwwId: string;
  title: string;
  coupleNames: string;
  eventDate: string;
  venue?: string;
  status: string;
  galleryEnabled: boolean;
}

interface AlbumFile {
  name: string;
  url: string;
  type: 'photo' | 'video';
  size?: number;
  uploadedAt?: string;
}

const albums = [
  {
    id: "wedding-day",
    title: "Wedding Day",
    type: "photos" as const,
    overlayColor: "#E5B574",
  },
  {
    id: "party-day", 
    title: "Party Day",
    type: "photos" as const,
    overlayColor: "#C18037",
  },
];

export default function AlbumsManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [albumFiles, setAlbumFiles] = useState<AlbumFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const wwwId = searchParams.get('wwwId');
  const albumId = searchParams.get('album');

  useEffect(() => {
    if (!wwwId) {
      fetchEvents();
    } else if (!albumId) {
      fetchEventDetails();
    } else {
      fetchEventDetails();
      setSelectedAlbum(albumId);
      fetchAlbumFiles();
    }
  }, [wwwId, albumId]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch('/api/dashboard/events', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch events');
      }

      const result = await response.json();
      // Filter events to only show those with gallery enabled
      const allEvents = result.data.data || [];
      const galleryEnabledEvents = allEvents.filter((event: Event) => event.galleryEnabled);
      setEvents(galleryEnabledEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const fetchEventDetails = async () => {
    try {
      const eventResponse = await fetch(`/api/event-id/${wwwId}`);
      if (!eventResponse.ok) {
        throw new Error('Event not found');
      }
      
      const eventResult = await eventResponse.json();
      setSelectedEvent(eventResult.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch event details');
    }
  };

  const fetchAlbumFiles = async () => {
    if (!wwwId || !albumId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/event-id/${wwwId}/gallery/files?album=${albumId}&type=photos`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setAlbumFiles(result.files.map((file: any) => ({
            name: file.name,
            url: file.url || file.cdnUrl,
            type: 'photo' as const,
            uploadedAt: file.uploadedAt
          })));
        }
      }
    } catch (err) {
      console.error('Error fetching album files:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (albumId) {
      router.push(`/dashboard/events-edition/gallery/albums?wwwId=${wwwId}`);
    } else if (wwwId) {
      router.push("/dashboard/events-edition/gallery/albums");
    } else {
      router.push("/dashboard/events-edition/gallery");
    }
  };

  const handleEventSelect = (selectedWwwId: string) => {
    router.push(`/dashboard/events-edition/gallery/albums?wwwId=${selectedWwwId}`);
  };

  const handleAlbumSelect = (albumId: string) => {
    router.push(`/dashboard/events-edition/gallery/albums?wwwId=${wwwId}&album=${albumId}`);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !selectedEvent || !selectedAlbum) return;

    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });
      formData.append('album', selectedAlbum);
      formData.append('type', 'photos');

      const response = await fetch(`/api/event-id/${selectedEvent.wwwId}/gallery/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        await fetchAlbumFiles(); // Refresh the file list
        alert('Files uploaded successfully!');
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileName: string) => {
    if (!selectedEvent || !selectedAlbum) return;
    
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const response = await fetch(`/api/event-id/${selectedEvent.wwwId}/gallery/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName,
          album: selectedAlbum,
          type: 'photos'
        }),
      });

      if (response.ok) {
        await fetchAlbumFiles(); // Refresh the file list
        alert('Image deleted successfully!');
      } else {
        throw new Error('Delete failed');
      }
    } catch (err) {
      alert('Delete failed. Please try again.');
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newFiles = [...albumFiles];
    const draggedFile = newFiles[draggedIndex];
    newFiles.splice(draggedIndex, 1);
    newFiles.splice(dropIndex, 0, draggedFile);
    
    setAlbumFiles(newFiles);
    setDraggedIndex(null);
    
    // TODO: Save new order to backend
    console.log('New file order:', newFiles.map(f => f.name));
  };

  if (loading) {
    return (
      <div className="flex-1 p-12 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-12 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-lg">Error: {error}</div>
      </div>
    );
  }

  // Show event selection interface when no wwwId is provided
  if (!wwwId) {
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
        
        <h1 className="text-3xl font-bold text-black mb-8">ALBUMS MANAGEMENT</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-semibold text-black mb-6">Select an Event</h2>
          <p className="text-gray-600 mb-6">
            Choose an event to manage its gallery albums and photos.
          </p>
          
          {events.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No events with gallery enabled found.</p>
              <p className="text-gray-500 text-sm mb-6">
                To manage albums, you need to enable the gallery feature for your events first.
              </p>
              <button
                onClick={() => router.push('/dashboard/events-list')}
                className="bg-[#E5B574] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#D59C58] transition-colors"
              >
                Manage Events
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div
                  key={event.id}
                  onClick={() => handleEventSelect(event.wwwId)}
                  className="border border-gray-200 rounded-lg p-6 hover:border-[#E5B574] hover:shadow-md transition-all cursor-pointer"
                >
                  <h3 className="text-lg font-semibold text-black mb-2">{event.title}</h3>
                  <p className="text-[#E5B574] font-medium mb-3">{event.coupleNames}</p>
                  <p className="text-gray-600 text-sm mb-2">
                    {new Date(event.eventDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  {event.venue && (
                    <p className="text-gray-500 text-sm mb-3">{event.venue}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        event.status === 'active' ? 'bg-green-100 text-green-800' :
                        event.status === 'planned' ? 'bg-blue-100 text-blue-800' :
                        event.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </span>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-[#E5B574] text-white">
                        Gallery Enabled
                      </span>
                    </div>
                    <span className="text-[#E5B574] text-sm font-medium">Manage →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show album selection when event is selected but no album
  if (!albumId) {
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
        
        <h1 className="text-3xl font-bold text-black mb-8">ALBUMS MANAGEMENT</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-semibold text-black mb-6">
            Select Album to Manage
          </h2>
          <p className="text-gray-600 mb-6">
            Managing: <span className="font-semibold">{selectedEvent?.title}</span> - {selectedEvent?.coupleNames}
          </p>
          
          <div className="flex flex-col md:flex-row gap-8 justify-center items-center w-full">
            {albums.map((album) => (
              <div key={album.id} className="flex flex-col items-center">
                <div 
                  className="relative w-[270px] h-[220px] md:w-[370px] md:h-[260px] mb-2 group block cursor-pointer" 
                  onClick={() => handleAlbumSelect(album.id)}
                >
                  <Image 
                    src="/images/Gallery/maingallery.jpg" 
                    alt={album.title} 
                    fill 
                    style={{ objectFit: 'cover', borderRadius: '0 0 180px 180px/0 0 220px 0' }} 
                    className="shadow-lg" 
                  />
                  <div 
                    className="absolute inset-0 flex flex-col items-center justify-center opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-300" 
                    style={{ background: `${album.overlayColor}B3`, borderRadius: '0 0 180px 180px/0 0 220px 0px' }}
                  >
                    <div className="text-white text-center font-semibold mb-2" style={{ fontFamily: 'Montserrat', fontWeight: 400, fontSize: '16px', color: '#fff', letterSpacing: '0.01em', lineHeight: 1.4 }}>
                      Manage Album<br />Photos & Videos
                    </div>
                    <button className="border border-white text-white rounded px-6 py-1 bg-transparent hover:bg-white hover:text-[#C18037] transition" style={{ fontFamily: 'Montserrat', fontWeight: 600, fontSize: '16px', letterSpacing: '0.01em', lineHeight: 1.4 }}>
                      Manage
                    </button>
                  </div>
                </div>
                <div className="text-center mt-2" style={{ fontFamily: 'Montserrat', fontWeight: 400, fontSize: '16px', color: '#08080A', letterSpacing: '0.01em', lineHeight: 1.4 }}>
                  {album.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show album management interface
  return (
    <div className="flex-1 p-12 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-start mb-8">
        <button
          onClick={handleBack}
          className="bg-black text-white px-6 py-2 rounded font-semibold hover:bg-gray-800 transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="bg-[#E5B574] text-white px-6 py-2 rounded font-semibold hover:bg-[#D59C58] transition-colors disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload Photos'}
        </button>
      </div>
      
      <h1 className="text-3xl font-bold text-black mb-4">ALBUM MANAGEMENT</h1>
      <p className="text-gray-600 mb-8">
        Managing: <span className="font-semibold">{selectedEvent?.title}</span> - {selectedEvent?.coupleNames} - {albums.find(a => a.id === albumId)?.title}
      </p>

      {/* Upload Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Files Grid */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-black">
            Album Photos ({albumFiles.length})
          </h2>
          <div className="text-sm text-gray-500">
            Drag and drop to reorder photos
          </div>
        </div>

        {albumFiles.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-500 text-lg mb-4">No photos in this album yet</div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-[#E5B574] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#D59C58] transition-colors"
            >
              Upload First Photo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {albumFiles.map((file, index) => (
              <div
                key={file.name}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className={`relative group cursor-move ${draggedIndex === index ? 'opacity-50' : ''}`}
              >
                <div className="aspect-square relative overflow-hidden rounded-lg border-2 border-gray-200 hover:border-[#E5B574] transition-colors">
                  <Image
                    src={file.url}
                    alt={file.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="transition-transform group-hover:scale-105"
                  />
                  
                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteFile(file.name)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                  
                  {/* Drag handle */}
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white rounded px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    ⋮⋮
                  </div>
                </div>
                
                <div className="mt-2 text-xs text-gray-500 truncate">
                  {file.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}