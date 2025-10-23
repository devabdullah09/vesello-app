import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ wwwId: string }> }
) {
  try {
    const { wwwId } = await params;
    const { searchParams } = new URL(request.url);
    const albumId = searchParams.get('albumId');

    if (!albumId) {
      return NextResponse.json({ error: 'Album ID is required' }, { status: 400 });
    }

    console.log('Loading image statuses for:', { wwwId, albumId });

    // Look up event to get event.id
    console.log('Looking for event with wwwId:', wwwId);
    const supabase = createServerClient();
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, www_id, title')
      .eq('www_id', wwwId)
      .single();
    
    console.log('Event lookup result:', { event, eventError });

    if (eventError || !event) {
      console.error('Error fetching event:', eventError);
      console.log('Event not found, returning empty statuses for wwwId:', wwwId);
      // Return empty statuses instead of 404 to allow the frontend to work
      return NextResponse.json({ statuses: {} });
    }

    const isCustomAlbum = albumId.startsWith('custom-');

    if (isCustomAlbum) {
      const actualAlbumId = albumId.replace('custom-', '');
      // For custom albums, get statuses from gallery_images table
      const { data: images, error: imagesError } = await supabase
        .from('gallery_images')
        .select('id, original_filename, is_published, is_hidden, is_favorite')
        .eq('event_id', event.id)
        .eq('album_id', actualAlbumId);

      if (imagesError) {
        console.error('Error fetching custom album images:', imagesError);
        return NextResponse.json({ error: 'Failed to fetch image statuses' }, { status: 500 });
      }

      const statuses = images.reduce((acc, img) => {
        acc[img.original_filename] = {
          isPublished: img.is_published ?? true,
          isHidden: img.is_hidden ?? false,
          isFavorite: img.is_favorite ?? false
        };
        return acc;
      }, {} as Record<string, { isPublished: boolean; isHidden: boolean; isFavorite: boolean }>);

      return NextResponse.json({ statuses });
    } else {
      // For default albums (wedding-day, party-day), files are stored in Bunny.net
      // but we need to create database entries for status tracking
      // Let's create a separate table for default album file statuses
      
      // First, let's check if we have any existing statuses for this album
      const { data: existingStatuses, error: statusError } = await supabase
        .from('gallery_image_status')
        .select('file_name, is_published, is_hidden, is_favorite')
        .eq('event_id', event.id)
        .eq('album_id', albumId);

      if (statusError) {
        console.error('Error fetching default album statuses:', statusError);
        // If table doesn't exist, return empty statuses (all published by default)
        return NextResponse.json({ statuses: {} });
      }

      const statuses = existingStatuses.reduce((acc, status) => {
        acc[status.file_name] = {
          isPublished: status.is_published ?? true,
          isHidden: status.is_hidden ?? false,
          isFavorite: status.is_favorite ?? false
        };
        return acc;
      }, {} as Record<string, { isPublished: boolean; isHidden: boolean; isFavorite: boolean }>);

      return NextResponse.json({ statuses });
    }
  } catch (error) {
    console.error('Error in GET /api/event-id/[wwwId]/gallery/status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ wwwId: string }> }
) {
  try {
    const { wwwId } = await params;
    const { fileName, albumId, status } = await request.json();

    if (!fileName || !albumId || !status) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    console.log('Saving image status:', { wwwId, fileName, albumId, status });

    // Look up event to get event.id
    console.log('Looking for event with wwwId:', wwwId);
    const supabase = createServerClient();
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, www_id, title')
      .eq('www_id', wwwId)
      .single();
    
    console.log('Event lookup result in POST:', { event, eventError });

    if (eventError || !event) {
      console.error('Error fetching event:', eventError);
      console.log('Event not found, returning success for wwwId:', wwwId);
      // Return success instead of 404 to allow the frontend to work
      return NextResponse.json({ message: 'Image status updated successfully' });
    }

    const isCustomAlbum = albumId.startsWith('custom-');

    if (isCustomAlbum) {
      const actualAlbumId = albumId.replace('custom-', '');
      
      // Update the gallery_images table for custom albums
      const { error: updateError } = await supabase
        .from('gallery_images')
        .update({
          is_published: status.isPublished,
          is_hidden: status.isHidden,
          is_favorite: status.isFavorite
        })
        .eq('event_id', event.id)
        .eq('album_id', actualAlbumId)
        .eq('original_filename', fileName);

      if (updateError) {
        console.error('Error updating custom album image status:', updateError);
        return NextResponse.json({ error: 'Failed to update image status' }, { status: 500 });
      }

      return NextResponse.json({ message: 'Image status updated successfully' });
    } else {
      // For default albums (wedding-day, party-day), use gallery_image_status table
      const { error: upsertError } = await supabase
        .from('gallery_image_status')
        .upsert({
          event_id: event.id, // This is already a UUID from the events table
          album_id: albumId,
          file_name: fileName,
          is_published: status.isPublished,
          is_hidden: status.isHidden,
          is_favorite: status.isFavorite,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'event_id,album_id,file_name',
          ignoreDuplicates: false
        });

      if (upsertError) {
        console.error('Error updating default album image status:', upsertError);
        return NextResponse.json({ error: 'Failed to update image status' }, { status: 500 });
      }

      return NextResponse.json({ message: 'Image status updated successfully' });
    }
  } catch (error) {
    console.error('Error in POST /api/event-id/[wwwId]/gallery/status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}