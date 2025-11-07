import { NextRequest, NextResponse } from 'next/server';
import { listFiles, getCdnUrl } from '@/lib/bunny-net';
import { createServerClient } from '@/lib/supabase';

// IMPORTANT: This route MUST return 'data' not 'files' for consistency
// This is the main gallery route: /api/[wwwId]/gallery?albumType=wedding-day&mediaType=photos

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

    // Get event ID from wwwId
    const supabase = createServerClient();
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, www_id')
      .eq('www_id', wwwId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    // event_id in gallery_images is UUID, not TEXT
    // The database schema uses UUID for event_id
    const eventIdForGallery = event.id;
    
    console.log('Querying gallery_images with event_id:', eventIdForGallery, 'wwwId:', wwwId);

    // Check if there are files in database for this album
    // For default albums, album_id is NULL and albumType is stored in metadata
    // Try both UUID (event.id) and TEXT (wwwId) in case records were stored with different event_id types
    console.log('=== GALLERY QUERY START ===');
    console.log('Querying database with event_id (UUID):', eventIdForGallery);
    console.log('wwwId:', wwwId);
    console.log('Looking for albumType:', albumType, 'mediaType:', mediaType);
    
    // First, try to get ALL files for this event with UUID event_id
    let { data: dbFiles, error: dbFilesError } = await supabase
      .from('gallery_images')
      .select('*')
      .eq('event_id', eventIdForGallery) // Use event.id (UUID) not www_id
      .is('album_id', null) // Default albums have NULL album_id
      .order('created_at', { ascending: false });
    
    console.log('First query result - UUID event_id:', {
      count: dbFiles?.length || 0,
      error: dbFilesError,
      sampleFile: dbFiles?.[0] ? {
        id: dbFiles[0].id,
        filename: dbFiles[0].filename,
        event_id: dbFiles[0].event_id,
        event_id_type: typeof dbFiles[0].event_id,
        album_id: dbFiles[0].album_id,
        hasMetadata: !!dbFiles[0].metadata,
        metadata: dbFiles[0].metadata
      } : null
    });
    
    // If no files found with UUID, try with wwwId (TEXT) in case old records exist
    if ((!dbFiles || dbFiles.length === 0) && !dbFilesError) {
      console.log('No files found with UUID event_id, trying with wwwId (TEXT):', wwwId);
      const { data: dbFilesText, error: dbFilesTextError } = await supabase
        .from('gallery_images')
        .select('*')
        .eq('event_id', wwwId) // Try with wwwId (TEXT) for old records
        .is('album_id', null)
        .order('created_at', { ascending: false });
      
      console.log('Second query result - TEXT event_id:', {
        count: dbFilesText?.length || 0,
        error: dbFilesTextError,
        sampleFile: dbFilesText?.[0] ? {
          id: dbFilesText[0].id,
          filename: dbFilesText[0].filename,
          event_id: dbFilesText[0].event_id,
          event_id_type: typeof dbFilesText[0].event_id,
          album_id: dbFilesText[0].album_id,
          hasMetadata: !!dbFilesText[0].metadata
        } : null
      });
      
      if (dbFilesText && dbFilesText.length > 0) {
        dbFiles = dbFilesText;
        dbFilesError = dbFilesTextError;
        console.log('Found files with TEXT event_id:', dbFiles.length);
      }
    }
    
    console.log('Final database query result:', { 
      dbFilesCount: dbFiles?.length || 0, 
      error: dbFilesError,
      sampleFile: dbFiles?.[0] ? {
        id: dbFiles[0].id,
        filename: dbFiles[0].filename,
        event_id: dbFiles[0].event_id,
        event_id_type: typeof dbFiles[0].event_id,
        album_id: dbFiles[0].album_id,
        metadata: dbFiles[0].metadata
      } : null
    });
    console.log('=== GALLERY QUERY END ===');

    let statusMap = new Map<string, { is_hidden: boolean | null; is_published: boolean | null }>();
    try {
      const { data: statusRows, error: statusError } = await supabase
        .from('gallery_image_status')
        .select('file_name, is_hidden, is_published')
        .eq('event_id', eventIdForGallery)
        .eq('album_id', albumType);

      if (!statusError && statusRows) {
        statusMap = new Map();
        statusRows.forEach(status => {
          const baseName = status.file_name?.includes('/')
            ? status.file_name.split('/').pop() || status.file_name
            : status.file_name;
          const value = {
            is_hidden: status.is_hidden,
            is_published: status.is_published
          } as const;
          if (status.file_name) {
            statusMap.set(status.file_name, value);
          }
          if (baseName) {
            statusMap.set(baseName, value);
          }
        });
      } else if (statusError) {
        console.warn('Unable to load gallery_image_status rows:', statusError);
      }
    } catch (statusCatchError) {
      console.warn('Error querying gallery_image_status (table might not exist yet):', statusCatchError);
    }

    // If we have database files, use them (they include signature metadata)
    if (dbFiles && dbFiles.length > 0) {
      console.log('Processing', dbFiles.length, 'database files...');
      const fileUrls = dbFiles
        .filter((file: any) => {
          // Parse metadata if it's a string
          let metadata = file.metadata;
          if (typeof metadata === 'string') {
            try {
              metadata = JSON.parse(metadata);
            } catch (e) {
              console.error('Error parsing metadata string:', e);
              metadata = {};
            }
          }

          // Filter by album type stored in metadata
          // If albumType is not in metadata, don't filter it out - it might be an old record
          const fileAlbumType = metadata?.albumType;
          console.log(`File ${file.filename} - albumType in metadata:`, fileAlbumType, 'requested:', albumType, 'hasMetadata:', !!metadata);

          // Only filter by albumType if it exists in metadata
          // If metadata doesn't have albumType, include ALL files for this event (for backward compatibility)
          if (fileAlbumType) {
            // If albumType exists in metadata, filter by it
            if (fileAlbumType !== albumType) {
              console.log(`Skipping file ${file.filename} - albumType mismatch (${fileAlbumType} !== ${albumType})`);
              return false;
            }
          } else {
            // If no albumType in metadata, include it (might be old record without albumType)
            // But we still need to filter by media type
            console.log(`Including file ${file.filename} - no albumType in metadata (backward compatibility)`);
          }

          // Apply visibility rules from gallery_image_status
          const filename = file.filename as string | undefined;
          const alternateKey = filename?.includes('/') ? filename.split('/').pop() || filename : filename;
          const status = (filename && statusMap.get(filename)) || (alternateKey && statusMap.get(alternateKey));
          if (status) {
            if (status.is_hidden) {
              console.log(`Skipping file ${file.filename} because it is hidden in gallery_image_status.`);
              return false;
            }
            if (status.is_published === false) {
              console.log(`Skipping file ${file.filename} because it is not published in gallery_image_status.`);
              return false;
            }
          }

          const mimeType = file.mime_type || '';
          if (mediaType === 'photos') {
            return mimeType.startsWith('image/');
          } else {
            return mimeType.startsWith('video/');
          }
        })
        .map((file: any) => {
          // Parse metadata if it's a string
          let metadata = file.metadata;
          if (typeof metadata === 'string') {
            try {
              metadata = JSON.parse(metadata);
            } catch (e) {
              console.error('Error parsing metadata string during map:', e);
              metadata = {};
            }
          }
          
          const signature = metadata?.signature ? String(metadata.signature).trim() : null;
          const result = {
            fileName: file.filename,
            url: file.image_url,
            signature: signature && signature.length > 0 ? signature : null,
            uploadedAt: file.created_at
          };
          console.log(`Mapped file ${file.filename} - signature:`, result.signature);
          return result;
        });

      console.log('Returning fileUrls with signatures:', fileUrls.length, 'files');
      if (fileUrls.length > 0) {
        console.log('Sample fileUrl:', JSON.stringify(fileUrls[0], null, 2));
      }

      return NextResponse.json({
        success: true,
        data: fileUrls, // ALWAYS return 'data' not 'files'
        count: fileUrls.length
      });
    }

    // Fallback: List files from Bunny.net (ONLY if no database records exist)
    // This should rarely happen now since we ALWAYS store in database
    console.log('WARNING: No database files found, falling back to Bunny.net...');
    console.log('This should not happen if uploads are being registered correctly.');
    const files = await listFiles(albumType, mediaType, wwwId);
    console.log('Bunny.net files:', files.length, 'files');
    
    // Generate CDN URLs for each file
    const fileUrls = files
      .filter(fileName => {
        const alternateKey = fileName.includes('/') ? fileName.split('/').pop() || fileName : fileName;
        const status = statusMap.get(fileName) || statusMap.get(alternateKey);
        if (status) {
          if (status.is_hidden) {
            console.log(`Skipping Bunny.net file ${fileName} because it is hidden in gallery_image_status.`);
            return false;
          }
          if (status.is_published === false) {
            console.log(`Skipping Bunny.net file ${fileName} because it is not published in gallery_image_status.`);
            return false;
          }
        }
        return true;
      })
      .map(fileName => ({
        fileName: fileName,
        url: getCdnUrl(fileName, albumType, mediaType, wwwId),
        signature: null, // Bunny.net fallback has no signatures
        uploadedAt: null
      }));

    console.log('Returning Bunny.net fallback with fileUrls:', fileUrls.length, 'files');
    if (fileUrls.length > 0) {
      console.log('Sample Bunny.net fileUrl:', JSON.stringify(fileUrls[0], null, 2));
    }

    // ALWAYS return 'data' not 'files' for consistency
    return NextResponse.json({
      success: true,
      data: fileUrls, // ALWAYS return 'data' not 'files'
      count: fileUrls.length
    });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to load gallery files',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}