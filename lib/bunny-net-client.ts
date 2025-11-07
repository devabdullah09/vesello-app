/**
 * Client-side utility for direct uploads to Bunny.net
 * This bypasses Vercel's 4.5MB limit by uploading directly from client to Bunny.net
 */

export interface UploadConfig {
  fileName: string;
  uploadUrl: string;
  cdnUrl: string;
  headers: {
    AccessKey: string;
    'Content-Type': string;
  };
  folderPath: string;
  uploadPath: string;
}

export interface UploadProgress {
  fileIndex: number;
  fileName: string;
  loaded: number;
  total: number;
  percent: number;
}

export interface DirectUploadResult {
  success: boolean;
  files: string[];
  cdnUrls: string[];
  message: string;
}

/**
 * Upload files directly to Bunny.net from the client
 * This bypasses Vercel completely
 */
export async function uploadDirectToBunny(
  files: File[],
  wwwId: string,
  albumType: string,
  mediaType: 'photos' | 'videos',
  onProgress?: (progress: UploadProgress) => void
): Promise<DirectUploadResult> {
  if (files.length === 0) {
    throw new Error('No files provided for upload');
  }

  // Step 1: Get upload URLs from our API
  const uploadUrlResponse = await fetch(`/api/${wwwId}/gallery/upload-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      files: files.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size,
      })),
      albumType,
      mediaType,
    }),
  });

  if (!uploadUrlResponse.ok) {
    const errorData = await uploadUrlResponse.json();
    throw new Error(errorData.error || 'Failed to get upload URLs');
  }

  const { uploads } = await uploadUrlResponse.json();

  // Step 2: Upload each file directly to Bunny.net
  const uploadedFiles: string[] = [];
  const cdnUrls: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const config: UploadConfig = uploads[i];

    try {
      // Upload directly to Bunny.net using PUT request
      const uploadResponse = await uploadFileDirect(
        file,
        config,
        (progress) => {
          if (onProgress) {
            onProgress({
              fileIndex: i,
              fileName: file.name,
              loaded: progress.loaded,
              total: progress.total,
              percent: progress.percent,
            });
          }
        }
      );

      if (uploadResponse.success) {
        uploadedFiles.push(config.fileName);
        cdnUrls.push(config.cdnUrl);
      } else {
        throw new Error(`Failed to upload ${file.name}: ${uploadResponse.error}`);
      }
    } catch (error) {
      console.error(`Error uploading ${file.name}:`, error);
      throw new Error(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return {
    success: true,
    files: uploadedFiles,
    cdnUrls,
    message: `${uploadedFiles.length} file(s) uploaded successfully to Bunny.net`,
  };
}

/**
 * Upload a single file directly to Bunny.net
 */
async function uploadFileDirect(
  file: File,
  config: UploadConfig,
  onProgress?: (progress: { loaded: number; total: number; percent: number }) => void
): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = (event.loaded / event.total) * 100;
        onProgress({
          loaded: event.loaded,
          total: event.total,
          percent,
        });
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({ success: true });
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.responseText}`));
      }
    });

    xhr.addEventListener('error', () => {
      // Check if it's a CORS error
      const isCorsError = xhr.status === 0 || xhr.readyState === 0;
      if (isCorsError) {
        reject(new Error('CORS error: Please check Bunny.net CORS settings. The Storage API might need CORS configured on the Pull Zone or Storage Zone settings.'));
      } else {
        reject(new Error(`Network error during upload: ${xhr.statusText || 'Unknown error'}`));
      }
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload was aborted'));
    });

    // Open PUT request to Bunny.net
    xhr.open('PUT', config.uploadUrl);

    // Set headers
    Object.entries(config.headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });

    // Send the file
    xhr.send(file);
  });
}

/**
 * Register uploaded files in the database
 * Call this after successful direct upload to Bunny.net
 */
export async function registerUploadedFiles(
  wwwId: string,
  files: string[],
  cdnUrls: string[],
  albumType: string,
  mediaType: 'photos' | 'videos',
  signature?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const trimmedSignature = signature ? String(signature).trim() : undefined;
    console.log('registerUploadedFiles - sending signature:', trimmedSignature || 'none', 'type:', typeof trimmedSignature);
    const response = await fetch(`/api/${wwwId}/gallery/register-uploads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        files,
        cdnUrls,
        albumType,
        mediaType,
        signature: trimmedSignature, // Send trimmed signature
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Register uploads error response:', errorData);
      const errorMessage = errorData.details || errorData.error || 'Failed to register uploads';
      throw new Error(`${errorMessage}${errorData.code ? ` (Code: ${errorData.code})` : ''}${errorData.hint ? ` - ${errorData.hint}` : ''}`);
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

