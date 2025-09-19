'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
  placeholder?: string;
  className?: string;
  uploadPath?: string; // e.g., 'team-photos', 'venue-images'
}

export default function ImageUpload({
  currentImage,
  onImageChange,
  placeholder = "Click to upload image",
  className = "w-32 h-32",
  uploadPath = 'event-images'
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('uploadPath', uploadPath);

      // Upload to content upload endpoint
      const response = await fetch('/api/content/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const result = await response.json();
      
      if (result.success && result.data?.url) {
        onImageChange(result.data.url);
      } else {
        throw new Error('Upload failed - no URL returned');
      }

    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div
        onClick={handleClick}
        className={`${className} border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-[#E5B574] transition-colors relative overflow-hidden bg-gray-50`}
      >
        {uploading ? (
          <div className="flex flex-col items-center space-y-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#E5B574]"></div>
            <span className="text-xs text-gray-600">Uploading...</span>
          </div>
        ) : currentImage ? (
          <div className="relative w-full h-full group">
            <Image
              src={currentImage}
              alt="Uploaded image"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2 p-4 text-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span className="text-xs text-gray-600">{placeholder}</span>
          </div>
        )}
      </div>

      {currentImage && (
        <button
          onClick={handleRemove}
          className="w-full text-xs text-red-600 hover:text-red-800 transition-colors"
        >
          Remove Image
        </button>
      )}

      {error && (
        <div className="text-xs text-red-600">{error}</div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
