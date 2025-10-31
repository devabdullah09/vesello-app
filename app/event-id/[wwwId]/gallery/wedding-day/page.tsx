'use client';
import Image from 'next/image';
import React, { useRef, useState, useEffect } from 'react';
import UploadingOverlay from '@/components/gallery/UploadingOverlay';
import UploadSuccessOverlay from '@/components/gallery/UploadSuccessOverlay';
import { useRouter, useParams } from 'next/navigation';
import EventHeader from '@/components/layout/EventHeader';
import EventFooter from '@/components/layout/EventFooter';
import { useLanguage } from '@/components/language-context';
import { uploadFiles, fetchGalleryFiles, getInitialImages, getInitialVideos, GalleryFile } from '@/lib/gallery';

const downloadIcon = (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline ml-1 text-[#C18037]">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
  </svg>
);

export default function EventWeddingDayGallery() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const wwwId = params.wwwId as string;
  const [tab, setTab] = useState<'photos' | 'videos'>('photos');
  const [eventData, setEventData] = useState<{galleryEnabled: boolean, rsvpEnabled: boolean} | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<{ src: string; thumb: string }[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Overlay state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadTotal, setUploadTotal] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Enhanced upload progress tracking
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [totalImages, setTotalImages] = useState(0);
  const [totalVideos, setTotalVideos] = useState(0);
  const [currentUploadingFile, setCurrentUploadingFile] = useState<string>('');
  const [currentPercent, setCurrentPercent] = useState<number | undefined>(undefined);

  // Preview modal state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewType, setPreviewType] = useState<'image' | 'video'>('image');
  const [previewIndex, setPreviewIndex] = useState(0);


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
      const response = await fetch(`/api/event-id/${wwwId}/gallery?albumType=wedding-day&mediaType=${tab}`);
      
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


  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const filesArray = Array.from(files);
    setSelectedFiles(filesArray);
    setUploadTotal(filesArray.length);
    setUploadProgress(0);
    setUploading(true);

    // Calculate file type breakdown
    const imageFiles = filesArray.filter(file => file.type.startsWith('image/'));
    const videoFiles = filesArray.filter(file => file.type.startsWith('video/'));
    setTotalImages(imageFiles.length);
    setTotalVideos(videoFiles.length);

    try {
      // Upload files to server (which now uploads to Bunny.net) with per-file progress
      const response = await uploadFiles(files, 'wedding-day', tab, ({ fileIndex, file, percent }) => {
        setCurrentUploadingFile(file.name);
        // Only show progress up to 90% - the remaining 10% is server processing
        const displayPercent = Math.min(percent * 0.9, 90);
        setCurrentPercent(displayPercent);
        // Don't update overall progress until server confirms completion
      });
      
      // Server processing complete - show 100% and update overall progress
      setCurrentPercent(100);
      setUploadProgress(filesArray.length);
      setCurrentUploadingFile('');
      
      // Reload gallery files after successful upload
      await loadGalleryFiles();
      
      setTimeout(() => {
        setUploading(false);
        setShowSuccess(true);
        // Reset progress tracking
        setSelectedFiles([]);
        setTotalImages(0);
        setTotalVideos(0);
        setCurrentPercent(undefined);
      }, 1000); // Give a moment to show 100% completion
    } catch (error) {
      console.error('Upload error:', error);
      setUploading(false);
      setCurrentUploadingFile('');
      setCurrentPercent(undefined);
      alert('Upload failed. Please try again.');
    }
  };

  // Preview modal functions
  const openPreview = (type: 'image' | 'video', index: number) => {
    setPreviewType(type);
    setPreviewIndex(index);
    setPreviewOpen(true);
  };

  const closePreview = () => {
    setPreviewOpen(false);
  };

  const navigatePreview = (direction: 'prev' | 'next') => {
    const currentItems = previewType === 'image' ? images : videos;
    if (direction === 'prev') {
      setPreviewIndex((prev) => (prev > 0 ? prev - 1 : currentItems.length - 1));
    } else {
      setPreviewIndex((prev) => (prev < currentItems.length - 1 ? prev + 1 : 0));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (previewOpen) {
      if (e.key === 'Escape') closePreview();
      if (e.key === 'ArrowLeft') navigatePreview('prev');
      if (e.key === 'ArrowRight') navigatePreview('next');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <EventHeader 
        eventId={wwwId}
        galleryEnabled={eventData?.galleryEnabled || false}
        rsvpEnabled={eventData?.rsvpEnabled || false}
        currentPage="gallery"
      />
      {uploading && (
        <UploadingOverlay 
          current={uploadProgress} 
          total={uploadTotal} 
          mediaType={tab}
          uploadedCount={uploadProgress}
          totalImages={totalImages}
          totalVideos={totalVideos}
          currentFileName={currentUploadingFile}
          currentPercent={currentPercent}
        />
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
      <div className="flex-1 flex flex-col items-center justify-center bg-white py-10 px-2 md:px-0 relative overflow-x-hidden pt-20" style={{ fontFamily: 'Montserrat, Arial, Helvetica, sans-serif' }}>
        <div className="relative w-full max-w-5xl bg-white rounded-2xl border border-[#C7B299] p-8 md:p-12 shadow-md mx-auto z-10" style={{ minHeight: 500 }}>
          {/* Decorative Corners and Sparkles */}
          <Image src="/images/Gallery/bottom-left-sparkle.png" alt="bottom left sparkle" width={202} height={32} className="absolute left-3 bottom-4 z-0" />
          <Image src="/images/Gallery/middle-right-sparkle.png" alt="middle right sparkle" width={280} height={42} className="absolute right-5 top-1/4 z-0" />
          <Image src="/images/Gallery/over-leaf-sparkle.png" alt="over leaf sparkle" width={252} height={32} className="absolute left-5 top-20 z-0" />

          {/* Main Content */}
          <div className="flex flex-col relative z-10">
            <div className="flex flex-row justify-between items-start mb-4">
              <div className="text-2xl md:text-3xl font-semibold text-[#08080A]" style={{ fontFamily: 'Montserrat', fontWeight: 500 }}>
                {t.gallery.weddingDay}
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="text-base md:text-lg font-semibold text-[#08080A] flex items-center" style={{ fontFamily: 'Montserrat', fontWeight: 500 }}>
                  {t.gallery.uploadPhotosVideos} {downloadIcon}
                </div>
                <div className="text-xs text-[#888] mt-1" style={{ fontFamily: 'Montserrat', fontWeight: 400 }}>
                  {t.gallery.uploadedBy} {new Date().toLocaleDateString('en-GB')}
                </div>
              </div>
            </div>
            {/* Tabs */}
            <div className="flex flex-row border-b border-[#C7B299] mb-4">
              <button onClick={() => setTab('photos')} className={`font-semibold mr-6 pb-2 border-b-2 ${tab === 'photos' ? 'text-[#C18037] border-[#C18037]' : 'text-[#08080A] border-transparent'}`} style={{ fontFamily: 'Montserrat', fontWeight: 500 }}>
                {t.gallery.photos}
              </button>
              <button onClick={() => setTab('videos')} className={`font-semibold pb-2 border-b-2 ${tab === 'videos' ? 'text-[#C18037] border-[#C18037]' : 'text-[#08080A] border-transparent'}`} style={{ fontFamily: 'Montserrat', fontWeight: 500 }}>
                {t.gallery.videos}
              </button>
            </div>
            {/* Image/Video Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {/* Upload Card */}
              <div className={`relative w-[180px] h-[180px] rounded-lg overflow-hidden group border ${tab === 'photos' ? 'border-[#E5B574]' : 'border-[#C18037]'}`}>
                <Image src="/images/Gallery/maingallery.jpg" alt="Upload" fill style={{ objectFit: 'cover' }} />
                <div className={`absolute inset-0 ${tab === 'photos' ? 'bg-[#E5B574]/70' : 'bg-[#C18037]/70'} flex flex-col items-center justify-center opacity-100 group-hover:opacity-100 transition-opacity duration-300`}>
                  <button onClick={() => fileInputRef.current?.click()} className="border border-white text-white rounded px-6 py-1 bg-transparent hover:bg-white hover:text-[#C18037] transition font-semibold" style={{ fontFamily: 'Montserrat', fontWeight: 600, fontSize: '16px', letterSpacing: '0.01em', lineHeight: 1.4 }}>{t.gallery.upload}</button>
                  <input ref={fileInputRef} type="file" accept={tab === 'photos' ? 'image/*' : 'video/*'} multiple className="hidden" onChange={handleUpload} />
                </div>
              </div>
              {/* Gallery Images or Videos */}
              {tab === 'photos' && images.map((img, i) => (
                <div key={i} className="relative w-[180px] h-[180px] rounded-lg overflow-hidden cursor-pointer group" onClick={() => openPreview('image', i)}>
                  <Image 
                    src={img} 
                    alt={`Gallery ${i}`} 
                    width={180} 
                    height={180} 
                    className="object-cover group-hover:scale-105 transition-transform duration-300" 
                    sizes="180px"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <svg width="24" height="24" fill="white" viewBox="0 0 24 24" className="w-6 h-6">
                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
              {tab === 'videos' && videos.map((vid, i) => (
                <div key={i} className="relative w-[180px] h-[180px] rounded-lg overflow-hidden cursor-pointer group" onClick={() => openPreview('video', i)}>
                  <video width={180} height={180} poster={vid.thumb} className="object-cover">
                    <source src={vid.src} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center group-hover:bg-opacity-50 transition-all duration-300">
                    <div className="w-10 h-10 bg-white bg-opacity-90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" className="text-gray-800 ml-1">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Event Footer - Sticky to bottom */}
      <div className="mt-auto">
        <EventFooter />
      </div>

      {/* Preview Modal */}
      {previewOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Close button */}
            <button
              onClick={closePreview}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Navigation buttons */}
            {((previewType === 'image' && images.length > 1) || (previewType === 'video' && videos.length > 1)) && (
              <>
                <button
                  onClick={() => navigatePreview('prev')}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
                >
                  <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => navigatePreview('next')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
                >
                  <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Media content */}
            <div className="max-w-full max-h-full flex items-center justify-center">
              {previewType === 'image' ? (
                <Image
                  src={images[previewIndex]}
                  alt={`Preview ${previewIndex + 1}`}
                  width={1200}
                  height={800}
                  className="max-w-full max-h-full object-contain"
                  sizes="100vw"
                />
              ) : (
                <video
                  src={videos[previewIndex].src}
                  controls
                  className="max-w-full max-h-full"
                  autoPlay
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
              {previewIndex + 1} / {previewType === 'image' ? images.length : videos.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}