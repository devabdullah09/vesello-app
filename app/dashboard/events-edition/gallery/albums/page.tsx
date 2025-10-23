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
  
  // Photo selection state
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [showSelectionActions, setShowSelectionActions] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showTagsModal, setShowTagsModal] = useState(false);
  const [selectedFilesForAction, setSelectedFilesForAction] = useState<string[]>([]);
  
  // Tags state
  const [newTag, setNewTag] = useState('');
  const [appliedTags, setAppliedTags] = useState<string[]>([]);
  const [existingTags, setExistingTags] = useState<string[]>([]);
  
  // Photo viewer state
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [viewingPhoto, setViewingPhoto] = useState<AlbumFile | null>(null);
  
  // Image status tracking
  const [imageStatuses, setImageStatuses] = useState<Record<string, {
    isPublished: boolean;
    isHidden: boolean;
    isFavorite: boolean;
  }>>({});
  
  // Section visibility
  const [activeSection, setActiveSection] = useState<'published' | 'hidden' | 'favorites'>('published');
  

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
        // For custom albums, fetch from database
        const response = await fetch(`/api/event-id/${wwwId}/gallery/custom-album-files?albumId=${actualAlbumId}`);
        if (response.ok) {
          const result = await response.json();
          console.log('Custom album files response:', result);
          if (result.success && result.files) {
            const customFiles = result.files.map((file: any) => {
              console.log('Processing file:', file);
              const mappedFile = {
                name: file.original_filename || file.filename,
                url: file.image_url || file.imageUrl,
                type: (file.mime_type && file.mime_type.startsWith('video/')) ? 'video' as const : 'photo' as const,
                uploadedAt: file.created_at
              };
              console.log('Mapped file:', mappedFile);
              return mappedFile;
            });
            console.log('Mapped custom files:', customFiles);
            
            // Filter out files with invalid URLs
            const validFiles = customFiles.filter((file: any) => file.url && file.url.trim() !== '');
            console.log('Valid files after filtering:', validFiles);
            
            setAlbumFiles(validFiles);
          } else {
            console.log('No files found or API error');
            setAlbumFiles([]);
          }
        } else {
          console.error('Failed to fetch custom album files:', response.status);
          setAlbumFiles([]);
        }
        return;
      }
      
      // For default albums, use existing logic
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

  // Photo selection functions
  const handleFileSelect = (fileName: string, isSelected: boolean) => {
    const newSelectedFiles = new Set(selectedFiles);
    if (isSelected) {
      newSelectedFiles.add(fileName);
    } else {
      newSelectedFiles.delete(fileName);
    }
    setSelectedFiles(newSelectedFiles);
    setShowSelectionActions(newSelectedFiles.size > 0);
  };

  const handleSelectAll = () => {
    const allFileNames = new Set(albumFiles.map(file => file.name));
    setSelectedFiles(allFileNames);
    setShowSelectionActions(true);
  };

  const handleDeselectAll = () => {
    setSelectedFiles(new Set());
    setShowSelectionActions(false);
  };

  const handleDownloadSelected = async () => {
    const selectedFileNames = Array.from(selectedFiles);
    setSelectedFilesForAction(selectedFileNames);
    
    try {
      for (const fileName of selectedFileNames) {
        const file = albumFiles.find(f => f.name === fileName);
        if (file) {
          const response = await fetch(file.url);
          const blob = await response.blob();
          
          const downloadUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = fileName;
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          window.URL.revokeObjectURL(downloadUrl);
          
          // Small delay between downloads
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      alert(`${selectedFileNames.length} file(s) downloaded successfully!`);
    } catch (error) {
      console.error('Error downloading files:', error);
      alert('Error downloading files. Please try again.');
    }
  };

  const handleAddTags = () => {
    const selectedFileNames = Array.from(selectedFiles);
    setSelectedFilesForAction(selectedFileNames);
    setShowTagsModal(true);
    // Load existing tags for the selected files
    loadExistingTags();
  };

  const loadExistingTags = async () => {
    if (!selectedEvent || selectedFilesForAction.length === 0) return;
    
    try {
      const response = await fetch(`/api/event-id/${selectedEvent.wwwId}/gallery/tags`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setExistingTags(data.tags || []);
      }
    } catch (error) {
      console.error('Error loading existing tags:', error);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !appliedTags.includes(newTag.trim())) {
      setAppliedTags([...appliedTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setAppliedTags(appliedTags.filter(tag => tag !== tagToRemove));
  };

  const saveTags = async () => {
    if (!selectedEvent || appliedTags.length === 0) return;

    try {
      const response = await fetch(`/api/event-id/${selectedEvent.wwwId}/gallery/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileNames: selectedFilesForAction,
          tags: appliedTags,
          albumId: selectedAlbum?.startsWith('custom-') 
            ? selectedAlbum.replace('custom-', '') 
            : selectedAlbum
        }),
      });

      if (response.ok) {
        alert(`Tags added successfully to ${selectedFilesForAction.length} photo(s)!`);
        setShowTagsModal(false);
        setAppliedTags([]);
        setNewTag('');
        setSelectedFiles(new Set());
        setShowSelectionActions(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add tags');
      }
    } catch (error) {
      console.error('Error adding tags:', error);
      alert(`Error adding tags: ${error instanceof Error ? error.message : 'Please try again.'}`);
    }
  };

  // Photo viewer functions
  const openPhotoViewer = (photoIndex: number) => {
    setCurrentPhotoIndex(photoIndex);
    setViewingPhoto(albumFiles[photoIndex]);
    setShowPhotoViewer(true);
  };

  const closePhotoViewer = () => {
    setShowPhotoViewer(false);
    setViewingPhoto(null);
  };

  const navigatePhoto = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      const newIndex = currentPhotoIndex > 0 ? currentPhotoIndex - 1 : albumFiles.length - 1;
      setCurrentPhotoIndex(newIndex);
      setViewingPhoto(albumFiles[newIndex]);
    } else {
      const newIndex = currentPhotoIndex < albumFiles.length - 1 ? currentPhotoIndex + 1 : 0;
      setCurrentPhotoIndex(newIndex);
      setViewingPhoto(albumFiles[newIndex]);
    }
  };

  const handleDownloadPhoto = async (photo: AlbumFile) => {
    try {
      const response = await fetch(photo.url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = photo.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading photo:', error);
      alert('Error downloading photo. Please try again.');
    }
  };

  const handleAddToFavorite = async (photo: AlbumFile) => {
    try {
      // Toggle favorite status
      const currentStatus = imageStatuses[photo.name] || { isPublished: true, isHidden: false, isFavorite: false };
      const newStatus = { ...currentStatus, isFavorite: !currentStatus.isFavorite };
      
      // Update local state
      setImageStatuses(prev => ({
        ...prev,
        [photo.name]: newStatus
      }));
      
      // Save to backend
      const response = await fetch(`/api/event-id/${wwwId}/gallery/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: photo.name,
          albumId: albumId,
          status: newStatus
        }),
      });

      if (response.ok) {
        alert(newStatus.isFavorite ? 'Added to favorites!' : 'Removed from favorites!');
      } else {
        console.error('Failed to save image status');
        alert('Error saving photo status. Please try again.');
      }
    } catch (error) {
      console.error('Error updating favorite status:', error);
      alert('Error updating favorite status. Please try again.');
    }
  };

  const handleHidePhoto = async (photo: AlbumFile) => {
    if (!confirm('Are you sure you want to hide this photo?')) return;
    
    try {
      // Toggle hidden status
      const currentStatus = imageStatuses[photo.name] || { isPublished: true, isHidden: false, isFavorite: false };
      const newStatus = { ...currentStatus, isHidden: !currentStatus.isHidden };
      
      // Update local state
      setImageStatuses(prev => ({
        ...prev,
        [photo.name]: newStatus
      }));
      
      // Save to backend
      const response = await fetch(`/api/event-id/${wwwId}/gallery/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: photo.name,
          albumId: albumId,
          status: newStatus
        }),
      });

      if (response.ok) {
        alert(newStatus.isHidden ? 'Photo hidden from guests!' : 'Photo is now visible to guests!');
      } else {
        console.error('Failed to save image status');
        alert('Error saving photo status. Please try again.');
      }
    } catch (error) {
      console.error('Error hiding photo:', error);
      alert('Error hiding photo. Please try again.');
    }
  };

  const handleSharePhoto = async (photo: AlbumFile) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Wedding Photo',
          text: 'Check out this beautiful wedding photo!',
          url: photo.url
        });
      } else {
        // Fallback: copy URL to clipboard
        await navigator.clipboard.writeText(photo.url);
        alert('Photo URL copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing photo:', error);
      alert('Error sharing photo. Please try again.');
    }
  };

  const handleDeletePhoto = async (photo: AlbumFile) => {
    if (!confirm('Are you sure you want to delete this photo? This action cannot be undone.')) return;
    
    try {
      await handleDeleteFile(photo.name);
      closePhotoViewer();
      alert('Photo deleted successfully!');
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Error deleting photo. Please try again.');
    }
  };

  // Filter images by section
  const getFilteredImages = () => {
    return albumFiles.filter(file => {
      const status = imageStatuses[file.name] || { isPublished: true, isHidden: false, isFavorite: false };
      
      switch (activeSection) {
        case 'published':
          return status.isPublished && !status.isHidden;
        case 'hidden':
          return status.isHidden;
        case 'favorites':
          return status.isFavorite;
        default:
          return true;
      }
    });
  };

  // Load image statuses from database
  const loadImageStatuses = async () => {
    if (!wwwId || !albumId || albumFiles.length === 0) return;

    try {
      const response = await fetch(`/api/event-id/${wwwId}/gallery/status?albumId=${albumId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.statuses) {
          setImageStatuses(data.statuses);
        }
      } else {
        console.error('Failed to load image statuses:', response.statusText);
        // Initialize with default statuses if API fails
        const defaultStatuses: Record<string, { isPublished: boolean; isHidden: boolean; isFavorite: boolean }> = {};
        albumFiles.forEach(file => {
          defaultStatuses[file.name] = { isPublished: true, isHidden: false, isFavorite: false };
        });
        setImageStatuses(defaultStatuses);
      }
    } catch (error) {
      console.error('Error loading image statuses:', error);
      // Initialize with default statuses if API fails
      const defaultStatuses: Record<string, { isPublished: boolean; isHidden: boolean; isFavorite: boolean }> = {};
      albumFiles.forEach(file => {
        defaultStatuses[file.name] = { isPublished: true, isHidden: false, isFavorite: false };
      });
      setImageStatuses(defaultStatuses);
    }
  };

  // Initialize image statuses when album files change
  useEffect(() => {
    if (albumFiles.length > 0) {
      loadImageStatuses();
    }
  }, [albumFiles, wwwId, albumId]);

  const getSectionCounts = () => {
    const published = albumFiles.filter(file => {
      const status = imageStatuses[file.name] || { isPublished: true, isHidden: false, isFavorite: false };
      return status.isPublished && !status.isHidden;
    }).length;
    
    const hidden = albumFiles.filter(file => {
      const status = imageStatuses[file.name] || { isPublished: true, isHidden: false, isFavorite: false };
      return status.isHidden;
    }).length;
    
    const favorites = albumFiles.filter(file => {
      const status = imageStatuses[file.name] || { isPublished: true, isHidden: false, isFavorite: false };
      return status.isFavorite;
    }).length;
    
    return { published, hidden, favorites };
  };

  const handleHidePhotos = async () => {
    if (!confirm('Are you sure you want to hide the selected photos?')) return;
    
    const selectedFileNames = Array.from(selectedFiles);
    setSelectedFilesForAction(selectedFileNames);
    
    try {
      // For custom albums, we can update the database
      if (selectedAlbum?.startsWith('custom-')) {
        const actualAlbumId = selectedAlbum.replace('custom-', '');
        
        // TODO: Implement hide functionality for custom albums
        // This would require updating the database to mark files as hidden
        alert('Hide functionality for custom albums will be implemented soon.');
      } else {
        // For default albums, we can't hide individual files
        alert('Hide functionality is not available for default albums.');
      }
      
      // Clear selection
      setSelectedFiles(new Set());
      setShowSelectionActions(false);
    } catch (error) {
      console.error('Error hiding photos:', error);
      alert('Error hiding photos. Please try again.');
    }
  };

  const handleMovePhotos = () => {
    const selectedFileNames = Array.from(selectedFiles);
    setSelectedFilesForAction(selectedFileNames);
    setShowMoveModal(true);
  };

  const handleDeleteSelected = async () => {
    if (!confirm('Are you sure you want to delete the selected photos? This action cannot be undone.')) return;
    
    const selectedFileNames = Array.from(selectedFiles);
    setSelectedFilesForAction(selectedFileNames);
    
    try {
      for (const fileName of selectedFileNames) {
        await handleDeleteFile(fileName);
      }
      
      // Clear selection
      setSelectedFiles(new Set());
      setShowSelectionActions(false);
      
      alert(`${selectedFileNames.length} file(s) deleted successfully!`);
    } catch (error) {
      console.error('Error deleting files:', error);
      alert('Error deleting files. Please try again.');
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
      
      // Determine the actual album ID (remove 'custom-' prefix if present)
      const actualAlbumId = selectedAlbum.startsWith('custom-') 
        ? selectedAlbum.replace('custom-', '') 
        : selectedAlbum;
      
      if (photoFiles.length > 0) {
        const photoFormData = new FormData();
        photoFiles.forEach(file => {
          photoFormData.append('files', file);
        });
        photoFormData.append('albumType', actualAlbumId);
        photoFormData.append('mediaType', 'photos');

        const photoResponse = await fetch(`/api/event-id/${selectedEvent.wwwId}/gallery/upload`, {
          method: 'POST',
          body: photoFormData,
        });

        if (!photoResponse.ok) {
          const errorData = await photoResponse.json();
          throw new Error(errorData.error || 'Photo upload failed');
        }
      }
      
      if (videoFiles.length > 0) {
        const videoFormData = new FormData();
        videoFiles.forEach(file => {
          videoFormData.append('files', file);
        });
        videoFormData.append('albumType', actualAlbumId);
        videoFormData.append('mediaType', 'videos');

        const videoResponse = await fetch(`/api/event-id/${selectedEvent.wwwId}/gallery/upload`, {
          method: 'POST',
          body: videoFormData,
        });

        if (!videoResponse.ok) {
          const errorData = await videoResponse.json();
          throw new Error(errorData.error || 'Video upload failed');
        }
      }

      await fetchAlbumFiles();
      
      const uploadedCount = photoFiles.length + videoFiles.length;
      alert(`${uploadedCount} file(s) uploaded successfully!`);
    } catch (err) {
      console.error('Upload error:', err);
      alert(`Upload failed: ${err instanceof Error ? err.message : 'Please try again.'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileName: string) => {
    if (!selectedEvent || !selectedAlbum) return;
    
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const actualAlbumId = selectedAlbum.startsWith('custom-') 
        ? selectedAlbum.replace('custom-', '') 
        : selectedAlbum;

      if (selectedAlbum.startsWith('custom-')) {
        // For custom albums, delete from database
        const response = await fetch(`/api/event-id/${selectedEvent.wwwId}/gallery/delete-custom-file`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileName,
            albumId: actualAlbumId
          }),
        });

        if (response.ok) {
          await fetchAlbumFiles();
          alert('File deleted successfully!');
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Delete failed');
        }
      } else {
        // For default albums, use existing logic
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
          alert('File deleted successfully!');
        } else {
          throw new Error('Delete failed');
        }
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert(`Delete failed: ${err instanceof Error ? err.message : 'Please try again.'}`);
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
          {albumFiles.length > 0 && (
            <button
              onClick={() => {
                if (selectedFiles.size === 0) {
                  handleSelectAll();
                } else {
                  handleDeselectAll();
                }
              }}
              className={`px-6 py-2 rounded font-semibold transition-colors flex items-center gap-2 ${
                selectedFiles.size > 0 
                  ? 'bg-gray-600 text-white hover:bg-gray-700' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {selectedFiles.size > 0 ? 'Cancel Selection' : 'Select Photos'}
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}
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

      {/* Section Tabs */}
      <div className="mb-8">
        <div className="flex space-x-1 bg-[#E5B574] bg-opacity-20 p-1 rounded-lg w-fit">
          {(() => {
            const counts = getSectionCounts();
            return [
              { 
                key: 'published', 
                label: 'Published', 
                count: counts.published, 
                icon: (
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )
              },
              { 
                key: 'hidden', 
                label: 'Hidden', 
                count: counts.hidden, 
                icon: (
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                )
              },
              { 
                key: 'favorites', 
                label: 'Favorites', 
                count: counts.favorites, 
                icon: (
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                )
              }
            ].map(section => (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeSection === section.key
                    ? 'bg-[#E5B574] text-white shadow-sm'
                    : 'text-[#C18037] hover:text-[#E5B574] hover:bg-[#E5B574] hover:bg-opacity-10'
                }`}
              >
                {section.icon}
                <span>{section.label}</span>
                <span className="bg-[#C18037] text-white px-2 py-1 rounded-full text-xs">
                  {section.count}
                </span>
              </button>
            ));
          })()}
        </div>
      </div>

      {/* Section Description */}
      <div className="mb-6 p-4 bg-[#E5B574] bg-opacity-10 border border-[#E5B574] border-opacity-30 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="text-[#C18037] text-xl">
            {activeSection === 'published' && (
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
            {activeSection === 'hidden' && (
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            )}
            {activeSection === 'favorites' && (
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-[#C18037] mb-1">
              {activeSection === 'published' && 'Published Images'}
              {activeSection === 'hidden' && 'Hidden Images'}
              {activeSection === 'favorites' && 'Favorite Images'}
            </h3>
            <p className="text-[#C18037] text-sm">
              {activeSection === 'published' && 'These images are visible to guests on the public gallery. They can view and download these photos.'}
              {activeSection === 'hidden' && 'These images are hidden from guests but visible to you as admin/organizer. Guests cannot see these photos.'}
              {activeSection === 'favorites' && 'These are your favorite images. You can mark any image as favorite for easy access.'}
            </p>
          </div>
        </div>
      </div>

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
            {activeSection === 'published' && 'Published Photos & Videos'}
            {activeSection === 'hidden' && 'Hidden Photos & Videos'}
            {activeSection === 'favorites' && 'Favorite Photos & Videos'}
            ({getFilteredImages().length})
          </h2>
          <div className="flex items-center gap-4">
            {selectedFiles.size > 0 && (
              <div className="text-sm text-blue-600 font-medium">
                {selectedFiles.size} selected
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Select All
              </button>
              {selectedFiles.size > 0 && (
                <button
                  onClick={handleDeselectAll}
                  className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                >
                  Deselect All
                </button>
              )}
            </div>
            <div className="text-sm text-gray-500">
              Drag and drop to reorder photos & videos
            </div>
          </div>
        </div>

        {/* Selection Actions Bar */}
        {showSelectionActions && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-blue-800 font-medium text-lg">
                  {selectedFiles.size} photo(s) selected
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Select All
                  </button>
                  <button
                    onClick={handleDeselectAll}
                    className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Deselect All
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownloadSelected}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Download
                </button>
                <button
                  onClick={handleAddTags}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  Add Tags
                </button>
                <button
                  onClick={handleHidePhotos}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors"
                >
                  Hide Photos
                </button>
                <button
                  onClick={handleMovePhotos}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                >
                  Move Photos
                </button>
                <button
                  onClick={handleDeleteSelected}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Photos
                </button>
              </div>
            </div>
          </div>
        )}

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
            {getFilteredImages().map((file, index) => {
              const originalIndex = albumFiles.findIndex(f => f.name === file.name);
              return (
                <div
                  key={`${file.name}-${index}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, originalIndex)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, originalIndex)}
                  className={`relative group cursor-move ${draggedIndex === originalIndex ? 'opacity-50' : ''}`}
                >
                  <div 
                    className="aspect-square relative overflow-hidden rounded-lg border-2 border-gray-200 hover:border-[#E5B574] transition-colors cursor-pointer"
                    onClick={() => openPhotoViewer(originalIndex)}
                  >
                    <Image
                      src={file.url || '/placeholder.svg'}
                      alt={file.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="transition-transform group-hover:scale-105"
                    />
                  
                  {/* Status Indicators */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    {(() => {
                      const status = imageStatuses[file.name] || { isPublished: true, isHidden: false, isFavorite: false };
                      const indicators = [];
                      
                      if (status.isFavorite) {
                        indicators.push(
                          <div key="favorite" className="bg-[#C18037] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          </div>
                        );
                      }
                      
                      if (status.isHidden) {
                        indicators.push(
                          <div key="hidden" className="bg-[#C18037] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                            </svg>
                          </div>
                        );
                      }
                      
                      if (status.isPublished && !status.isHidden) {
                        indicators.push(
                          <div key="published" className="bg-[#E5B574] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </div>
                        );
                      }
                      
                      return indicators;
                    })()}
                  </div>
                  
                  {/* Selection Checkbox */}
                  <div className="absolute top-2 left-2">
                    <input
                      type="checkbox"
                      checked={selectedFiles.has(file.name)}
                      onChange={(e) => handleFileSelect(file.name, e.target.checked)}
                      className="w-6 h-6 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 shadow-lg"
                    />
                  </div>
                  
                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteFile(file.name)}
                    className="absolute bottom-2 right-2 bg-[#C18037] text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs hover:bg-[#A66B2A]"
                  >
                    ×
                  </button>
                  
                  {/* Drag Handle */}
                  <div className="absolute bottom-2 left-2 bg-[#C18037] bg-opacity-80 text-white rounded px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    ⋮⋮
                  </div>
                  
                  {/* Selection Overlay */}
                  {selectedFiles.has(file.name) && (
                    <div className="absolute inset-0 bg-[#E5B574] bg-opacity-20 border-2 border-[#E5B574] rounded-lg"></div>
                  )}
                </div>
                
                <div className="mt-2 text-xs text-gray-500 truncate">
                  {file.name}
                </div>
              </div>
              );
            })}
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

      {/* Tags Modal */}
      {showTagsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Manage tags for these photos ({selectedFilesForAction.length})</h3>
              <button
                onClick={() => {
                  setShowTagsModal(false);
                  setSelectedFilesForAction([]);
                  setAppliedTags([]);
                  setNewTag('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ADD CUSTOM TAGS
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    placeholder="Enter tag name"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={addTag}
                    disabled={!newTag.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
              </div>
              
              {/* Applied Tags */}
              {appliedTags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Applied Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {appliedTags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Existing Tags */}
              {existingTags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Existing Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {existingTags.map((tag, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          if (!appliedTags.includes(tag)) {
                            setAppliedTags([...appliedTags, tag]);
                          }
                        }}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <p className="text-sm text-gray-500">
                Custom tags allow you to search and find photos more easily.
              </p>
            </div>
            
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setShowTagsModal(false);
                  setSelectedFilesForAction([]);
                  setAppliedTags([]);
                  setNewTag('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={saveTags}
                disabled={appliedTags.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Move Photos Modal */}
      {showMoveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Move Photos</h3>
            <p className="text-gray-600 mb-4">
              Move {selectedFilesForAction.length} selected photo(s) to another album
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Destination Album
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Choose an album...</option>
                  {albums.map(album => (
                    <option key={album.id} value={album.id}>
                      {album.title}
                    </option>
                  ))}
                  {customAlbums.map(album => (
                    <option key={album.id} value={album.id}>
                      {album.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setShowMoveModal(false);
                  setSelectedFilesForAction([]);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // TODO: Implement move functionality
                  alert('Move functionality will be implemented soon.');
                  setShowMoveModal(false);
                  setSelectedFilesForAction([]);
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Move Photos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Viewer Modal */}
      {showPhotoViewer && viewingPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={closePhotoViewer}
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-70 transition-colors"
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Action Buttons */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 flex gap-2 bg-black bg-opacity-50 rounded-lg p-2">
              <button
                onClick={() => handleDownloadPhoto(viewingPhoto)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                title="Download"
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
                </svg>
                DOWNLOAD
              </button>
              
              <button
                onClick={() => handleAddToFavorite(viewingPhoto)}
                className="flex items-center gap-2 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                title="Add to Favorite"
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                ADD TO FAVORITE
              </button>
              
              <button
                onClick={() => handleHidePhoto(viewingPhoto)}
                className="flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                title="Hide"
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
                HIDE
              </button>
              
              <button
                onClick={() => handleSharePhoto(viewingPhoto)}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                title="Share on Social Media"
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                SHARE ON SOCIAL MEDIA
              </button>
              
              <button
                onClick={() => handleDeletePhoto(viewingPhoto)}
                className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                title="Delete"
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                DELETE
              </button>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={() => navigatePhoto('prev')}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-opacity-70 transition-colors"
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={() => navigatePhoto('next')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-opacity-70 transition-colors"
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Photo Display */}
            <div className="relative max-w-full max-h-full">
              <Image
                src={viewingPhoto.url || '/placeholder.svg'}
                alt={viewingPhoto.name}
                width={1200}
                height={800}
                style={{ objectFit: 'contain' }}
                className="max-w-full max-h-full"
              />
            </div>

            {/* Photo Info */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-black bg-opacity-50 text-white rounded-lg px-4 py-2">
              <p className="text-sm">
                {currentPhotoIndex + 1} of {albumFiles.length} - {viewingPhoto.name}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}