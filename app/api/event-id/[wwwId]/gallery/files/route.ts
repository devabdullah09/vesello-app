import { NextRequest, NextResponse } from 'next/server';
import { listFiles, getCdnUrl } from '@/lib/bunny-net';

// GET /api/event-id/[wwwId]/gallery/files - Get gallery files for specific event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ wwwId: string }> }
) {
  try {
    const { wwwId } = await params;
    const { searchParams } = new URL(request.url);
    const album = searchParams.get('album') || 'wedding-day';
    const type = searchParams.get('type') || 'photos';
    
    const files = await listFiles(album, type, wwwId);
    
    const galleryFiles = files.map(fileName => ({
      name: fileName,
      url: getCdnUrl(fileName, album, type, wwwId),
      cdnUrl: getCdnUrl(fileName, album, type, wwwId)
    }));
    
    return NextResponse.json({
      success: true,
      files: galleryFiles,
      count: galleryFiles.length
    });
    
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch gallery files' },
      { status: 500 }
    );
  }
}
