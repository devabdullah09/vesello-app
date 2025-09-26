'use client';
import Image from 'next/image';
import React, { useRef, useState, useEffect } from 'react';
import UploadingOverlay from '@/components/gallery/UploadingOverlay';
import UploadSuccessOverlay from '@/components/gallery/UploadSuccessOverlay';
import { useRouter, useParams } from 'next/navigation';
// Removed direct bunny-net imports - now using API endpoints
import EventHeader from '@/components/layout/EventHeader';

const downloadIcon = (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline ml-1 text-[#C18037]">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
  </svg>
);

export default function EventPartyDayGallery() {
  const params = useParams();
  const router = useRouter();
  const wwwId = params.wwwId as string;
  const [tab, setTab] = useState<'photos' | 'videos'>('photos');
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<{ src: string; thumb: string }[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [eventData, setEventData] = useState<{galleryEnabled: boolean, rsvpEnabled: boolean} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Overlay state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadTotal, setUploadTotal] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Load existing images and event data on component mount
  useEffect(() => {
    loadGalleryFiles();
    if (wwwId) {
      fetchEventData();
    }
  }, [tab, wwwId]);

  const fetchEventData = async () => {
    try {
      const response = await fetch(`/api/event-id/${wwwId}`);
      if (response.ok) {
        const result = await response.json();
        setEventData({
          galleryEnabled: result.data.galleryEnabled,
          rsvpEnabled: result.data.rsvpEnabled
        });
      }
    } catch (error) {
      console.error('Error fetching event data:', error);
    }
  };

  const loadGalleryFiles = async () => {
    try {
      const response = await fetch(`/api/event-id/${wwwId}/gallery?albumType=party-day&mediaType=${tab}`);
      
      if (!response.ok) {
        throw new Error('Failed to load gallery files');
      }

      const result = await response.json();
      
      if (tab === 'photos') {
        const imageUrls = result.data.map((file: any) => file.url);
        setImages(imageUrls);
      } else {
        // Process videos - create video objects with src and thumb
        const videoUrls = result.data.map((file: any) => ({
          src: file.url,
          thumb: file.url // Use the same URL as thumbnail for now
        }));
        setVideos(videoUrls);
      }
    } catch (error) {
      console.error('Error loading gallery files:', error);
      setImages([]);
      setVideos([]);
    }
  };

  const handleDownloadAll = async () => {
    setDownloading(true);
    try {
      // Get all media URLs based on current tab
      const mediaUrls = tab === 'photos' ? images : videos.map(v => v.src);
      
      if (mediaUrls.length === 0) {
        alert('No media to download');
        return;
      }

      // Download each file
      for (let i = 0; i < mediaUrls.length; i++) {
        const url = mediaUrls[i];
        const response = await fetch(url);
        const blob = await response.blob();
        
        // Create download link
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        
        // Extract filename from URL or create one
        const urlParts = url.split('/');
        const filename = urlParts[urlParts.length - 1] || `media_${i + 1}.${tab === 'photos' ? 'jpg' : 'mp4'}`;
        link.download = filename;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        window.URL.revokeObjectURL(downloadUrl);
        
        // Small delay between downloads
        if (i < mediaUrls.length - 1) {
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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    setUploadTotal(files.length);
    setUploadProgress(0);
    setUploading(true);

    try {
      // Create FormData for upload
      const formData = new FormData();
      formData.append('albumType', 'party-day');
      formData.append('mediaType', tab);
      
      // Add all files to FormData
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });

      // Upload files via API endpoint
      const response = await fetch(`/api/event-id/${wwwId}/gallery/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Upload failed');
      }

      const result = await response.json();
      console.log('Upload successful:', result);
      
      // Reload gallery files after successful upload
      await loadGalleryFiles();
      
      setTimeout(() => {
        setUploading(false);
        setShowSuccess(true);
      }, 500);
    } catch (error) {
      console.error('Upload error:', error);
      setUploading(false);
      alert('Upload failed. Please try again.');
    }
  };

  return (
    <>
      <EventHeader 
        eventId={wwwId}
        galleryEnabled={eventData?.galleryEnabled || false}
        rsvpEnabled={eventData?.rsvpEnabled || false}
        currentPage="gallery"
      />
      {uploading && (
        <UploadingOverlay current={uploadProgress} total={uploadTotal} />
      )}
      {showSuccess && (
        <UploadSuccessOverlay
          onViewGallery={() => router.push(`/event-id/${wwwId}/gallery/main`)}
          onCountMeIn={() => {
            setShowSuccess(false);
            router.push(`/event-id/${wwwId}#team-section`);
          }}
        />
      )}
      <div className="min-h-screen flex flex-col items-center justify-center bg-white py-10 px-2 md:px-0 relative overflow-x-hidden pt-20" style={{ fontFamily: 'Montserrat, Arial, Helvetica, sans-serif' }}>
        <div className="relative w-full max-w-5xl bg-white rounded-2xl border border-[#C7B299] p-8 md:p-12 shadow-md mx-auto z-10" style={{ minHeight: 500 }}>
          {/* Decorative Corners and Sparkles */}
          <Image src="/images/Gallery/bottom-left-sparkle.png" alt="bottom left sparkle" width={202} height={32} className="absolute left-3 bottom-4 z-0" />
          <Image src="/images/Gallery/middle-right-sparkle.png" alt="middle right sparkle" width={280} height={42} className="absolute right-5 top-1/4 z-0" />
          <Image src="/images/Gallery/over-leaf-sparkle.png" alt="over leaf sparkle" width={252} height={32} className="absolute left-5 top-20 z-0" />

          {/* Main Content */}
          <div className="flex flex-col relative z-10">
            <div className="flex flex-row justify-between items-start mb-4">
              <div className="text-2xl md:text-3xl text-[#08080A]" style={{ fontFamily: 'Montserrat', fontWeight: 500 }}>
                Party Day
              </div>
              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={handleDownloadAll}
                  disabled={downloading || (tab === 'photos' ? images.length === 0 : videos.length === 0)}
                  className="flex items-center text-sm text-[#C18037] hover:text-[#E5B574] disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  style={{ fontFamily: 'Montserrat', fontWeight: 500 }}
                >
                  {downloading ? 'Downloading...' : 'DOWNLOAD ALL'}
                  {downloadIcon}
                </button>
                <div className="text-base md:text-lg font-semibold text-[#08080A] flex items-center" style={{ fontFamily: 'Montserrat', fontWeight: 500 }}>
                  UPLOAD PHOTOS/VIDEOS {downloadIcon}
                </div>
                <div className="text-xs text-[#888] mt-1" style={{ fontFamily: 'Montserrat', fontWeight: 400 }}>
                  Uploaded By {new Date().toLocaleDateString('en-GB')}
                </div>
              </div>
            </div>
            {/* Tabs */}
            <div className="flex flex-row border-b border-[#C7B299] mb-4">
              <button onClick={() => setTab('photos')} className={`font-semibold mr-6 pb-2 border-b-2 ${tab === 'photos' ? 'text-[#C18037] border-[#C18037]' : 'text-[#08080A] border-transparent'}`} style={{ fontFamily: 'Montserrat', fontWeight: 500 }}>
                Photos
              </button>
              <button onClick={() => setTab('videos')} className={`font-semibold pb-2 border-b-2 ${tab === 'videos' ? 'text-[#C18037] border-[#C18037]' : 'text-[#08080A] border-transparent'}`} style={{ fontFamily: 'Montserrat', fontWeight: 500 }}>
                Videos
              </button>
            </div>
            {/* Image/Video Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {/* Upload Card */}
              <div className={`relative w-[180px] h-[180px] rounded-lg overflow-hidden group border ${tab === 'photos' ? 'border-[#E5B574]' : 'border-[#C18037]'}`}>
                <Image src="/images/Gallery/maingallery.jpg" alt="Upload" fill style={{ objectFit: 'cover' }} />
                <div className={`absolute inset-0 ${tab === 'photos' ? 'bg-[#E5B574]/70' : 'bg-[#C18037]/70'} flex flex-col items-center justify-center opacity-100 group-hover:opacity-100 transition-opacity duration-300`}>
                  <button onClick={() => fileInputRef.current?.click()} className="border border-white text-white rounded px-6 py-1 bg-transparent hover:bg-white hover:text-[#C18037] transition font-semibold" style={{ fontFamily: 'Montserrat', fontWeight: 600, fontSize: '16px', letterSpacing: '0.01em', lineHeight: 1.4 }}>Upload</button>
                  <input ref={fileInputRef} type="file" accept={tab === 'photos' ? 'image/*' : 'video/*'} multiple className="hidden" onChange={handleUpload} />
                </div>
              </div>
              {/* Gallery Images or Videos */}
              {tab === 'photos' && images.map((img, i) => (
                <Image key={i} src={img} alt={`Gallery ${i}`} width={180} height={180} className="rounded-lg object-cover" />
              ))}
              {tab === 'videos' && videos.map((vid, i) => (
                <video key={i} width={180} height={180} controls poster={vid.thumb} className="rounded-lg object-cover">
                  <source src={vid.src} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}