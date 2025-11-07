import { NextRequest, NextResponse } from 'next/server';
import { deleteFile } from '@/lib/bunny-net';
import { createServerClient } from '@/lib/supabase';

// DELETE /api/[wwwId]/gallery/delete - Delete files from event-specific gallery
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ wwwId: string }> }
) {
  try {
    const { wwwId } = await params;
    const { fileName, album, type } = await request.json();
    
    if (!fileName || !album || !type) {
      return NextResponse.json(
        { success: false, message: 'fileName, album, and type are required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id')
      .eq('www_id', wwwId)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { success: false, message: 'Event not found' },
        { status: 404 }
      );
    }

    const eventId = event.id;
    const baseFileName = fileName.includes('/') ? fileName.split('/').pop() || fileName : fileName;

    // Remove gallery status (default albums)
    try {
      await supabase
        .from('gallery_image_status')
        .delete()
        .eq('event_id', eventId)
        .eq('album_id', album)
        .in('file_name', [fileName, baseFileName]);
    } catch (statusError) {
      console.warn('Failed to delete gallery_image_status entry:', statusError);
    }

    // Remove record from gallery_images
    const galleryDeleteQuery = supabase
      .from('gallery_images')
      .delete()
      .eq('event_id', eventId);

    const filenameConditions = [fileName, baseFileName]
      .filter(Boolean)
      .map((name) => name.replace(/,/g, ''));

    if (filenameConditions.length > 0) {
      const quoted = filenameConditions.map((name) => `"${name.replace(/"/g, '')}"`);
      const valueList = quoted.join(',');
      galleryDeleteQuery.or(`filename.in.(${valueList}),original_filename.in.(${valueList})`);
    }

    if (album.startsWith('custom-')) {
      galleryDeleteQuery.eq('album_id', album.replace('custom-', ''));
    } else {
      galleryDeleteQuery.is('album_id', null);
    }

    const { error: galleryDeleteError } = await galleryDeleteQuery;
    if (galleryDeleteError) {
      console.error('Failed to remove gallery_images record:', galleryDeleteError);
      return NextResponse.json(
        { success: false, message: 'Failed to remove gallery record', details: galleryDeleteError.message },
        { status: 500 }
      );
    }
    
    const deleted = await deleteFile(baseFileName, album, type, wwwId);
    
    if (deleted) {
      return NextResponse.json({
        success: true,
        message: 'File deleted successfully'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'File record removed, but file was not found on storage'
    }, { status: 200 });
    
  } catch (error) {
    console.error('Failed to delete gallery file:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
