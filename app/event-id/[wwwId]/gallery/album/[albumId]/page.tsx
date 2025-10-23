'use client';
import Image from 'next/image';
import React, { useRef, useState, useEffect } from 'react';
import UploadingOverlay from '@/components/gallery/UploadingOverlay';
import UploadSuccessOverlay from '@/components/gallery/UploadSuccessOverlay';
import { useRouter, useParams } from 'next/navigation';
import EventHeader from '@/components/layout/EventHeader';
import EventFooter from '@/components/layout/EventFooter';
import { useLanguage } from '@/components/language-context';

const downloadIcon = (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline ml-1 text-[#C18037]">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
  </svg>
);

export default function DynamicAlbumGallery() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const wwwId = params.wwwId as string;
  const albumId = params.albumId as string;
  
  const [tab, setTab] = useState<'photos' | 'videos'>('photos');
  const [eventData, setEventData] = useState<{galleryEnabled: boolean, rsvpEnabled: boolean, coupleNames: string} | null>(null);
  const [albumData, setAlbumData] = useState<{name: string, description?: string} | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<{ src: string; thumb: string }[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Overlay state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadTotal, setUploadTotal] = useState(0);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

  // Load event data and album data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load event data
        const eventResponse = await fetch(`/api/event-id/${wwwId}`);
        if (eventResponse.ok) {
          const eventResult = await eventResponse.json();
          setEventData({
            galleryEnabled: eventResult.data.galleryEnabled,
            rsvpEnabled: eventResult.data.rsvpEnabled,
            coupleNames: eventResult.data.coupleNames
          });

          // Load album data if it's a custom album
          if (albumId.startsWith('custom-')) {
            const actualAlbumId = albumId.replace('custom-', '');
            try {
              const albumsResponse = await fetch(`/api/dashboard/gallery/albums?eventId=${eventResult.data.id}`);
              if (albumsResponse.ok) {
                const albumsResult = await albumsResponse.json();
                const album = albumsResult.data?.find((a: any) => a.id === actualAlbumId);
                if (album) {
                  setAlbumData({
                    name: album.name,
                    description: album.description
                  });
                }
              }
            } catch (error) {
              console.error('Error loading album data:', error);
            }
          } else {
            // Default albums
            setAlbumData({
              name: albumId === 'wedding-day' ? 'Wedding Day' : 'Party Day',
              description: albumId === 'wedding-day' ? 'Wedding ceremony photos' : 'Party and celebration photos'
            });
          }

          // Load gallery files
          await loadGalleryFiles();
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [wwwId, albumId]);

  const loadGalleryFiles = async () => {
    try {
      console.log('Loading gallery files for albumId:', albumId);
      // Check if this is a custom album (UUID format or custom- prefix)
      const isCustomAlbum = albumId.startsWith('custom-') || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(albumId);
      console.log('Is custom album:', isCustomAlbum);
      
      if (isCustomAlbum) {
        // For custom albums, fetch from database
        // Remove 'custom-' prefix if present
        const actualAlbumId = albumId.startsWith('custom-') ? albumId.replace('custom-', '') : albumId;
        console.log('Fetching custom album files for albumId:', actualAlbumId);
        const response = await fetch(`/api/event-id/${wwwId}/gallery/custom-album-files?albumId=${actualAlbumId}`);
        console.log('Custom album files response status:', response.status);
        if (response.ok) {
          const result = await response.json();
          console.log('Custom album files response:', result);
          if (result.success) {
            console.log('Custom album files loaded:', result.files);
            const photos = result.files.filter((file: any) => file.mime_type && file.mime_type.startsWith('image/'));
            const videos = result.files.filter((file: any) => file.mime_type && file.mime_type.startsWith('video/'));
            
            console.log('Photos found:', photos);
            console.log('Videos found:', videos);
            
            const imageUrls = photos.map((file: any) => file.image_url);
            const videoData = videos.map((file: any) => ({
              src: file.image_url,
              thumb: file.thumbnail_url || file.image_url
            }));
            
            console.log('Setting images:', imageUrls);
            console.log('Setting videos:', videoData);
            
            setImages(imageUrls);
            setVideos(videoData);
          }
        }
      } else {
        // For default albums, use existing logic
        // Load photos
        const photosResponse = await fetch(`/api/event-id/${wwwId}/gallery/files?album=${albumId}&type=photos`);
        if (photosResponse.ok) {
          const photosResult = await photosResponse.json();
          if (photosResult.success) {
            setImages(photosResult.files.map((file: any) => file.url || file.cdnUrl));
          }
        }

        // Load videos
        const videosResponse = await fetch(`/api/event-id/${wwwId}/gallery/files?album=${albumId}&type=videos`);
        if (videosResponse.ok) {
          const videosResult = await videosResponse.json();
          if (videosResult.success) {
            setVideos(videosResult.files.map((file: any) => ({
              src: file.url || file.cdnUrl,
              thumb: file.thumbnailUrl || file.url || file.cdnUrl
            })));
          }
        }
      }
    } catch (error) {
      console.error('Error loading gallery files:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);
    setUploadTotal(files.length);

    try {
      const filesArray = Array.from(files);
      
      // Separate photos and videos
      const photoFiles = filesArray.filter(file => file.type.startsWith('image/'));
      const videoFiles = filesArray.filter(file => file.type.startsWith('video/'));
      
      let uploadedCount = 0;

      // Upload photos if any
      if (photoFiles.length > 0) {
        const photoFormData = new FormData();
        photoFiles.forEach(file => {
          photoFormData.append('files', file);
        });
        photoFormData.append('albumType', albumId);
        photoFormData.append('mediaType', 'photos');

        const photoResponse = await fetch(`/api/event-id/${wwwId}/gallery/upload`, {
          method: 'POST',
          body: photoFormData,
        });

        if (photoResponse.ok) {
          uploadedCount += photoFiles.length;
        } else {
          const errorData = await photoResponse.json();
          throw new Error(errorData.error || 'Photo upload failed');
        }
      }
      
      // Upload videos if any
      if (videoFiles.length > 0) {
        const videoFormData = new FormData();
        videoFiles.forEach(file => {
          videoFormData.append('files', file);
        });
        videoFormData.append('albumType', albumId);
        videoFormData.append('mediaType', 'videos');

        const videoResponse = await fetch(`/api/event-id/${wwwId}/gallery/upload`, {
          method: 'POST',
          body: videoFormData,
        });

        if (videoResponse.ok) {
          uploadedCount += videoFiles.length;
        } else {
          const errorData = await videoResponse.json();
          throw new Error(errorData.error || 'Video upload failed');
        }
      }

      // Reload gallery files
      await loadGalleryFiles();
      
      setShowSuccessOverlay(true);
      setTimeout(() => setShowSuccessOverlay(false), 3000);
      
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setUploadTotal(0);
    }
  };

  // Download functionality removed for guests - only upload allowed

  if (!eventData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">{t.status.loading}</div>
      </div>
    );
  }

  if (!eventData.galleryEnabled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">{t.gallery.title} {t.status.notAvailable}</h1>
          <p className="text-gray-600">{t.gallery.notAvailable}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <EventHeader 
        eventId={wwwId} 
        galleryEnabled={eventData.galleryEnabled}
        rsvpEnabled={eventData.rsvpEnabled}
        currentPage="gallery"
      />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {albumData?.name || t.gallery.title}
          </h1>
          {albumData?.description && (
            <p className="text-gray-600">{albumData.description}</p>
          )}
          <p className="text-gray-500 mt-2">
            {eventData.coupleNames} {t.event.title}
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{t.gallery.uploadPhotos} & {t.gallery.videos}</h2>
              <p className="text-gray-600 text-sm">
                {t.gallery.shareMemories} {albumData?.name || t.event.title}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#E5B574] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#D59C58] transition-colors"
              >
                {t.gallery.selectPhotos}
              </button>
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
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setTab('photos')}
              className={`px-6 py-3 rounded-md font-semibold transition-colors ${
                tab === 'photos' 
                  ? 'bg-[#E5B574] text-white' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {t.gallery.photos} ({images.length})
            </button>
            <button
              onClick={() => setTab('videos')}
              className={`px-6 py-3 rounded-md font-semibold transition-colors ${
                tab === 'videos' 
                  ? 'bg-[#E5B574] text-white' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {t.gallery.videos} ({videos.length})
            </button>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {tab === 'photos' ? (
            images.map((imageUrl, index) => (
              <div key={index} className="group relative">
                <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-200">
                  <Image
                    src={imageUrl}
                    alt={`${t.gallery.photos} ${index + 1}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            ))
          ) : (
            videos.map((video, index) => (
              <div key={index} className="group relative">
                <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-200">
                  <Image
                    src={video.thumb}
                    alt={`${t.gallery.videos} ${index + 1}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <div className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                      <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24" className="text-gray-800 ml-1">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Empty State */}
        {(tab === 'photos' ? images.length === 0 : videos.length === 0) && (
          <div className="text-center py-16">
            <div className="text-gray-500 text-lg mb-4">
              {t.gallery.noPhotos} {tab === 'photos' ? t.gallery.photos.toLowerCase() : t.gallery.videos.toLowerCase()} {t.gallery.uploadedYet}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-[#E5B574] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#D59C58] transition-colors"
            >
              {t.gallery.uploadFirst} {tab === 'photos' ? t.gallery.photo : t.gallery.video}
            </button>
          </div>
        )}
      </div>

      {/* Overlays */}
      {uploading && (
        <UploadingOverlay 
          current={uploadProgress} 
          total={uploadTotal}
        />
      )}
      
      {showSuccessOverlay && (
        <UploadSuccessOverlay 
          onViewGallery={() => setShowSuccessOverlay(false)}
          onCountMeIn={() => setShowSuccessOverlay(false)}
        />
      )}
      
      {/* Event Footer - Sticky to bottom */}
      <div className="mt-auto">
        <EventFooter />
      </div>
    </div>
  );
}
