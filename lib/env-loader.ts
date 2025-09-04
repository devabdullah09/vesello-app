// Only run dotenv on the server side
if (typeof window === 'undefined') {
  // Server-side only
  const { config } = require('dotenv');
  const { resolve } = require('path');
  
  // Force load environment variables from .env file
  config({ path: resolve(process.cwd(), '.env') });
}

// Export environment variables (will be undefined on client side)
export const env = {
  BUNNY_NET_STORAGE_ZONE: typeof window === 'undefined' ? process.env.BUNNY_NET_STORAGE_ZONE : undefined,
  BUNNY_NET_STORAGE_API_KEY: typeof window === 'undefined' ? process.env.BUNNY_NET_STORAGE_API_KEY : undefined,
  BUNNY_NET_STORAGE_ENDPOINT: typeof window === 'undefined' ? process.env.BUNNY_NET_STORAGE_ENDPOINT : undefined,
  BUNNY_NET_CDN_URL: typeof window === 'undefined' ? process.env.BUNNY_NET_CDN_URL : undefined,
};

// Log what we loaded (server-side only)
if (typeof window === 'undefined') {
  console.log('Environment Loader Debug:', {
    cwd: process.cwd(),
    envFile: '.env',
    bunnyVars: {
      BUNNY_NET_STORAGE_ZONE: env.BUNNY_NET_STORAGE_ZONE || 'NOT_SET',
      BUNNY_NET_STORAGE_API_KEY: env.BUNNY_NET_STORAGE_API_KEY ? 'SET' : 'NOT_SET',
      BUNNY_NET_STORAGE_ENDPOINT: env.BUNNY_NET_STORAGE_ENDPOINT || 'NOT_SET',
      BUNNY_NET_CDN_URL: env.BUNNY_NET_CDN_URL || 'NOT_SET',
    }
  });
}
