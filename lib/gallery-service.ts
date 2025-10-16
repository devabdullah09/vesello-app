import { supabase } from './supabase'
import { createServerClient } from './supabase'
import { 
  GalleryAlbum, 
  CreateGalleryAlbumData, 
  GalleryImage, 
  UploadImageData, 
  GalleryFilters,
  PaginatedResponse 
} from './dashboard-types'

// Gallery Albums

// Create a new gallery album
export const createGalleryAlbum = async (albumData: CreateGalleryAlbumData): Promise<GalleryAlbum> => {
  try {
    // Use server client to bypass RLS policies
    const serverSupabase = createServerClient()
    
    const { data, error } = await serverSupabase
      .from('gallery_albums')
      .insert([{
        event_id: albumData.eventId,
        name: albumData.name,
        description: albumData.description,
        cover_image_url: albumData.coverImageUrl,
        is_public: albumData.isPublic ?? true
      }])
      .select()
      .single()

    if (error) throw error

    return mapAlbumFromDB(data)
  } catch (error) {
    console.error('Error creating gallery album:', error)
    throw error
  }
}

// Get all albums for an event
export const getEventAlbums = async (eventId: string): Promise<GalleryAlbum[]> => {
  try {
    console.log('getEventAlbums called with eventId:', eventId);
    const { data, error } = await supabase
      .from('gallery_albums')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })

    console.log('Database query result:', { data, error });

    if (error) throw error

    const mappedData = data.map(mapAlbumFromDB);
    console.log('Mapped albums:', mappedData);
    return mappedData;
  } catch (error) {
    console.error('Error getting event albums:', error)
    throw error
  }
}

// Get album by ID
export const getAlbumById = async (albumId: string): Promise<GalleryAlbum | null> => {
  try {
    const { data, error } = await supabase
      .from('gallery_albums')
      .select('*')
      .eq('id', albumId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw error
    }

    return mapAlbumFromDB(data)
  } catch (error) {
    console.error('Error getting album by ID:', error)
    throw error
  }
}

// Update album
export const updateAlbum = async (albumId: string, updateData: Partial<CreateGalleryAlbumData>): Promise<GalleryAlbum> => {
  try {
    const { data, error } = await supabase
      .from('gallery_albums')
      .update({
        name: updateData.name,
        description: updateData.description,
        cover_image_url: updateData.coverImageUrl,
        is_public: updateData.isPublic
      })
      .eq('id', albumId)
      .select()
      .single()

    if (error) throw error

    return mapAlbumFromDB(data)
  } catch (error) {
    console.error('Error updating album:', error)
    throw error
  }
}

// Delete album
export const deleteAlbum = async (albumId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('gallery_albums')
      .delete()
      .eq('id', albumId)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting album:', error)
    throw error
  }
}

// Gallery Images

// Upload/add image to album
export const uploadImage = async (imageData: UploadImageData, uploadedBy?: string): Promise<GalleryImage> => {
  try {
    const { data, error } = await supabase
      .from('gallery_images')
      .insert([{
        album_id: imageData.albumId,
        event_id: imageData.eventId,
        filename: imageData.filename,
        original_filename: imageData.originalFilename,
        file_size: imageData.fileSize,
        mime_type: imageData.mimeType,
        image_url: imageData.imageUrl,
        thumbnail_url: imageData.thumbnailUrl,
        uploaded_by: uploadedBy,
        is_approved: false, // Default to false, require approval
        metadata: imageData.metadata ?? {}
      }])
      .select()
      .single()

    if (error) throw error

    return mapImageFromDB(data)
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}

// Get images for an album
export const getAlbumImages = async (albumId: string, filters?: GalleryFilters): Promise<GalleryImage[]> => {
  try {
    let query = supabase
      .from('gallery_images')
      .select('*')
      .eq('album_id', albumId)
      .order('created_at', { ascending: false })

    if (filters) {
      if (filters.isApproved !== undefined) {
        query = query.eq('is_approved', filters.isApproved)
      }
      if (filters.uploadedBy) {
        query = query.eq('uploaded_by', filters.uploadedBy)
      }
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom)
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo)
      }
    }

    const { data, error } = await query

    if (error) throw error

    return data.map(mapImageFromDB)
  } catch (error) {
    console.error('Error getting album images:', error)
    throw error
  }
}

// Get images for an event
export const getEventImages = async (eventId: string, filters?: GalleryFilters): Promise<GalleryImage[]> => {
  try {
    let query = supabase
      .from('gallery_images')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })

    if (filters) {
      if (filters.albumId) {
        query = query.eq('album_id', filters.albumId)
      }
      if (filters.isApproved !== undefined) {
        query = query.eq('is_approved', filters.isApproved)
      }
      if (filters.uploadedBy) {
        query = query.eq('uploaded_by', filters.uploadedBy)
      }
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom)
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo)
      }
    }

    const { data, error } = await query

    if (error) throw error

    return data.map(mapImageFromDB)
  } catch (error) {
    console.error('Error getting event images:', error)
    throw error
  }
}

// Get image by ID
export const getImageById = async (imageId: string): Promise<GalleryImage | null> => {
  try {
    const { data, error } = await supabase
      .from('gallery_images')
      .select('*')
      .eq('id', imageId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw error
    }

    return mapImageFromDB(data)
  } catch (error) {
    console.error('Error getting image by ID:', error)
    throw error
  }
}

// Update image
export const updateImage = async (imageId: string, updateData: Partial<UploadImageData>): Promise<GalleryImage> => {
  try {
    const { data, error } = await supabase
      .from('gallery_images')
      .update({
        filename: updateData.filename,
        original_filename: updateData.originalFilename,
        file_size: updateData.fileSize,
        mime_type: updateData.mimeType,
        image_url: updateData.imageUrl,
        thumbnail_url: updateData.thumbnailUrl,
        metadata: updateData.metadata
      })
      .eq('id', imageId)
      .select()
      .single()

    if (error) throw error

    return mapImageFromDB(data)
  } catch (error) {
    console.error('Error updating image:', error)
    throw error
  }
}

// Approve/reject image
export const updateImageApproval = async (imageId: string, isApproved: boolean): Promise<GalleryImage> => {
  try {
    const { data, error } = await supabase
      .from('gallery_images')
      .update({ is_approved: isApproved })
      .eq('id', imageId)
      .select()
      .single()

    if (error) throw error

    return mapImageFromDB(data)
  } catch (error) {
    console.error('Error updating image approval:', error)
    throw error
  }
}

// Delete image
export const deleteImage = async (imageId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('gallery_images')
      .delete()
      .eq('id', imageId)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting image:', error)
    throw error
  }
}

// Get images with pagination
export const getImagesPaginated = async (
  eventId: string,
  page: number = 1,
  limit: number = 20,
  filters?: GalleryFilters
): Promise<PaginatedResponse<GalleryImage>> => {
  try {
    const offset = (page - 1) * limit

    let query = supabase
      .from('gallery_images')
      .select('*', { count: 'exact' })
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (filters) {
      if (filters.albumId) {
        query = query.eq('album_id', filters.albumId)
      }
      if (filters.isApproved !== undefined) {
        query = query.eq('is_approved', filters.isApproved)
      }
      if (filters.uploadedBy) {
        query = query.eq('uploaded_by', filters.uploadedBy)
      }
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom)
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo)
      }
    }

    const { data, error, count } = await query

    if (error) throw error

    return {
      data: data.map(mapImageFromDB),
      total: count || 0,
      page,
      limit,
      hasMore: (count || 0) > offset + limit
    }
  } catch (error) {
    console.error('Error getting paginated images:', error)
    throw error
  }
}

// Get gallery statistics for an event
export const getGalleryStats = async (eventId: string) => {
  try {
    // Get total images
    const { count: totalImages } = await supabase
      .from('gallery_images')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)

    // Get approved images
    const { count: approvedImages } = await supabase
      .from('gallery_images')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('is_approved', true)

    // Get pending images
    const { count: pendingImages } = await supabase
      .from('gallery_images')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('is_approved', false)

    // Get total albums
    const { count: totalAlbums } = await supabase
      .from('gallery_albums')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)

    return {
      totalImages: totalImages || 0,
      approvedImages: approvedImages || 0,
      pendingImages: pendingImages || 0,
      totalAlbums: totalAlbums || 0
    }
  } catch (error) {
    console.error('Error getting gallery stats:', error)
    throw error
  }
}

// Helper functions to map database objects to our types
const mapAlbumFromDB = (dbAlbum: any): GalleryAlbum => ({
  id: dbAlbum.id,
  eventId: dbAlbum.event_id,
  name: dbAlbum.name,
  description: dbAlbum.description,
  coverImageUrl: dbAlbum.cover_image_url,
  isPublic: dbAlbum.is_public,
  createdAt: dbAlbum.created_at,
  updatedAt: dbAlbum.updated_at
})

const mapImageFromDB = (dbImage: any): GalleryImage => ({
  id: dbImage.id,
  albumId: dbImage.album_id,
  eventId: dbImage.event_id,
  filename: dbImage.filename,
  originalFilename: dbImage.original_filename,
  fileSize: dbImage.file_size,
  mimeType: dbImage.mime_type,
  imageUrl: dbImage.image_url,
  thumbnailUrl: dbImage.thumbnail_url,
  uploadedBy: dbImage.uploaded_by,
  isApproved: dbImage.is_approved,
  metadata: dbImage.metadata,
  createdAt: dbImage.created_at
})
