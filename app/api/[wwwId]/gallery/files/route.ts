import { NextRequest, NextResponse } from 'next/server';
import { listFiles, getCdnUrl } from '@/lib/bunny-net';
import { createServerClient } from '@/lib/supabase';

// GET /api/[wwwId]/gallery/files - DEPRECATED: Use /api/[wwwId]/gallery?albumType=...&mediaType=... instead
// This endpoint is kept for backward compatibility but should query the database
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ wwwId: string }> }
) {
  try {
    const { wwwId } = await params;
    const { searchParams } = new URL(request.url);
    const album = searchParams.get('album') || 'wedding-day';
    const type = searchParams.get('type') || 'photos';
    
    // Convert to new endpoint format and redirect
    // For backward compatibility, try to query database first
    const supabase = createServerClient();
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, www_id')
      .eq('www_id', wwwId)
      .single();

    if (!eventError && event) {
      const eventIdForGallery = event.id;
      const { data: dbFiles } = await supabase
        .from('gallery_images')
        .select('*')
        .eq('event_id', eventIdForGallery)
        .is('album_id', null)
        .order('created_at', { ascending: false });

      if (dbFiles && dbFiles.length > 0) {
        // Parse metadata and filter by album type
        const fileUrls = dbFiles
          .filter((file: any) => {
            let metadata = file.metadata;
            if (typeof metadata === 'string') {
              try {
                metadata = JSON.parse(metadata);
              } catch (e) {
                metadata = {};
              }
            }
            const fileAlbumType = metadata?.albumType;
            if (fileAlbumType && fileAlbumType !== album) {
              return false;
            }
            const mimeType = file.mime_type || '';
            if (type === 'photos') {
              return mimeType.startsWith('image/');
            } else {
              return mimeType.startsWith('video/');
            }
          })
          .map((file: any) => {
            let metadata = file.metadata;
            if (typeof metadata === 'string') {
              try {
                metadata = JSON.parse(metadata);
              } catch (e) {
                metadata = {};
              }
            }
            const signature = metadata?.signature ? String(metadata.signature).trim() : null;
            return {
              name: file.filename,
              url: file.image_url,
              signature: signature && signature.length > 0 ? signature : null,
            };
          });

        if (fileUrls.length > 0) {
          return NextResponse.json({
            success: true,
            files: fileUrls,
            count: fileUrls.length
          });
        }
      }
    }
    
    // Fallback to Bunny.net if no database records
    const files = await listFiles(album, type, wwwId);
    const galleryFiles = files.map(fileName => ({
      name: fileName,
      url: getCdnUrl(fileName, album, type, wwwId),
      cdnUrl: getCdnUrl(fileName, album, type, wwwId),
      signature: null
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
