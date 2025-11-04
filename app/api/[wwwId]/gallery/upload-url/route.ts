import { NextRequest, NextResponse } from 'next/server';
import { bunnyNetConfig } from '@/lib/bunny-net';
import '@/lib/env-loader';

/**
 * Generate upload URLs for direct client-to-Bunny.net uploads
 * This bypasses Vercel's 4.5MB limit by allowing direct uploads
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ wwwId: string }> }
) {
  try {
    const { wwwId } = await params;
    const body = await request.json();
    const { files, albumType, mediaType } = body;

    if (!wwwId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    if (!albumType || !mediaType) {
      return NextResponse.json({ error: 'Album type and media type are required' }, { status: 400 });
    }

    // Validate album type and media type
    const isValidDefaultAlbum = ['wedding-day', 'party-day'].includes(albumType);
    const isValidCustomAlbum = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(albumType);
    
    if (!isValidDefaultAlbum && !isValidCustomAlbum) {
      return NextResponse.json({ error: 'Invalid album type' }, { status: 400 });
    }

    if (!['photos', 'videos'].includes(mediaType)) {
      return NextResponse.json({ error: 'Invalid media type' }, { status: 400 });
    }

    // Validate config
    if (!bunnyNetConfig.storageApiKey || !bunnyNetConfig.storageEndpoint) {
      return NextResponse.json({ 
        error: 'Bunny.net configuration missing',
        details: 'Storage API key or endpoint not configured'
      }, { status: 500 });
    }

    // Generate upload URLs for each file
    const uploadConfigs = files.map((file: { name: string; type: string; size: number }) => {
      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split('.').pop() || 'bin';
      const fileName = `${timestamp}_${randomString}.${fileExtension}`;

      // Generate folder path
      const folderPath = `events/${wwwId}/${albumType}/${mediaType}`;
      const uploadPath = `${folderPath}/${fileName}`;
      const uploadUrl = `${bunnyNetConfig.storageEndpoint}/${uploadPath}`;

      // Generate CDN URL for after upload
      const cdnUrl = `${bunnyNetConfig.cdnUrl}/${uploadPath}`;

      return {
        fileName,
        uploadUrl,
        cdnUrl,
        headers: {
          'AccessKey': bunnyNetConfig.storageApiKey,
          'Content-Type': file.type || 'application/octet-stream',
        },
        folderPath,
        uploadPath,
      };
    });

    return NextResponse.json({
      success: true,
      uploads: uploadConfigs,
      albumType,
      mediaType,
      wwwId,
    });

  } catch (error) {
    console.error('Error generating upload URLs:', error);
    return NextResponse.json({ 
      error: 'Failed to generate upload URLs', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

