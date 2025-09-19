// Only run dotenv on the server side
if (typeof window === 'undefined') {
  // Server-side only
  const { config } = require('dotenv');
  const { resolve } = require('path');
  
  // Try to load from .env.local first, then .env
  const envLocalPath = resolve(process.cwd(), '.env.local');
  const envPath = resolve(process.cwd(), '.env');
  
  // Load .env.local first (Next.js priority)
  const localResult = config({ path: envLocalPath });
  if (localResult.error) {
    console.log('No .env.local file found, trying .env...');
    // If .env.local doesn't exist, try .env
    const envResult = config({ path: envPath });
    if (envResult.error) {
      console.log('No .env file found either. Please create .env.local with your environment variables.');
    }
  }
  
}

// Export environment variables (will be undefined on client side)
export const env = {
  BUNNY_NET_STORAGE_ZONE: typeof window === 'undefined' ? process.env.BUNNY_NET_STORAGE_ZONE : undefined,
  BUNNY_NET_STORAGE_API_KEY: typeof window === 'undefined' ? process.env.BUNNY_NET_STORAGE_API_KEY : undefined,
  BUNNY_NET_STORAGE_ENDPOINT: typeof window === 'undefined' ? process.env.BUNNY_NET_STORAGE_ENDPOINT : undefined,
  BUNNY_NET_CDN_URL: typeof window === 'undefined' ? process.env.NEXT_PUBLIC_BUNNY_NET_CDN_URL : undefined,
};

// Log what we loaded (server-side only)
if (typeof window === 'undefined') {
  console.log('Environment Loader Debug:', {
    cwd: process.cwd(),
    envFile: '.env.local',
    bunnyVars: {
      BUNNY_NET_STORAGE_ZONE: env.BUNNY_NET_STORAGE_ZONE || 'NOT_SET',
      BUNNY_NET_STORAGE_API_KEY: env.BUNNY_NET_STORAGE_API_KEY ? 'SET' : 'NOT_SET',
      BUNNY_NET_STORAGE_ENDPOINT: env.BUNNY_NET_STORAGE_ENDPOINT || 'NOT_SET',
      BUNNY_NET_CDN_URL: env.BUNNY_NET_CDN_URL || 'NOT_SET',
    },
    rawEnvVars: {
      BUNNY_NET_STORAGE_ZONE: process.env.BUNNY_NET_STORAGE_ZONE || 'NOT_SET',
      BUNNY_NET_STORAGE_API_KEY: process.env.BUNNY_NET_STORAGE_API_KEY ? 'SET' : 'NOT_SET',
      BUNNY_NET_STORAGE_ENDPOINT: process.env.BUNNY_NET_STORAGE_ENDPOINT || 'NOT_SET',
      NEXT_PUBLIC_BUNNY_NET_CDN_URL: process.env.NEXT_PUBLIC_BUNNY_NET_CDN_URL || 'NOT_SET',
    }
  });
}
