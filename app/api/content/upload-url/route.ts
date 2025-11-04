import { NextRequest, NextResponse } from 'next/server';
import { bunnyNetConfig } from '@/lib/bunny-net';
import '@/lib/env-loader';

/**
 * Generate upload URL for content images (team photos, venue images, etc.)
 * This bypasses Vercel's 4.5MB limit by allowing direct uploads
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileName, fileType, fileSize, uploadPath, wwwId } = body;

    if (!fileName || !fileType) {
      return NextResponse.json({ error: 'File name and type are required' }, { status: 400 });
    }

    // Validate file type
    if (!fileType.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // Validate file size (max 50MB for content images)
    if (fileSize && fileSize > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 50MB' }, { status: 400 });
    }

    // Validate config
    if (!bunnyNetConfig.storageApiKey || !bunnyNetConfig.storageEndpoint) {
      return NextResponse.json({ 
        error: 'Bunny.net configuration missing',
        details: 'Storage API key or endpoint not configured'
      }, { status: 500 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = fileName.split('.').pop() || 'jpg';
    const uniqueFileName = `${timestamp}_${randomString}.${fileExtension}`;

    // Generate folder path
    const path = uploadPath || 'content-images';
    const folderPath = wwwId ? `events/${wwwId}/${path}` : path;
    const uploadPathFull = `${folderPath}/${uniqueFileName}`;
    const uploadUrl = `${bunnyNetConfig.storageEndpoint}/${uploadPathFull}`;

    // Generate CDN URL
    const cdnUrl = `${bunnyNetConfig.cdnUrl}/${uploadPathFull}`;

    return NextResponse.json({
      success: true,
      uploadUrl,
      cdnUrl,
      fileName: uniqueFileName,
      headers: {
        'AccessKey': bunnyNetConfig.storageApiKey,
        'Content-Type': fileType || 'application/octet-stream',
      },
    });

  } catch (error) {
    console.error('Error generating upload URL:', error);
    return NextResponse.json({ 
      error: 'Failed to generate upload URL', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

