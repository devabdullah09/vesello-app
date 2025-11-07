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
    const { files, cdnUrls, albumType, mediaType, signature } = body;
    
    const trimmedSignature = signature ? String(signature).trim() : null;
    console.log('Register uploads - signature received:', trimmedSignature || 'none');
    console.log('Register uploads - signature type:', typeof trimmedSignature, 'length:', trimmedSignature?.length);
    console.log('Register uploads - albumType:', albumType);
    console.log('Register uploads - files count:', files?.length);

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
    
    console.log('Album validation:', { albumType, isValidDefaultAlbum, isValidCustomAlbum, wwwId });
    
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
      .select('id, www_id')
      .eq('www_id', wwwId)
      .single();

    if (eventError || !event) {
      console.error('Event not found:', eventError);
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    // event_id in gallery_images is UUID and should be event.id, not www_id
    // The database schema uses UUID for event_id, not TEXT
    const eventIdForGallery = event.id;

    // For custom albums, store in database
    if (isValidCustomAlbum) {
      console.log('Processing custom album:', albumType);
      // Create File objects from the uploaded files metadata
      // We'll need to fetch file metadata from Bunny.net or store it during upload
      // For now, we'll create a simplified version
      const fileRecords = files.map((fileName: string, index: number) => ({
        album_id: albumType, // This should be a UUID for custom albums
        event_id: eventIdForGallery, // Use www_id (TEXT) not UUID
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
          signature: signature || null,
        },
      }));
      
      console.log('Custom album file records:', fileRecords.length);
      console.log('Sample custom album record:', JSON.stringify(fileRecords[0], null, 2));

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
      // For default albums, ALWAYS store in database (even without signature)
      // This ensures we can track all uploads and display signatures when available
      console.log('Processing default album:', albumType);
      const finalSignature = trimmedSignature && trimmedSignature.length > 0 ? trimmedSignature : null;
      
      // ALWAYS store in database, even without signature
      console.log('Storing default album files in database - signature:', finalSignature || 'none', 'type:', typeof finalSignature);
      // For default albums, album_id should be NULL since they don't have a custom album record
      // We'll store the album type in metadata instead
      
      const fileRecords = files.map((fileName: string, index: number) => {
        // Ensure metadata is properly formatted as JSONB
        const metadataObj = {
          uploadedAt: new Date().toISOString(),
          mediaType: mediaType,
          directUpload: true,
          signature: finalSignature,
          albumType: albumType, // Store album type in metadata for querying
        };
        
        // Build record object - for default albums, explicitly set album_id to null
        // The database schema allows NULL for album_id (it's not NOT NULL)
        const record: any = {
          album_id: null, // Explicitly set to null for default albums
          event_id: eventIdForGallery, // Use event.id (UUID) not www_id
          filename: fileName,
          original_filename: fileName,
          file_size: 0,
          mime_type: mediaType === 'photos' ? 'image/jpeg' : 'video/mp4',
          image_url: cdnUrls[index],
          thumbnail_url: cdnUrls[index],
          uploaded_by: null,
          is_approved: true,
          metadata: metadataObj, // Supabase will automatically convert to JSONB
        };
        
        return record;
      });
      
      console.log('File records to insert:', fileRecords.length);
      console.log('Sample file record:', JSON.stringify(fileRecords[0], null, 2));
      console.log('Event ID for gallery:', eventIdForGallery);
      console.log('Album type:', albumType);

      try {
        const { data: insertedRecords, error: insertError } = await serverSupabase
          .from('gallery_images')
          .insert(fileRecords)
          .select();

        if (insertError) {
          console.error('Error inserting default album records:', insertError);
          console.error('Error details:', JSON.stringify(insertError, null, 2));
          console.error('Error code:', insertError.code);
          console.error('Error message:', insertError.message);
          console.error('Error hint:', insertError.hint);
          console.error('Error details object:', insertError.details);
          return NextResponse.json({ 
            error: 'Failed to register uploads', 
            details: insertError.message,
            code: insertError.code,
            hint: insertError.hint,
            fullError: insertError
          }, { status: 500 });
        }
        
        console.log('Successfully inserted records:', insertedRecords?.length);
        console.log('First inserted record:', insertedRecords?.[0]);

        return NextResponse.json({
          success: true,
          message: `${files.length} file(s) registered successfully`,
          records: insertedRecords,
        });
      } catch (insertException) {
        console.error('Exception during insert:', insertException);
        return NextResponse.json({ 
          error: 'Failed to register uploads', 
          details: insertException instanceof Error ? insertException.message : 'Unknown error',
          exception: String(insertException)
        }, { status: 500 });
      }
    }

  } catch (error) {
    console.error('Error registering uploads:', error);
    return NextResponse.json({ 
      error: 'Failed to register uploads', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

