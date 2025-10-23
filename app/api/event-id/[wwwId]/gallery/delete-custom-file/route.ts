import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { deleteFile } from '@/lib/bunny-net';

// DELETE /api/event-id/[wwwId]/gallery/delete-custom-file - Delete a file from a custom album
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ wwwId: string }> }
) {
  try {
    const { wwwId } = await params;
    const body = await request.json();
    const { fileName, albumId } = body;

    if (!wwwId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    if (!fileName || !albumId) {
      return NextResponse.json({ error: 'File name and album ID are required' }, { status: 400 });
    }

    // Get event ID from wwwId
    const supabase = createServerClient();
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id')
      .eq('www_id', wwwId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Find the file in the database
    const { data: fileRecord, error: fileError } = await supabase
      .from('gallery_images')
      .select('*')
      .eq('album_id', albumId)
      .eq('event_id', event.id)
      .or(`filename.eq.${fileName},original_filename.eq.${fileName}`)
      .single();

    if (fileError || !fileRecord) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Delete from Bunny.net storage
    try {
      await deleteFile(fileRecord.filename, albumId, 'photos', wwwId);
    } catch (bunnyError) {
      console.error('Error deleting from Bunny.net:', bunnyError);
      // Continue with database deletion even if Bunny.net deletion fails
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('gallery_images')
      .delete()
      .eq('id', fileRecord.id);

    if (deleteError) {
      console.error('Error deleting file from database:', deleteError);
      return NextResponse.json({ error: 'Failed to delete file from database' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Error in delete custom file API:', error);
    return NextResponse.json({ 
      error: 'Failed to delete file',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
