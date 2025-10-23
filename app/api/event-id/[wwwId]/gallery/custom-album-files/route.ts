import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// GET /api/event-id/[wwwId]/gallery/custom-album-files - Get files for a custom album
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ wwwId: string }> }
) {
  try {
    const { wwwId } = await params;
    const { searchParams } = new URL(request.url);
    const albumId = searchParams.get('albumId');

    if (!wwwId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    if (!albumId) {
      return NextResponse.json({ error: 'Album ID is required' }, { status: 400 });
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

    // Get files for the custom album
    const { data: files, error: filesError } = await supabase
      .from('gallery_images')
      .select('*')
      .eq('album_id', albumId)
      .eq('event_id', event.id)
      .order('created_at', { ascending: false });

    if (filesError) {
      console.error('Error fetching custom album files:', filesError);
      return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
    }

    console.log('Fetched custom album files:', files);
    console.log('Files count:', files?.length || 0);

    return NextResponse.json({
      success: true,
      files: files || [],
      count: files?.length || 0
    });

  } catch (error) {
    console.error('Error in custom album files API:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch custom album files',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
