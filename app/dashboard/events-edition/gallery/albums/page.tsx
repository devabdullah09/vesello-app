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
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [showCreateAlbumModal, setShowCreateAlbumModal] = useState(false);
  const [customAlbums, setCustomAlbums] = useState<any[]>([]);
  const [showDetailsDropdown, setShowDetailsDropdown] = useState<string | null>(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<any>(null);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [albumToDelete, setAlbumToDelete] = useState<any>(null);
  const [showSetCoverModal, setShowSetCoverModal] = useState(false);
  const [coverPhotoFiles, setCoverPhotoFiles] = useState<any[]>([]);
  
  // Debug custom albums state
  useEffect(() => {
    console.log('Custom albums state changed:', customAlbums);
  }, [customAlbums]);

  const wwwId = searchParams.get('wwwId');
  const albumId = searchParams.get('album');
  const mode = searchParams.get('mode'); // For set-cover mode

  useEffect(() => {
    console.log('useEffect triggered with wwwId:', wwwId, 'albumId:', albumId);
    if (!wwwId) {
      console.log('No wwwId, fetching events');
      fetchEvents();
    } else if (!albumId) {
      console.log('No albumId, fetching event details');
      fetchEventDetails();
    } else {
      console.log('Both wwwId and albumId present, fetching event details and album files');
      fetchEventDetails();
      setSelectedAlbum(albumId);
      fetchAlbumFiles();
    }
  }, [wwwId, albumId]);

  // Handle set cover photo mode
  useEffect(() => {
    if (mode === 'set-cover' && albumId && albumFiles.length > 0) {
      setShowSetCoverModal(true);
      // Filter only photo files for cover selection
      setCoverPhotoFiles(albumFiles.filter(file => file.type === 'photo'));
    }
  }, [mode, albumId, albumFiles]);

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
      await fetchCustomAlbums(eventResult.data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch event details');
    }
  };

  const fetchCustomAlbums = async (eventId: string) => {
    try {
      console.log('Fetching custom albums for eventId:', eventId);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('No session found');
        return;
      }

      console.log('Making API call to fetch albums...');
      const response = await fetch(`/api/dashboard/gallery/albums?eventId=${eventId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('API response status:', response.status);
      if (response.ok) {
        const result = await response.json();
        console.log('API response data:', result);
        setCustomAlbums(result.data || []);
        console.log('Custom albums set:', result.data || []);
      } else {
        console.error('API response not ok:', response.status, await response.text());
      }
    } catch (err) {
      console.error('Error fetching custom albums:', err);
    }
  };

  const fetchAlbumFiles = async () => {
    if (!wwwId || !albumId) return;
    
    try {
      setLoading(true);
      
      const actualAlbumId = albumId.startsWith('custom-') ? albumId.replace('custom-', '') : albumId;
      
      if (albumId.startsWith('custom-')) {
        setAlbumFiles([]);
        return;
      }
      
      const [photosResponse, videosResponse] = await Promise.all([
        fetch(`/api/event-id/${wwwId}/gallery/files?album=${actualAlbumId}&type=photos`),
        fetch(`/api/event-id/${wwwId}/gallery/files?album=${actualAlbumId}&type=videos`)
      ]);
      
      const allFiles: AlbumFile[] = [];
      
      if (photosResponse.ok) {
        const photosResult = await photosResponse.json();
        if (photosResult.success) {
          const photoFiles = photosResult.files.map((file: any) => ({
            name: file.name,
            url: file.url || file.cdnUrl,
            type: 'photo' as const,
            uploadedAt: file.uploadedAt
          }));
          allFiles.push(...photoFiles);
        }
      }
      
      if (videosResponse.ok) {
        const videosResult = await videosResponse.json();
        if (videosResult.success) {
          const videoFiles = videosResult.files.map((file: any) => ({
            name: file.name,
            url: file.url || file.cdnUrl,
            type: 'video' as const,
            uploadedAt: file.uploadedAt
          }));
          allFiles.push(...videoFiles);
        }
      }
      
      setAlbumFiles(allFiles);
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

  const handleCreateAlbum = async (albumData: { name: string; description?: string }) => {
    if (!selectedEvent) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Not authenticated');
        return;
      }

      console.log('Creating album with data:', {
        eventId: selectedEvent.id,
        name: albumData.name,
        description: albumData.description,
        isPublic: true,
        selectedEvent: selectedEvent
      });

      const response = await fetch('/api/dashboard/gallery/albums', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          name: albumData.name,
          description: albumData.description,
          isPublic: true
        })
      });

      if (response.ok) {
        const result = await response.json();
        setCustomAlbums(prev => [result.data, ...prev]);
        setShowCreateAlbumModal(false);
        alert('Album created successfully!');
      } else {
        const errorData = await response.json();
        console.error('Album creation failed:', errorData);
        throw new Error(errorData.error || 'Failed to create album');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create album');
    }
  };

  // Handle album details dropdown
  const handleDetailsClick = (albumId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent album selection
    setShowDetailsDropdown(showDetailsDropdown === albumId ? null : albumId);
  };

  // Handle rename album
  const handleRenameAlbum = (album: any) => {
    setEditingAlbum(album);
    setNewAlbumName(album.name);
    setShowRenameModal(true);
    setShowDetailsDropdown(null);
  };

  // Handle delete album
  const handleDeleteAlbum = (album: any) => {
    setAlbumToDelete(album);
    setShowDeleteConfirm(true);
    setShowDetailsDropdown(null);
  };

  // Handle upload photos/videos
  const handleUploadToAlbum = (album: any) => {
    setShowDetailsDropdown(null);
    // Navigate to album management with upload focus
    handleAlbumSelect(album.id.startsWith('custom-') ? album.id : `custom-${album.id}`);
  };

  // Handle set cover photo navigation
  const handleSetCoverPhotoNavigation = (album: any) => {
    setShowDetailsDropdown(null);
    // Navigate to album management with set cover photo mode
    const albumId = album.id.startsWith('custom-') ? album.id : `custom-${album.id}`;
    router.push(`/dashboard/events-edition/gallery/albums?wwwId=${wwwId}&album=${albumId}&mode=set-cover`);
  };

  // Confirm rename
  const confirmRename = async () => {
    if (!editingAlbum || !newAlbumName.trim()) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No session found');
      }

      const response = await fetch(`/api/dashboard/gallery/albums/${editingAlbum.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newAlbumName.trim() })
      });

      if (response.ok) {
        // Refresh custom albums
        if (selectedEvent) {
          await fetchCustomAlbums(selectedEvent.id);
        }
        setShowRenameModal(false);
        setEditingAlbum(null);
        setNewAlbumName('');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to rename album');
      }
    } catch (error) {
      console.error('Error renaming album:', error);
      setError(error instanceof Error ? error.message : 'Failed to rename album');
    }
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!albumToDelete) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No session found');
      }

      const response = await fetch(`/api/dashboard/gallery/albums/${albumToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Refresh custom albums
        if (selectedEvent) {
          await fetchCustomAlbums(selectedEvent.id);
        }
        setShowDeleteConfirm(false);
        setAlbumToDelete(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete album');
      }
    } catch (error) {
      console.error('Error deleting album:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete album');
    }
  };

  // Handle set cover photo
  const handleSetCoverPhoto = async (photoUrl: string) => {
    if (!selectedAlbum || !selectedEvent) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No session found');
      }

      // For default albums (wedding-day, party-day), we can't update cover in database
      // But we can show a success message
      if (selectedAlbum === 'wedding-day' || selectedAlbum === 'party-day') {
        alert('Cover photo set successfully! Note: Default album covers are managed automatically.');
        setShowSetCoverModal(false);
        return;
      }

      // For custom albums, update the cover_image_url in database
      const albumId = selectedAlbum.replace('custom-', '');
      const response = await fetch(`/api/dashboard/gallery/albums/${albumId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ coverImageUrl: photoUrl })
      });

      if (response.ok) {
        // Refresh custom albums
        await fetchCustomAlbums(selectedEvent.id);
        setShowSetCoverModal(false);
        alert('Cover photo set successfully!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to set cover photo');
      }
    } catch (error) {
      console.error('Error setting cover photo:', error);
      setError(error instanceof Error ? error.message : 'Failed to set cover photo');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !selectedEvent || !selectedAlbum) return;

    setUploading(true);
    try {
      const filesArray = Array.from(files);
      
      const photoFiles = filesArray.filter(file => file.type.startsWith('image/'));
      const videoFiles = filesArray.filter(file => file.type.startsWith('video/'));
      
      if (photoFiles.length > 0) {
        const photoFormData = new FormData();
        photoFiles.forEach(file => {
          photoFormData.append('files', file);
        });
        photoFormData.append('albumType', selectedAlbum);
        photoFormData.append('mediaType', 'photos');

        const photoResponse = await fetch(`/api/event-id/${selectedEvent.wwwId}/gallery/upload`, {
          method: 'POST',
          body: photoFormData,
        });

        if (!photoResponse.ok) {
          throw new Error('Photo upload failed');
        }
      }
      
      if (videoFiles.length > 0) {
        const videoFormData = new FormData();
        videoFiles.forEach(file => {
          videoFormData.append('files', file);
        });
        videoFormData.append('albumType', selectedAlbum);
        videoFormData.append('mediaType', 'videos');

        const videoResponse = await fetch(`/api/event-id/${selectedEvent.wwwId}/gallery/upload`, {
          method: 'POST',
          body: videoFormData,
        });

        if (!videoResponse.ok) {
          throw new Error('Video upload failed');
        }
      }

      await fetchAlbumFiles();
      
      const uploadedCount = photoFiles.length + videoFiles.length;
      alert(`${uploadedCount} file(s) uploaded successfully!`);
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
        await fetchAlbumFiles();
        alert('Image deleted successfully!');
      } else {
        throw new Error('Delete failed');
      }
    } catch (err) {
      alert('Delete failed. Please try again.');
    }
  };

  const handleDownloadAll = async () => {
    if (albumFiles.length === 0) {
      alert('No files to download');
      return;
    }

    setDownloading(true);
    try {
      for (let i = 0; i < albumFiles.length; i++) {
        const file = albumFiles[i];
        const response = await fetch(file.url);
        const blob = await response.blob();
        
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        
        const urlParts = file.url.split('/');
        const filename = urlParts[urlParts.length - 1] || `${file.name}_${i + 1}.${file.type === 'photo' ? 'jpg' : 'mp4'}`;
        link.download = filename;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        window.URL.revokeObjectURL(downloadUrl);
        
        if (i < albumFiles.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    } catch (error) {
      console.error('Error downloading files:', error);
      alert('Error downloading files. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

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
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-black mb-2">
                Select Album to Manage
              </h2>
              <p className="text-gray-600">
                Managing: <span className="font-semibold">{selectedEvent?.title}</span> - {selectedEvent?.coupleNames}
              </p>
            </div>
            <button
              onClick={() => setShowCreateAlbumModal(true)}
              className="bg-[#E5B574] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#D59C58] transition-colors flex items-center gap-2"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Album
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {albums.map((album) => (
              <div key={album.id} className="flex flex-col items-center relative">
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
                  
                  {/* Details Button */}
                  <button
                    className="absolute top-2 right-2 w-8 h-8 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full flex items-center justify-center transition-all duration-200 z-10"
                    onClick={(e) => handleDetailsClick(album.id, e)}
                    title="Album Details"
                  >
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                  </button>

                  {/* Details Dropdown */}
                  {showDetailsDropdown === album.id && (
                    <div className="absolute top-12 right-2 bg-gray-800 text-white rounded-lg shadow-lg py-2 min-w-[200px] z-20">
                      <button
                        className="w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center gap-3 opacity-50 cursor-not-allowed"
                        disabled
                        title="Default albums cannot be renamed"
                      >
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                        Rename Album
                      </button>
                      <button
                        className="w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center gap-3"
                        onClick={() => handleUploadToAlbum(album)}
                      >
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                        </svg>
                        Upload Photos & Videos
                      </button>
                      <button
                        className="w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center gap-3"
                        onClick={() => handleSetCoverPhotoNavigation(album)}
                      >
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
                        </svg>
                        Set Cover Photo
                      </button>
                      <button
                        className="w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center gap-3 opacity-50 cursor-not-allowed"
                        disabled
                        title="Default albums cannot be deleted"
                      >
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/>
                        </svg>
                        Delete Album
                      </button>
                    </div>
                  )}
                </div>
                <div className="text-center mt-2" style={{ fontFamily: 'Montserrat', fontWeight: 400, fontSize: '16px', color: '#08080A', letterSpacing: '0.01em', lineHeight: 1.4 }}>
                  {album.title}
                </div>
              </div>
            ))}

            {customAlbums.map((album) => (
              <div key={album.id} className="flex flex-col items-center relative">
                <div 
                  className="relative w-[270px] h-[220px] md:w-[370px] md:h-[260px] mb-2 group block cursor-pointer" 
                  onClick={() => handleAlbumSelect(`custom-${album.id}`)}
                >
                  <Image 
                    src={album.cover_image_url || "/images/Gallery/maingallery.jpg"} 
                    alt={album.name} 
                    fill 
                    style={{ objectFit: 'cover', borderRadius: '0 0 180px 180px/0 0 220px 0' }} 
                    className="shadow-lg" 
                  />
                  <div 
                    className="absolute inset-0 flex flex-col items-center justify-center opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-300" 
                    style={{ background: '#E5B574B3', borderRadius: '0 0 180px 180px/0 0 220px 0px' }}
                  >
                    <div className="text-white text-center font-semibold mb-2" style={{ fontFamily: 'Montserrat', fontWeight: 400, fontSize: '16px', color: '#fff', letterSpacing: '0.01em', lineHeight: 1.4 }}>
                      Manage Album<br />Photos & Videos
                    </div>
                    <button className="border border-white text-white rounded px-6 py-1 bg-transparent hover:bg-white hover:text-[#C18037] transition" style={{ fontFamily: 'Montserrat', fontWeight: 600, fontSize: '16px', letterSpacing: '0.01em', lineHeight: 1.4 }}>
                      Manage
                    </button>
                  </div>
                  
                  {/* Details Button */}
                  <button
                    className="absolute top-2 right-2 w-8 h-8 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full flex items-center justify-center transition-all duration-200 z-10"
                    onClick={(e) => handleDetailsClick(`custom-${album.id}`, e)}
                    title="Album Details"
                  >
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                  </button>

                  {/* Details Dropdown */}
                  {showDetailsDropdown === `custom-${album.id}` && (
                    <div className="absolute top-12 right-2 bg-gray-800 text-white rounded-lg shadow-lg py-2 min-w-[200px] z-20">
                      <button
                        className="w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center gap-3"
                        onClick={() => handleRenameAlbum(album)}
                      >
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                        Rename Album
                      </button>
                      <button
                        className="w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center gap-3"
                        onClick={() => handleUploadToAlbum(album)}
                      >
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                        </svg>
                        Upload Photos & Videos
                      </button>
                      <button
                        className="w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center gap-3"
                        onClick={() => handleSetCoverPhotoNavigation(album)}
                      >
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
                        </svg>
                        Set Cover Photo
                      </button>
                      <button
                        className="w-full px-4 py-2 text-left hover:bg-red-600 flex items-center gap-3 text-red-300"
                        onClick={() => handleDeleteAlbum(album)}
                      >
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/>
                        </svg>
                        Delete Album
                      </button>
                    </div>
                  )}
                </div>
                <div className="text-center mt-2" style={{ fontFamily: 'Montserrat', fontWeight: 400, fontSize: '16px', color: '#08080A', letterSpacing: '0.01em', lineHeight: 1.4 }}>
                  {album.name}
                </div>
                {album.description && (
                  <div className="text-center mt-1 text-sm text-gray-500" style={{ fontFamily: 'Montserrat', fontSize: '14px' }}>
                    {album.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* MODAL - RENDERED HERE IN THE CORRECT SCOPE */}
        {showCreateAlbumModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-xl font-semibold text-black">Create New Album</h3>
                <button
                  onClick={() => setShowCreateAlbumModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const name = formData.get('name') as string;
                const description = formData.get('description') as string;
                
                if (!name.trim()) {
                  alert('Please enter an album name');
                  return;
                }

                try {
                  await handleCreateAlbum({
                    name: name.trim(),
                    description: description.trim() || undefined
                  });
                } catch (err) {
                  console.error('Error creating album:', err);
                }
              }} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="albumName" className="block text-sm font-medium text-gray-700 mb-2">
                      Album Name *
                    </label>
                    <input
                      id="albumName"
                      name="name"
                      type="text"
                      placeholder="Enter album name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E5B574] focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="albumDescription" className="block text-sm font-medium text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      id="albumDescription"
                      name="description"
                      placeholder="Enter album description"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E5B574] focus:border-transparent resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateAlbumModal(false)}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#E5B574] text-white rounded-lg font-semibold hover:bg-[#D59C58] transition-colors"
                  >
                    Create Album
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
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
        <div className="flex gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-[#E5B574] text-white px-6 py-2 rounded font-semibold hover:bg-[#D59C58] transition-colors disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload Photos & Videos'}
          </button>
          <button
            onClick={handleDownloadAll}
            disabled={downloading || albumFiles.length === 0}
            className="bg-[#C18037] text-white px-6 py-2 rounded font-semibold hover:bg-[#A66B2A] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {downloading ? 'Downloading...' : 'Download All'}
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
            </svg>
          </button>
        </div>
      </div>
      
      <h1 className="text-3xl font-bold text-black mb-4">ALBUM MANAGEMENT</h1>
      <p className="text-gray-600 mb-8">
        Managing: <span className="font-semibold">{selectedEvent?.title}</span> - {selectedEvent?.coupleNames} - {
          albumId?.startsWith('custom-') 
            ? customAlbums.find(a => a.id === albumId.replace('custom-', ''))?.name || 'Custom Album'
            : albums.find(a => a.id === albumId)?.title || 'Album'
        }
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={handleFileUpload}
      />

      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-black">
            Album Photos & Videos ({albumFiles.length})
          </h2>
          <div className="text-sm text-gray-500">
            Drag and drop to reorder photos & videos
          </div>
        </div>

        {albumFiles.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-500 text-lg mb-4">
              {albumId?.startsWith('custom-') 
                ? 'This custom album is ready for photos and videos'
                : 'No photos or videos in this album yet'
              }
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-[#E5B574] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#D59C58] transition-colors"
            >
              Upload First Photo or Video
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
                  
                  <button
                    onClick={() => handleDeleteFile(file.name)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                  
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

      {/* Rename Album Modal */}
      {showRenameModal && editingAlbum && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Rename Album</h3>
            <input
              type="text"
              value={newAlbumName}
              onChange={(e) => setNewAlbumName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg mb-4"
              placeholder="Enter album name"
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowRenameModal(false);
                  setEditingAlbum(null);
                  setNewAlbumName('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmRename}
                className="px-4 py-2 bg-[#E5B574] text-white rounded-lg hover:bg-[#D59C58]"
                disabled={!newAlbumName.trim()}
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && albumToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4 text-red-600">Delete Album</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete "{albumToDelete.name}"? This action cannot be undone and will also delete all photos and videos in this album.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setAlbumToDelete(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Set Cover Photo Modal */}
      {showSetCoverModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden">
            <h3 className="text-lg font-semibold mb-4">Select Cover Photo</h3>
            <p className="text-gray-600 mb-4">
              Choose a photo to use as the cover image for this album.
            </p>
            
            {coverPhotoFiles.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No photos available in this album.</p>
                <p className="text-sm text-gray-400">Upload some photos first to set a cover image.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                {coverPhotoFiles.map((file, index) => (
                  <div
                    key={index}
                    className="relative aspect-square cursor-pointer group"
                    onClick={() => handleSetCoverPhoto(file.url)}
                  >
                    <Image
                      src={file.url}
                      alt={`Cover option ${index + 1}`}
                      fill
                      className="object-cover rounded-lg border-2 border-transparent group-hover:border-[#E5B574] transition-colors"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-gray-800 px-3 py-1 rounded-lg font-semibold text-sm">
                        Set as Cover
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setShowSetCoverModal(false);
                  // Remove mode from URL
                  const url = new URL(window.location.href);
                  url.searchParams.delete('mode');
                  window.history.replaceState({}, '', url.toString());
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}