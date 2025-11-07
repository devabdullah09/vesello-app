import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { DefaultAlbumKey, updateDefaultAlbumSettings, softDeleteDefaultAlbum } from '@/lib/gallery-service'

const DEFAULT_ALBUM_SQL_INSTRUCTIONS = `Please create the gallery_default_album_settings table in Supabase:

CREATE TABLE IF NOT EXISTS gallery_default_album_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  album_type TEXT NOT NULL,
  custom_name TEXT,
  description TEXT,
  cover_image_url TEXT,
  is_hidden BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, album_type)
);

CREATE INDEX IF NOT EXISTS idx_gallery_default_album_settings_event_id ON gallery_default_album_settings(event_id);

-- Optionally add RLS policies similar to gallery_albums if you use RLS.`

// PUT /api/dashboard/gallery/albums/[id] - Update an album
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = createServerClient();
    const isDefaultAlbum = id === 'wedding-day' || id === 'party-day';
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, coverImageUrl, isHidden, isDeleted, eventId } = body;

    if (isDefaultAlbum) {
      if (!eventId) {
        return NextResponse.json({ error: 'eventId is required for default albums' }, { status: 400 });
      }

      try {
        const updatedAlbum = await updateDefaultAlbumSettings(eventId, id as DefaultAlbumKey, {
          name,
          description,
          coverImageUrl,
          isHidden,
          isDeleted
        });

        return NextResponse.json({
          success: true,
          data: updatedAlbum
        });
      } catch (error) {
        if (error instanceof Error && error.name === 'MissingDefaultAlbumTableError') {
          return NextResponse.json(
            {
              error: 'Default album settings table is missing',
              instructions: DEFAULT_ALBUM_SQL_INSTRUCTIONS
            },
            { status: 500 }
          );
        }
        console.error('Error updating default album settings:', error);
        return NextResponse.json({ error: 'Failed to update default album settings' }, { status: 500 });
      }
    }

    // Build update object
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (name !== undefined) {
      if (!name || name.trim().length === 0) {
        return NextResponse.json({ error: 'Album name is required' }, { status: 400 });
      }
      updateData.name = name.trim();
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    if (coverImageUrl !== undefined) {
      updateData.cover_image_url = coverImageUrl;
    }

    if (isHidden !== undefined) {
      updateData.is_public = !isHidden;
    }

    if (isDeleted !== undefined) {
      // Treat delete flag same as hidden for custom albums
      updateData.is_public = !isDeleted;
    }

    // Update the album
    const { data, error } = await supabase
      .from('gallery_albums')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating album:', error);
      return NextResponse.json({ error: 'Failed to update album' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        eventId: data.event_id,
        name: data.name,
        description: data.description,
        coverImageUrl: data.cover_image_url,
        isPublic: data.is_public,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }
    });
  } catch (error) {
    console.error('Error in PUT /api/dashboard/gallery/albums/[id]:', error);
    return NextResponse.json({ error: 'Failed to update album' }, { status: 500 });
  }
}

// DELETE /api/dashboard/gallery/albums/[id] - Delete an album
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = createServerClient();
    const isDefaultAlbum = id === 'wedding-day' || id === 'party-day';
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (isDefaultAlbum) {
      const body = await request.json().catch(() => ({}));
      const { eventId } = body || {};

      if (!eventId) {
        return NextResponse.json({ error: 'eventId is required to delete default albums' }, { status: 400 });
      }

      try {
        const deletedAlbum = await softDeleteDefaultAlbum(eventId, id as DefaultAlbumKey);
        return NextResponse.json({
          success: true,
          data: deletedAlbum,
          message: 'Album hidden from guests'
        });
      } catch (error) {
        if (error instanceof Error && error.name === 'MissingDefaultAlbumTableError') {
          return NextResponse.json(
            {
              error: 'Default album settings table is missing',
              instructions: DEFAULT_ALBUM_SQL_INSTRUCTIONS
            },
            { status: 500 }
          );
        }
        console.error('Error deleting default album:', error);
        return NextResponse.json({ error: 'Failed to delete default album' }, { status: 500 });
      }
    }

    // Delete custom album (this will cascade delete associated images due to foreign key constraint)
    const { error } = await supabase
      .from('gallery_albums')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting album:', error);
      return NextResponse.json({ error: 'Failed to delete album' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Album deleted successfully'
    });
  } catch (error) {
    console.error('Error in DELETE /api/dashboard/gallery/albums/[id]:', error);
    return NextResponse.json({ error: 'Failed to delete album' }, { status: 500 });
  }
}
