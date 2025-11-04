import { NextRequest, NextResponse } from 'next/server';
import { storeCustomAlbumFiles } from '@/lib/gallery-service';
import { createServerClient } from '@/lib/supabase';

/**
 * Register files that were uploaded directly to Bunny.net
 * This endpoint saves the file metadata to the database
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ wwwId: string }> }
) {
  try {
    const { wwwId } = await params;
    const body = await request.json();
    const { files, cdnUrls, albumType, mediaType } = body;

    if (!wwwId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    if (!cdnUrls || !Array.isArray(cdnUrls) || cdnUrls.length !== files.length) {
      return NextResponse.json({ error: 'CDN URLs must match files count' }, { status: 400 });
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

    // Get event ID from wwwId
    const serverSupabase = createServerClient();
    const { data: event, error: eventError } = await serverSupabase
      .from('events')
      .select('id')
      .eq('www_id', wwwId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // For custom albums, store in database
    if (isValidCustomAlbum) {
      // Create File objects from the uploaded files metadata
      // We'll need to fetch file metadata from Bunny.net or store it during upload
      // For now, we'll create a simplified version
      const fileRecords = files.map((fileName: string, index: number) => ({
        album_id: albumType,
        event_id: event.id,
        filename: fileName,
        original_filename: fileName, // We don't have the original name, use filename
        file_size: 0, // We'll need to get this from Bunny.net or store it
        mime_type: mediaType === 'photos' ? 'image/jpeg' : 'video/mp4', // Default, should be stored
        image_url: cdnUrls[index],
        thumbnail_url: cdnUrls[index],
        uploaded_by: null,
        is_approved: true,
        metadata: {
          uploadedAt: new Date().toISOString(),
          mediaType: mediaType,
          directUpload: true,
        },
      }));

      const { data: insertedRecords, error: insertError } = await serverSupabase
        .from('gallery_images')
        .insert(fileRecords)
        .select();

      if (insertError) {
        console.error('Error inserting records:', insertError);
        return NextResponse.json({ 
          error: 'Failed to register uploads', 
          details: insertError.message 
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `${files.length} file(s) registered successfully`,
        records: insertedRecords,
      });
    } else {
      // For default albums, we might not need to store in database
      // But if you want to track them, you can add logic here
      return NextResponse.json({
        success: true,
        message: `${files.length} file(s) uploaded successfully (default album)`,
      });
    }

  } catch (error) {
    console.error('Error registering uploads:', error);
    return NextResponse.json({ 
      error: 'Failed to register uploads', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

