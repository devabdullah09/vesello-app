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
  albumType: 'wedding-day' | 'party-day' | string,
  mediaType: 'photos' | 'videos',
  onFileProgress?: (args: { fileIndex: number; file: File; loaded: number; total: number; percent: number }) => void,
  wwwId?: string
): Promise<UploadResponse> {
  // We upload in one request when possible, but to support per-file progress (especially for large videos),
  // we stream each file via XHR and track progress, then fall back to a batched fetch for small images.

  const fileArray = Array.from(files);

  // Determine the API endpoint based on whether wwwId is provided
  const apiEndpoint = wwwId ? `/api/event-id/${wwwId}/gallery/upload` : '/api/gallery/upload';

  // If a progress callback is provided, upload files one by one with XHR to report progress.
  if (onFileProgress) {
    const uploadedFiles: string[] = [];
    const cdnUrls: string[] = [];

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];

      const formData = new FormData();
      formData.append('files', file);
      formData.append('albumType', albumType);
      formData.append('mediaType', mediaType);

      // Use XHR to capture progress events
      const xhr = new XMLHttpRequest();
      const promise = new Promise<{ files: string[]; cdnUrls: string[] }>((resolve, reject) => {
        xhr.open('POST', apiEndpoint);
        xhr.onload = () => {
          try {
            if (xhr.status >= 200 && xhr.status < 300) {
              const data = JSON.parse(xhr.responseText);
              resolve({ files: data.files || [], cdnUrls: data.cdnUrls || [] });
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          } catch (e) {
            reject(new Error('Failed to parse upload response'));
          }
        };
        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable) {
            const percent = (evt.loaded / evt.total) * 100;
            onFileProgress({ fileIndex: i, file, loaded: evt.loaded, total: evt.total, percent });
          }
        };
        xhr.send(formData);
      });

      const res = await promise;
      uploadedFiles.push(...res.files);
      cdnUrls.push(...res.cdnUrls);
    }

    return {
      success: true,
      files: uploadedFiles,
      cdnUrls,
      message: `${uploadedFiles.length} file(s) uploaded successfully`,
    };
  }

  // Batched upload (no fine-grained per-file progress)
  const formData = new FormData();
  fileArray.forEach((file) => formData.append('files', file));
  formData.append('albumType', albumType);
  formData.append('mediaType', mediaType);

  const response = await fetch(apiEndpoint, { method: 'POST', body: formData });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
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