import { NextRequest, NextResponse } from 'next/server';
import { uploadFiles } from '@/lib/bunny-net';

// Configure API route for large file uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '500mb', // Allow up to 500MB file uploads
    },
  },
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ wwwId: string }> }
) {
  try {
    const { wwwId } = await params;
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const albumType = formData.get('albumType') as string || 'wedding-day';
    const mediaType = formData.get('mediaType') as string || 'photos';
    const signature = formData.get('signature') as string || '';

    if (!wwwId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    // Validate album type and media type
    // Allow custom albums (UUID format) or default albums
    const isValidDefaultAlbum = ['wedding-day', 'party-day'].includes(albumType);
    const isValidCustomAlbum = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(albumType);
    
    if (!isValidDefaultAlbum && !isValidCustomAlbum) {
      return NextResponse.json({ error: 'Invalid album type' }, { status: 400 });
    }

    if (!['photos', 'videos'].includes(mediaType)) {
      return NextResponse.json({ error: 'Invalid media type' }, { status: 400 });
    }

    // Handle custom albums vs default albums differently
    if (isValidCustomAlbum) {
      // For custom albums, store files in database
      const { storeCustomAlbumFiles } = await import('@/lib/gallery-service');
      const uploadResult = await storeCustomAlbumFiles(
        files,
        albumType, // This is the custom album UUID
        wwwId,
        mediaType as 'photos' | 'videos',
        signature
      );

      return NextResponse.json({
        success: true,
        files: uploadResult.files,
        cdnUrls: uploadResult.cdnUrls,
        message: uploadResult.message
      });
    } else {
      // For default albums, use existing Bunny.net upload
      const uploadResult = await uploadFiles(
        files, 
        albumType as 'wedding-day' | 'party-day', 
        mediaType as 'photos' | 'videos',
        wwwId
      );

      return NextResponse.json({
        success: true,
        files: uploadResult.files,
        cdnUrls: uploadResult.cdnUrls,
        message: uploadResult.message
      });
    }

  } catch (error) {
    return NextResponse.json({ 
      error: 'Upload failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}