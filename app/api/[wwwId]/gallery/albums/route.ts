import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getEventAlbums } from '@/lib/gallery-service'

// GET /api/[wwwId]/gallery/albums - Get albums for an event (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ wwwId: string }> }
) {
  try {
    const { wwwId } = await params;
    
    // Get event details first to get the database ID
    const supabase = createServerClient()
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id')
      .eq('www_id', wwwId)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Get albums for this event
    const albums = await getEventAlbums(event.id)
    const defaultAlbumStates = albums
      .filter(album => album.albumType === 'default')
      .map(album => ({
        key: album.defaultKey || album.id,
        name: album.name,
        isHidden: Boolean(album.isHidden),
        isDeleted: Boolean(album.isDeleted),
        tableMissing: Boolean(album.tableMissing)
      }))

    const publicAlbums = albums.filter(album => {
      if (album.albumType === 'default') {
        return !album.isHidden && !album.isDeleted
      }
      return album.isPublic !== false
    })

    return NextResponse.json({
      success: true,
      data: publicAlbums,
      meta: {
        defaultAlbums: defaultAlbumStates
      }
    })
  } catch (error) {
    console.error('Error getting albums:', error)
    return NextResponse.json(
      { error: 'Failed to get albums' },
      { status: 500 }
    )
  }
}
