"use client";
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface EventData {
  id: string;
  wwwId: string;
  title: string;
  coupleNames: string;
  eventDate: string;
  venue?: string;
  galleryEnabled: boolean;
  status: string;
}

export default function EventGalleryUploadPage() {
  const params = useParams();
  const router = useRouter();
  const wwwId = params.wwwId as string;
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  useEffect(() => {
    if (!wwwId) {
      setError('Invalid event link');
      setLoading(false);
      return;
    }

    fetchEventData();
  }, [wwwId]);

  const fetchEventData = async () => {
    try {
      const response = await fetch(`/api/event-id/${wwwId}`);
      
      if (!response.ok) {
        throw new Error('Event not found');
      }

      const result = await response.json();
      setEventData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFiles(files);
    }
  };

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      alert('Please select files to upload');
      return;
    }

    if (!eventData) {
      alert('Event data not loaded');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // For now, we'll simulate upload progress
      // In a real implementation, you'd upload to your storage service
      const totalFiles = selectedFiles.length;
      
      for (let i = 0; i < totalFiles; i++) {
        const file = selectedFiles[i];
        
        // Simulate upload progress
        const progress = ((i + 1) / totalFiles) * 100;
        setUploadProgress(progress);
        
        // Here you would implement actual file upload logic
        // For example, upload to Bunny.net, AWS S3, or your preferred storage
        console.log(`Uploading file ${i + 1}/${totalFiles}:`, file.name);
        
        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      alert('Files uploaded successfully!');
      setSelectedFiles(null);
      setUploadProgress(0);
      
      // Reset file input
      const fileInput = document.getElementById('fileInput') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8F5F0] to-[#E8DCC6] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E5B574] mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !eventData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8F5F0] to-[#E8DCC6] flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-700 mb-4">Upload Not Available</div>
          <div className="text-gray-500 mb-6">{error || 'Event not found'}</div>
          <button 
            onClick={() => router.push(`/gallery/${wwwId}`)}
            className="bg-gradient-to-r from-[#E5B574] to-[#C18037] text-white font-semibold rounded-md px-8 py-2 shadow hover:opacity-90 transition"
          >
            Back to Gallery
          </button>
        </div>
      </div>
    );
  }

  if (!eventData.galleryEnabled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8F5F0] to-[#E8DCC6] flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-700 mb-4">Upload Not Available</div>
          <div className="text-gray-500 mb-6">Gallery upload is not enabled for this event.</div>
          <button 
            onClick={() => router.push(`/gallery/${wwwId}`)}
            className="bg-gradient-to-r from-[#E5B574] to-[#C18037] text-white font-semibold rounded-md px-8 py-2 shadow hover:opacity-90 transition"
          >
            Back to Gallery
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F5F0] to-[#E8DCC6] py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-base md:text-lg mb-2" style={{ fontFamily: 'Montserrat', fontWeight: 400 }}>
            Upload Photos & Videos
          </div>
          <div className="text-4xl md:text-5xl font-sail mb-2" style={{ fontWeight: 400, letterSpacing: '0.5px', lineHeight: 1.1 }}>
            {eventData.coupleNames}
          </div>
          <div className="text-2xl md:text-3xl font-sail mb-4" style={{ 
            background: 'linear-gradient(90deg, #E5B574 0%, #C18037 100%)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent', 
            fontWeight: 400, 
            letterSpacing: '0.5px', 
            lineHeight: 1.1 
          }}>
            {eventData.title || 'Wedding'}
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-2xl border border-[#C7B299] p-8 shadow-md">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Montserrat' }}>
              Share Your Memories
            </h2>
            <p className="text-gray-600 mb-6">
              Upload photos and videos from {eventData.coupleNames}'s special day
            </p>
          </div>

          {/* File Upload Area */}
          <div className="border-2 border-dashed border-[#E5B574] rounded-lg p-8 text-center mb-6">
            <Image 
              src="/images/Gallery/photo_icon.png" 
              alt="Upload" 
              width={64} 
              height={64} 
              className="mx-auto mb-4" 
            />
            <div className="mb-4">
              <label htmlFor="fileInput" className="cursor-pointer">
                <div className="text-lg font-semibold text-[#E5B574] mb-2">
                  Click to select files or drag and drop
                </div>
                <div className="text-sm text-gray-500">
                  Supports JPG, PNG, MP4, MOV (Max 10MB per file)
                </div>
              </label>
              <input
                id="fileInput"
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Selected Files */}
          {selectedFiles && selectedFiles.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Selected Files ({selectedFiles.length})</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {Array.from(selectedFiles).map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                    <div className="flex items-center">
                      <Image 
                        src="/images/Gallery/photo_icon.png" 
                        alt="File" 
                        width={24} 
                        height={24} 
                        className="mr-3" 
                      />
                      <span className="text-sm">{file.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Uploading...</span>
                <span className="text-sm text-gray-500">{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-[#E5B574] to-[#C18037] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push(`/gallery/${wwwId}`)}
              className="bg-gray-500 text-white font-semibold px-8 py-2 rounded-md hover:bg-gray-600 transition"
            >
              Back to Gallery
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFiles || selectedFiles.length === 0 || uploading}
              className="bg-gradient-to-r from-[#E5B574] to-[#C18037] text-white font-semibold px-8 py-2 rounded-md hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Upload Files'}
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-2xl border border-[#C7B299] p-8 mt-8 shadow-md">
          <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Montserrat' }}>
            Upload Guidelines
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li>• Upload high-quality photos and videos from the event</li>
            <li>• Supported formats: JPG, PNG, MP4, MOV</li>
            <li>• Maximum file size: 10MB per file</li>
            <li>• Photos will be reviewed before appearing in the gallery</li>
            <li>• Please be respectful and only upload appropriate content</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
