import { env } from './env-loader';

export interface GalleryFile {
  url: string;
  filename: string;
  uploadedAt: string;
  cdnUrl?: string;
}

export interface UploadResponse {
  success: boolean;
  files: string[];
  cdnUrls: string[];
  message: string;
}

export interface GalleryResponse {
  success: boolean;
  files: GalleryFile[];
  count: number;
}

export async function uploadFiles(
  files: FileList | File[],
  albumType: 'wedding-day' | 'party-day',
  mediaType: 'photos' | 'videos'
): Promise<UploadResponse> {
  const formData = new FormData();
  
  // Add files to form data
  Array.from(files).forEach((file) => {
    formData.append('files', file);
  });
  
  // Add metadata
  formData.append('albumType', albumType);
  formData.append('mediaType', mediaType);

  const response = await fetch('/api/gallery/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Upload failed');
  }

  return response.json();
}

export async function fetchGalleryFiles(
  albumType: 'wedding-day' | 'party-day',
  mediaType: 'photos' | 'videos'
): Promise<GalleryResponse> {
  const params = new URLSearchParams({
    albumType,
    mediaType,
  });

  const response = await fetch(`/api/gallery/images?${params}`);

  if (!response.ok) {
    throw new Error('Failed to fetch gallery files');
  }

  return response.json();
}

export function getInitialImages(): string[] {
  return [
    '/images/Gallery/maingallery.jpg',
    '/images/Gallery/afterPArty.png',
    '/images/Gallery/weddingDay.png',
  ];
}

export function getInitialVideos(): { src: string; thumb: string }[] {
  return [
    { src: '/videos/sample1.mp4', thumb: '/images/placeholder.jpg' },
    { src: '/videos/sample2.mp4', thumb: '/images/placeholder.jpg' },
  ];
}

// Helper function to get CDN URL for a file
export function getCdnUrl(fileName: string, albumType: string, mediaType: string): string {
  // Use the public environment variable for client-side access
  const cdnBaseUrl = process.env.NEXT_PUBLIC_BUNNY_NET_CDN_URL || 'https://cdn.vesello.net';
  return `${cdnBaseUrl}/${albumType}/${mediaType}/${fileName}`;
} 