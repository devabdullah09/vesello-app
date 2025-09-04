// Temporary storage solution without Firebase Storage
// We'll use this until you upgrade to Firebase Storage

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
}

// Mock upload function for now
export const uploadFile = async (
  file: File, 
  path: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<any> => {
  // For now, we'll return a mock response
  // Later, you can replace this with Firebase Storage or other services
  
  if (onProgress) {
    // Simulate upload progress
    const simulateProgress = () => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        onProgress({
          bytesTransferred: (file.size * progress) / 100,
          totalBytes: file.size,
          percentage: progress
        });
        
        if (progress >= 100) {
          clearInterval(interval);
        }
      }, 100);
    };
    
    simulateProgress();
  }
  
  // Return a mock URL (you can replace this with actual upload logic)
  return {
    ref: { fullPath: path },
    metadata: { name: file.name }
  };
};

// Mock download URL function
export const getFileURL = async (path: string): Promise<string> => {
  // For now, return a placeholder URL
  // You can replace this with actual file URLs later
  return `https://via.placeholder.com/400x300/cccccc/666666?text=Image+Placeholder`;
};

// Mock delete function
export const deleteFile = async (path: string): Promise<void> => {
  console.log('Mock delete file:', path);
  // No actual deletion for now
};

// Mock list files function
export const listFiles = async (path: string): Promise<string[]> => {
  // Return empty array for now
  return [];
};

// Generate unique file path for gallery uploads
export const generateGalleryPath = (eventId: string, fileName: string): string => {
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `gallery/${eventId}/${timestamp}_${sanitizedFileName}`;
};

// Generate unique file path for event uploads
export const generateEventPath = (eventId: string, fileName: string, type: 'image' | 'document'): string => {
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `events/${eventId}/${type}/${timestamp}_${sanitizedFileName}`;
};

// Validate file type and size
export const validateFile = (file: File, allowedTypes: string[], maxSizeMB: number): boolean => {
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }
  
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new Error(`File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum size of ${maxSizeMB}MB`);
  }
  
  return true;
};

// Gallery-specific upload with validation
export const uploadGalleryFile = async (
  file: File,
  eventId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<{ downloadURL: string; path: string }> => {
  // Validate file
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/mov'];
  validateFile(file, allowedTypes, 50); // 50MB max size
  
  // Generate path
  const path = generateGalleryPath(eventId, file.name);
  
  // Upload file (mock for now)
  await uploadFile(file, path, onProgress);
  
  // Get download URL (mock for now)
  const downloadURL = await getFileURL(path);
  
  return { downloadURL, path };
};

// Note: When you're ready to upgrade Firebase Storage, you can replace this file
// with the original Firebase Storage implementation from the previous version. 