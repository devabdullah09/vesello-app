import { NextRequest, NextResponse } from 'next/server';
import { bunnyNetService } from '@/lib/bunny-net';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const albumType = searchParams.get('albumType'); // 'wedding-day' or 'party-day'
    const mediaType = searchParams.get('mediaType'); // 'photos' or 'videos'

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

    try {
      // List files from Bunny.net Storage
      const files = await bunnyNetService.listFiles(albumType, mediaType);
      
      // Filter for image/video files and create CDN URLs
      const mediaFiles = files
        .filter(file => {
          const ext = file.toLowerCase();
          if (mediaType === 'photos') {
            return ext.endsWith('.jpg') || ext.endsWith('.jpeg') || ext.endsWith('.png') || ext.endsWith('.gif') || ext.endsWith('.webp') || ext.endsWith('.avif');
          } else {
            return ext.endsWith('.mp4') || ext.endsWith('.mov') || ext.endsWith('.avi') || ext.endsWith('.webm');
          }
        })
        .map(file => ({
          url: bunnyNetService.getCdnUrl(file, albumType, mediaType),
          cdnUrl: bunnyNetService.getCdnUrl(file, albumType, mediaType),
          filename: file,
          uploadedAt: new Date(parseInt(file.split('_')[0])).toISOString()
        }))
        .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()); // Sort by newest first

      return NextResponse.json({ 
        success: true, 
        files: mediaFiles,
        count: mediaFiles.length
      });

    } catch (bunnyError) {
      console.error('Error fetching from Bunny.net:', bunnyError);
      // Return empty result if Bunny.net is not accessible
      return NextResponse.json({ 
        success: true, 
        files: [],
        count: 0
      });
    }

  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
  }
} 