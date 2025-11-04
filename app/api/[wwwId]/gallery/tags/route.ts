import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Fetch existing tags for an event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ wwwId: string }> }
) {
  try {
    const { wwwId } = await params;

    // Get all unique tags for this event (both custom and default albums)
    // First, get the event ID from wwwId
    console.log('Tags API - Looking for event with wwwId:', wwwId);
    
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, www_id, title')
      .eq('www_id', wwwId)
      .single();

    console.log('Event lookup result:', { event, eventError });

    if (eventError || !event) {
      console.error('Error fetching event:', eventError);
      // Fallback: try to get tags using wwwId directly (for backward compatibility)
      console.log('Falling back to wwwId-based tag lookup');
      const { data: tags, error } = await supabase
        .from('gallery_image_tags')
        .select('tag')
        .eq('event_id', wwwId)  // Try wwwId directly
        .not('tag', 'is', null);

      if (error) {
        console.error('Error fetching tags with fallback:', error);
        return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
      }

      const uniqueTags = [...new Set(tags?.map(t => t.tag) || [])];
      return NextResponse.json({ tags: uniqueTags });
    }

    const { data: tags, error } = await supabase
      .from('gallery_image_tags')
      .select('tag')
      .eq('event_id', event.id)  // Use event.id instead of wwwId
      .not('tag', 'is', null);

    if (error) {
      console.error('Error fetching tags:', error);
      return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
    }

    // Extract unique tags
    const uniqueTags = [...new Set(tags?.map(t => t.tag) || [])];

    return NextResponse.json({ tags: uniqueTags });
  } catch (error) {
    console.error('Error in GET /api/[wwwId]/gallery/tags:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Add tags to selected files
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ wwwId: string }> }
) {
  try {
    const { wwwId } = await params;
    const { fileNames, tags, albumId } = await request.json();

    if (!fileNames || !tags || !Array.isArray(fileNames) || !Array.isArray(tags)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    console.log('Tags API - Received data:', { fileNames, tags, albumId, wwwId });

    // Check if this is a custom album (has UUID format or starts with 'custom-')
    const isCustomAlbum = albumId && (
      albumId.startsWith('custom-') || 
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(albumId)
    );

    if (isCustomAlbum) {
      // For custom albums, files are stored in gallery_images table
      const actualAlbumId = albumId.startsWith('custom-') ? albumId.replace('custom-', '') : albumId;
      
      // First, get the event ID from wwwId (same as custom-album-files API)
      console.log('Tags API POST - Looking for event with wwwId:', wwwId);
      
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('id, www_id, title')
        .eq('www_id', wwwId)
        .single();

      console.log('Event lookup result in POST:', { event, eventError });

      if (eventError || !event) {
        console.error('Error fetching event:', eventError);
        // Fallback: use wwwId directly as event_id
        console.log('Falling back to wwwId as event_id for custom album');
        
        const { data: files, error: filesError } = await supabase
          .from('gallery_images')
          .select('id, original_filename')
          .eq('event_id', wwwId)  // Use wwwId directly
          .eq('album_id', actualAlbumId)
          .in('original_filename', fileNames);

        if (filesError) {
          console.error('Error fetching files from gallery_images with fallback:', filesError);
          return NextResponse.json({ error: 'Failed to find files in custom album' }, { status: 500 });
        }

        if (files.length === 0) {
          return NextResponse.json({ error: 'No files found in custom album' }, { status: 404 });
        }

        // Prepare tag entries for batch insert
        const tagEntries = [];
        for (const file of files) {
          for (const tag of tags) {
            tagEntries.push({
              image_id: file.id,
              event_id: wwwId,  // Use wwwId directly
              tag: tag.trim(),
              created_at: new Date().toISOString()
            });
          }
        }

        // Insert tags in batch using upsert to handle duplicates
        const { error: insertError } = await supabase
          .from('gallery_image_tags')
          .upsert(tagEntries, {
            onConflict: 'image_id,tag',
            ignoreDuplicates: true
          });

        if (insertError) {
          console.error('Error inserting tags with fallback:', insertError);
          return NextResponse.json({ error: 'Failed to add tags' }, { status: 500 });
        }

        return NextResponse.json({ 
          message: `Successfully added ${tags.length} tag(s) to ${files.length} file(s) in custom album` 
        });
      }
      
      const { data: files, error: filesError } = await supabase
        .from('gallery_images')
        .select('id, original_filename')
        .eq('event_id', event.id)  // Use event.id instead of wwwId
        .eq('album_id', actualAlbumId)
        .in('original_filename', fileNames);

      if (filesError) {
        console.error('Error fetching files from gallery_images:', filesError);
        return NextResponse.json({ error: 'Failed to find files in custom album' }, { status: 500 });
      }

      if (files.length === 0) {
        return NextResponse.json({ error: 'No files found in custom album' }, { status: 404 });
      }

      // Prepare tag entries for batch insert
      const tagEntries = [];
        for (const file of files) {
          for (const tag of tags) {
            tagEntries.push({
              image_id: file.id,
              event_id: event.id,  // Use event.id instead of wwwId
              tag: tag.trim(),
              created_at: new Date().toISOString()
            });
          }
        }

      // Insert tags in batch using upsert to handle duplicates
      const { error: insertError } = await supabase
        .from('gallery_image_tags')
        .upsert(tagEntries, {
          onConflict: 'image_id,tag',
          ignoreDuplicates: true
        });

      if (insertError) {
        console.error('Error inserting tags:', insertError);
        return NextResponse.json({ error: 'Failed to add tags' }, { status: 500 });
      }

      return NextResponse.json({ 
        message: `Successfully added ${tags.length} tag(s) to ${files.length} file(s) in custom album` 
      });
    } else {
      // For default albums (wedding-day, party-day), files are stored in Bunny.net
      // We need to create entries in gallery_images table first, or use a different approach
      
      // First, get the event ID from wwwId
      console.log('Tags API POST (default album) - Looking for event with wwwId:', wwwId);
      
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('id, www_id, title')
        .eq('www_id', wwwId)
        .single();

      console.log('Event lookup result in POST (default album):', { event, eventError });

      if (eventError || !event) {
        console.error('Error fetching event:', eventError);
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }
      
      // For now, let's create a simple file-based tagging system
      // We'll store tags with file names and album info
      const tagEntries = [];
      for (const fileName of fileNames) {
        for (const tag of tags) {
          tagEntries.push({
            event_id: event.id,  // Use event.id instead of wwwId
            album_id: albumId,
            file_name: fileName,
            tag: tag.trim(),
            created_at: new Date().toISOString()
          });
        }
      }

    // For default albums, we'll use a different table structure
    // Let's create entries in a file_tags table or use the existing structure differently
    const { error: insertError } = await supabase
      .from('gallery_image_tags')
      .upsert(tagEntries.map(entry => ({
        event_id: entry.event_id,
        tag: entry.tag,
        file_name: entry.file_name,
        album_id: entry.album_id,
        created_at: entry.created_at
      })), {
        onConflict: 'event_id,album_id,file_name,tag',
        ignoreDuplicates: true
      });

    if (insertError) {
      console.error('Error inserting tags for default album:', insertError);
      return NextResponse.json({ error: 'Failed to add tags to default album' }, { status: 500 });
    }

      return NextResponse.json({ 
        message: `Successfully added ${tags.length} tag(s) to ${fileNames.length} file(s) in default album` 
      });
    }
  } catch (error) {
    console.error('Error in POST /api/[wwwId]/gallery/tags:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove tags from files
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ wwwId: string }> }
) {
  try {
    const { wwwId } = await params;
    const { fileNames, tags } = await request.json();

    if (!fileNames || !tags || !Array.isArray(fileNames) || !Array.isArray(tags)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    // Get the file IDs for the selected files
    const { data: files, error: filesError } = await supabase
      .from('gallery_images')
      .select('id')
      .eq('www_id', wwwId)
      .in('original_filename', fileNames);

    if (filesError) {
      console.error('Error fetching files:', filesError);
      return NextResponse.json({ error: 'Failed to find files' }, { status: 500 });
    }

    const fileIds = files.map(f => f.id);

    // Delete the specified tags for these files
    const { error: deleteError } = await supabase
      .from('gallery_image_tags')
      .delete()
      .eq('www_id', wwwId)
      .in('image_id', fileIds)
      .in('tag', tags);

    if (deleteError) {
      console.error('Error deleting tags:', deleteError);
      return NextResponse.json({ error: 'Failed to remove tags' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: `Successfully removed ${tags.length} tag(s) from ${files.length} file(s)` 
    });
  } catch (error) {
    console.error('Error in DELETE /api/[wwwId]/gallery/tags:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
