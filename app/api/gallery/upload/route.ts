import { NextRequest, NextResponse } from 'next/server';
import { bunnyNetService } from '@/lib/bunny-net';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const albumType = formData.get('albumType') as string; // 'wedding-day' or 'party-day'
    const mediaType = formData.get('mediaType') as string; // 'photos' or 'videos'

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    if (!albumType || !mediaType) {
      return NextResponse.json({ error: 'Album type and media type are required' }, { status: 400 });
    }

    // Validate album type and media type
    if (!['wedding-day', 'party-day'].includes(albumType)) {
      return NextResponse.json({ error: 'Invalid album type' }, { status: 400 });
    }

    if (!['photos', 'videos'].includes(mediaType)) {
      return NextResponse.json({ error: 'Invalid media type' }, { status: 400 });
    }

    // Upload files to Bunny.net
    const uploadResult = await bunnyNetService.uploadFiles(files, albumType as 'wedding-day' | 'party-day', mediaType as 'photos' | 'videos');

    return NextResponse.json({
      success: true,
      files: uploadResult.files,
      cdnUrls: uploadResult.cdnUrls,
      message: uploadResult.message
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Upload failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 