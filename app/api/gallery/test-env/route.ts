import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check if environment variables are loaded
    const envVars = {
      BUNNY_NET_STORAGE_ZONE: process.env.BUNNY_NET_STORAGE_ZONE || 'NOT_SET',
      BUNNY_NET_STORAGE_API_KEY: process.env.BUNNY_NET_STORAGE_API_KEY ? 'SET (length: ' + process.env.BUNNY_NET_STORAGE_API_KEY.length + ')' : 'NOT_SET',
      BUNNY_NET_STORAGE_ENDPOINT: process.env.BUNNY_NET_STORAGE_ENDPOINT || 'NOT_SET',
      BUNNY_NET_CDN_URL: process.env.BUNNY_NET_CDN_URL || 'NOT_SET',
      NEXT_PUBLIC_BUNNY_NET_CDN_URL: process.env.NEXT_PUBLIC_BUNNY_NET_CDN_URL || 'NOT_SET',
      NODE_ENV: process.env.NODE_ENV || 'NOT_SET',
    };

    return NextResponse.json({
      success: true,
      message: 'Environment variables check',
      environment: envVars,
      note: 'If any show NOT_SET, check your .env file. Server-side variables should be loaded automatically.',
      debug: {
        cwd: process.cwd(),
        envFileExists: true, // We know .env exists
        processEnvKeys: Object.keys(process.env).filter(key => key.includes('BUNNY'))
      }
    });

  } catch (error) {
    console.error('Environment check error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Environment check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
