import './env-loader';
import { env } from './env-loader';

export interface BunnyNetConfig {
  storageZoneName: string;
  storageApiKey: string;
  storageEndpoint: string;
  cdnUrl: string;
}

export interface BunnyNetUploadResponse {
  success: boolean;
  files: string[];
  message: string;
  cdnUrls: string[];
}

export class BunnyNetService {
  private config: BunnyNetConfig;

  constructor(config: BunnyNetConfig) {
    this.config = config;
    // Don't validate config immediately - let it fail gracefully when methods are called
  }

  private validateConfig() {
    const missingVars = [];
    
    if (!this.config.storageApiKey) {
      missingVars.push('BUNNY_NET_STORAGE_API_KEY');
    }
    if (!this.config.storageZoneName) {
      missingVars.push('BUNNY_NET_STORAGE_ZONE');
    }
    if (!this.config.storageEndpoint) {
      missingVars.push('BUNNY_NET_STORAGE_ENDPOINT');
    }
    if (!this.config.cdnUrl) {
      missingVars.push('BUNNY_NET_CDN_URL');
    }

    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}. Please check your .env.local file.`);
    }
  }

  /**
   * Validate file before upload
   */
  private validateFile(file: File, mediaType: 'photos' | 'videos'): void {
    const maxSize = mediaType === 'photos' ? 10 * 1024 * 1024 : 100 * 1024 * 1024; // 10MB for photos, 100MB for videos
    
    if (file.size > maxSize) {
      throw new Error(`File ${file.name} is too large. Maximum size: ${maxSize / (1024 * 1024)}MB`);
    }

    const allowedTypes = mediaType === 'photos' 
      ? ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/avif']
      : ['video/mp4', 'video/mov', 'video/avi', 'video/webm'];

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not allowed for ${mediaType}`);
    }
  }

  /**
   * Upload files to Bunny.net Storage
   */
  async uploadFiles(
    files: File[],
    albumType: 'wedding-day' | 'party-day',
    mediaType: 'photos' | 'videos',
    eventId?: string
  ): Promise<BunnyNetUploadResponse> {
    // Validate config before proceeding
    this.validateConfig();
    
    if (files.length === 0) {
      throw new Error('No files provided for upload');
    }

    const uploadedFiles: string[] = [];
    const cdnUrls: string[] = [];

    for (const file of files) {
      try {
        // Validate file before upload
        this.validateFile(file, mediaType);
        
        const fileName = await this.uploadSingleFile(file, albumType, mediaType, eventId);
        uploadedFiles.push(fileName);
        
        // Generate CDN URL
        const cdnUrl = this.getCdnUrl(fileName, albumType, mediaType, eventId);
        cdnUrls.push(cdnUrl);
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        throw new Error(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      success: true,
      files: uploadedFiles,
      message: `${uploadedFiles.length} file(s) uploaded successfully to Bunny.net`,
      cdnUrls
    };
  }

  /**
   * Upload a single file to Bunny.net Storage
   */
  private async uploadSingleFile(
    file: File,
    albumType: string,
    mediaType: string,
    eventId?: string
  ): Promise<string> {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}_${randomString}.${fileExtension}`;
    
    // Bunny.net Storage API endpoint - use event-specific folder if provided
    const folderPath = eventId ? `events/${eventId}/${albumType}/${mediaType}` : `${albumType}/${mediaType}`;
    const uploadUrl = `${this.config.storageEndpoint}/${folderPath}/${fileName}`;
    
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'AccessKey': this.config.storageApiKey,
        'Content-Type': file.type || 'application/octet-stream',
        'Content-Length': buffer.length.toString(),
      },
      body: buffer,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return fileName;
  }

  /**
   * Delete a file from Bunny.net Storage
   */
  async deleteFile(
    fileName: string,
    albumType: string,
    mediaType: string,
    eventId?: string
  ): Promise<boolean> {
    this.validateConfig();
    
    const folderPath = eventId ? `events/${eventId}/${albumType}/${mediaType}` : `${albumType}/${mediaType}`;
    const deleteUrl = `${this.config.storageEndpoint}/${folderPath}/${fileName}`;
    
    const response = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'AccessKey': this.config.storageApiKey,
      },
    });

    return response.ok;
  }

  /**
   * List files in a directory
   */
  async listFiles(
    albumType: string,
    mediaType: string,
    eventId?: string
  ): Promise<string[]> {
    this.validateConfig();
    
    const folderPath = eventId ? `events/${eventId}/${albumType}/${mediaType}` : `${albumType}/${mediaType}`;
    const listUrl = `${this.config.storageEndpoint}/${folderPath}/`;
    
    const response = await fetch(listUrl, {
      method: 'GET',
      headers: {
        'AccessKey': this.config.storageApiKey,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        // Directory doesn't exist yet, return empty array
        return [];
      }
      throw new Error(`Failed to list files: ${response.status} ${response.statusText}`);
    }

    try {
      const data = await response.json();
      return data.map((item: any) => item.ObjectName);
    } catch (error) {
      console.error('Error parsing file list response:', error);
      return [];
    }
  }

  /**
   * Get CDN URL for a file
   */
  getCdnUrl(fileName: string, albumType: string, mediaType: string, eventId?: string): string {
    const folderPath = eventId ? `events/${eventId}/${albumType}/${mediaType}` : `${albumType}/${mediaType}`;
    return `${this.config.cdnUrl}/${folderPath}/${fileName}`;
  }

  /**
   * Test connection to Bunny.net
   */
  async testConnection(): Promise<boolean> {
    try {
      this.validateConfig();
      
      // Try to list files from the root directory instead of just testing the endpoint
      const response = await fetch(`${this.config.storageEndpoint}/`, {
        method: 'GET',
        headers: {
          'AccessKey': this.config.storageApiKey,
        },
      });
      
      console.log('Bunny.net test connection response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Bunny.net test connection failed:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        
        // Try alternative endpoint format
        console.log('Trying alternative endpoint format...');
        const altResponse = await fetch(`${this.config.storageEndpoint}`, {
          method: 'GET',
          headers: {
            'AccessKey': this.config.storageApiKey,
          },
        });
        
        console.log('Alternative endpoint response:', {
          status: altResponse.status,
          statusText: altResponse.statusText,
          url: altResponse.url
        });
        
        if (altResponse.ok) {
          return true;
        }
      }
      
      return response.ok;
    } catch (error) {
      console.error('Bunny.net connection test failed:', error);
      return false;
    }
  }
}

// Default configuration (you'll need to set these in environment variables)
export const bunnyNetConfig: BunnyNetConfig = {
  storageZoneName: env.BUNNY_NET_STORAGE_ZONE || 'wedding-app-storage',
  storageApiKey: env.BUNNY_NET_STORAGE_API_KEY || '',
  storageEndpoint: env.BUNNY_NET_STORAGE_ENDPOINT || 'https://storage.bunnycdn.com/wedding-app-storage',
  cdnUrl: env.BUNNY_NET_CDN_URL || 'https://cdn.vesello.net',
};

// Debug: Log the configuration to see what's being loaded (server-side only)
if (typeof window === 'undefined') {
  console.log('Bunny.net Config Debug:', {
    storageZoneName: bunnyNetConfig.storageZoneName,
    storageApiKey: bunnyNetConfig.storageApiKey ? `SET (${bunnyNetConfig.storageApiKey.length} chars)` : 'NOT_SET',
    storageEndpoint: bunnyNetConfig.storageEndpoint,
    cdnUrl: bunnyNetConfig.cdnUrl,
    envVars: {
      BUNNY_NET_STORAGE_ZONE: env.BUNNY_NET_STORAGE_ZONE || 'NOT_SET',
      BUNNY_NET_STORAGE_API_KEY: env.BUNNY_NET_STORAGE_API_KEY ? 'SET' : 'NOT_SET',
      BUNNY_NET_STORAGE_ENDPOINT: env.BUNNY_NET_STORAGE_ENDPOINT || 'NOT_SET',
      BUNNY_NET_CDN_URL: env.BUNNY_NET_CDN_URL || 'NOT_SET',
    }
  });
}

// Lazy initialization of the service to ensure env vars are loaded
let _bunnyNetService: BunnyNetService | null = null;

function getBunnyNetService(): BunnyNetService {
  if (!_bunnyNetService) {
    // Force reload environment variables if we're on the server
    if (typeof window === 'undefined') {
      // Re-import the env-loader to ensure fresh environment variables
      const { env: freshEnv } = require('./env-loader');
      
      // Create a fresh config with the latest environment variables
      const freshConfig: BunnyNetConfig = {
        storageZoneName: freshEnv.BUNNY_NET_STORAGE_ZONE || 'wedding-app-storage',
        storageApiKey: freshEnv.BUNNY_NET_STORAGE_API_KEY || '',
        storageEndpoint: freshEnv.BUNNY_NET_STORAGE_ENDPOINT || 'https://storage.bunnycdn.com/wedding-app-storage',
        cdnUrl: freshEnv.BUNNY_NET_CDN_URL || 'https://cdn.vesello.net',
      };
      
      // Debug: Log the configuration to see what's being loaded (server-side only)
      console.log('Bunny.net Config Debug (Lazy Init):', {
        storageZoneName: freshConfig.storageZoneName,
        storageApiKey: freshConfig.storageApiKey ? `SET (${freshConfig.storageApiKey.length} chars)` : 'NOT_SET',
        storageEndpoint: freshConfig.storageEndpoint,
        cdnUrl: freshConfig.cdnUrl,
        envVars: {
          BUNNY_NET_STORAGE_ZONE: freshEnv.BUNNY_NET_STORAGE_ZONE || 'NOT_SET',
          BUNNY_NET_STORAGE_API_KEY: freshEnv.BUNNY_NET_STORAGE_API_KEY ? 'SET' : 'NOT_SET',
          BUNNY_NET_STORAGE_ENDPOINT: freshEnv.BUNNY_NET_STORAGE_ENDPOINT || 'NOT_SET',
          BUNNY_NET_CDN_URL: freshEnv.BUNNY_NET_CDN_URL || 'NOT_SET',
        }
      });
      
      try {
        _bunnyNetService = new BunnyNetService(freshConfig);
        console.log('Bunny.net service initialized successfully (lazy)');
      } catch (error) {
        console.error('Bunny.net service initialization failed (lazy):', error);
        throw error;
      }
    } else {
      // Client-side: use the original config
      _bunnyNetService = new BunnyNetService(bunnyNetConfig);
    }
  }
  return _bunnyNetService;
}

export const bunnyNetService = {
  get instance() {
    return getBunnyNetService();
  }
};

// Proxy all methods to the lazy instance
export const uploadFiles = (...args: Parameters<BunnyNetService['uploadFiles']>) => bunnyNetService.instance.uploadFiles(...args);
export const deleteFile = (...args: Parameters<BunnyNetService['deleteFile']>) => bunnyNetService.instance.deleteFile(...args);
export const listFiles = (...args: Parameters<BunnyNetService['listFiles']>) => bunnyNetService.instance.listFiles(...args);
export const getCdnUrl = (...args: Parameters<BunnyNetService['getCdnUrl']>) => bunnyNetService.instance.getCdnUrl(...args);
export const testConnection = (...args: Parameters<BunnyNetService['testConnection']>) => bunnyNetService.instance.testConnection(...args);

// Helper function for single file upload (exposes the private method)
export const uploadSingleFile = async (file: File, albumType: string, mediaType: string, eventId?: string): Promise<string> => {
  const service = getBunnyNetService();
  // We need to access the private method, so we'll recreate the logic here
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  // Generate unique filename
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const fileExtension = file.name.split('.').pop();
  const fileName = `${timestamp}_${randomString}.${fileExtension}`;
  
  // Bunny.net Storage API endpoint - use event-specific folder if provided
  const folderPath = eventId ? `events/${eventId}/${albumType}/${mediaType}` : `${albumType}/${mediaType}`;
  const uploadUrl = `${service['config'].storageEndpoint}/${folderPath}/${fileName}`;
  
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'AccessKey': service['config'].storageApiKey,
      'Content-Type': file.type || 'application/octet-stream',
      'Content-Length': buffer.length.toString(),
    },
    body: buffer,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return fileName;
};
