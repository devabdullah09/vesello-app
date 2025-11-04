import { NextRequest, NextResponse } from 'next/server';
import { listFiles, getCdnUrl } from '@/lib/bunny-net';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ wwwId: string }> }
) {
  try {
    const { wwwId } = await params;
    const { searchParams } = new URL(request.url);
    const albumType = searchParams.get('albumType') || 'wedding-day';
    const mediaType = searchParams.get('mediaType') || 'photos';

    if (!wwwId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    // Validate album type and media type
    if (!['wedding-day', 'party-day'].includes(albumType)) {
      return NextResponse.json({ error: 'Invalid album type' }, { status: 400 });
    }

    if (!['photos', 'videos'].includes(mediaType)) {
      return NextResponse.json({ error: 'Invalid media type' }, { status: 400 });
    }

    // List files from Bunny.net
    const files = await listFiles(albumType, mediaType, wwwId);
    
    // Generate CDN URLs for each file
    const fileUrls = files.map(fileName => ({
      fileName,
      url: getCdnUrl(fileName, albumType, mediaType, wwwId)
    }));

    return NextResponse.json({
      success: true,
      data: fileUrls,
      count: fileUrls.length
    });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to load gallery files',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}