import type { SupabaseClient } from '@supabase/supabase-js'
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
import { uploadFiles, getCdnUrl } from './bunny-net'

const DEFAULT_ALBUM_TABLE = 'gallery_default_album_settings'

export const DEFAULT_ALBUM_DEFINITIONS = [
  {
    key: 'wedding-day',
    defaultName: 'Wedding Day',
    defaultDescription: 'Wedding ceremony photos'
  },
  {
    key: 'party-day',
    defaultName: 'Party Day',
    defaultDescription: 'Party and celebration photos'
  }
] as const

export type DefaultAlbumKey = typeof DEFAULT_ALBUM_DEFINITIONS[number]['key']

interface DefaultAlbumSettingRow {
  id?: string
  event_id: string
  album_type: string
  custom_name?: string | null
  description?: string | null
  cover_image_url?: string | null
  is_hidden?: boolean | null
  is_deleted?: boolean | null
  created_at?: string | null
  updated_at?: string | null
}

const isMissingDefaultAlbumTable = (error: any) => {
  const message = error?.message || error?.toString?.();
  if (typeof message !== 'string') {
    return false;
  }
  return (
    message.includes(`relation "${DEFAULT_ALBUM_TABLE}" does not exist`) ||
    message.includes(`Could not find the table 'public.${DEFAULT_ALBUM_TABLE}'`) ||
    message.includes(DEFAULT_ALBUM_TABLE)
  );
}

const throwMissingDefaultAlbumTableError = () => {
  const customError = new Error('MISSING_DEFAULT_ALBUM_TABLE')
  customError.name = 'MissingDefaultAlbumTableError'
  throw customError
}

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
    const serverSupabase = createServerClient();

    const { data, error } = await serverSupabase
      .from('gallery_albums')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    console.log('Database query result:', { data, error });

    if (error) throw error

    const mappedCustomAlbums = (data || []).map(mapAlbumFromDB);

    const { defaultAlbums } = await loadDefaultAlbumsForEvent(serverSupabase, eventId);

    const combinedAlbums = [...defaultAlbums, ...mappedCustomAlbums];
    console.log('Mapped albums (with defaults):', combinedAlbums);

    return combinedAlbums;
  } catch (error) {
    console.error('Error getting event albums:', error)
    throw error
  }
}

const loadDefaultAlbumsForEvent = async (client: SupabaseClient, eventId: string): Promise<{ defaultAlbums: GalleryAlbum[]; tableMissing: boolean }> => {
  try {
    const { data, error } = await client
      .from(DEFAULT_ALBUM_TABLE)
      .select('*')
      .eq('event_id', eventId);

    if (error) {
      if (isMissingDefaultAlbumTable(error)) {
        console.warn(`Table ${DEFAULT_ALBUM_TABLE} not found. Returning default album definitions.`);
        const fallbackAlbums = DEFAULT_ALBUM_DEFINITIONS.map(def => mapDefaultAlbum(def, undefined, eventId, true));
        return { defaultAlbums: fallbackAlbums, tableMissing: true };
      }
      throw error;
    }

    const settingsByAlbum = new Map<string, DefaultAlbumSettingRow>();
    (data || []).forEach(setting => {
      if (setting && setting.album_type) {
        settingsByAlbum.set(setting.album_type, setting);
      }
    });

    const defaultAlbums = DEFAULT_ALBUM_DEFINITIONS
      .map(def => mapDefaultAlbum(def, settingsByAlbum.get(def.key), eventId));

    return { defaultAlbums, tableMissing: false };
  } catch (error) {
    if (isMissingDefaultAlbumTable(error)) {
      console.warn(`Table ${DEFAULT_ALBUM_TABLE} not found. Returning default album definitions.`);
      const fallbackAlbums = DEFAULT_ALBUM_DEFINITIONS.map(def => mapDefaultAlbum(def, undefined, eventId, true));
      return { defaultAlbums: fallbackAlbums, tableMissing: true };
    }
    console.error('Error loading default albums:', error);
    throw error;
  }
};

interface DefaultAlbumUpdateInput {
  name?: string | null
  description?: string | null
  coverImageUrl?: string | null
  isHidden?: boolean
  isDeleted?: boolean
}

export const updateDefaultAlbumSettings = async (
  eventId: string,
  albumType: DefaultAlbumKey,
  updates: DefaultAlbumUpdateInput
): Promise<GalleryAlbum> => {
  try {
    const client = createServerClient();

    const payload: Partial<DefaultAlbumSettingRow> & { event_id: string; album_type: string } = {
      event_id: eventId,
      album_type: albumType,
      updated_at: new Date().toISOString()
    };

    if (updates.name !== undefined) {
      payload.custom_name = updates.name && updates.name.trim().length > 0 ? updates.name.trim() : null;
    }

    if (updates.description !== undefined) {
      payload.description = updates.description?.trim() || null;
    }

    if (updates.coverImageUrl !== undefined) {
      payload.cover_image_url = updates.coverImageUrl || null;
    }

    if (updates.isHidden !== undefined) {
      payload.is_hidden = updates.isHidden;
    }

    if (updates.isDeleted !== undefined) {
      payload.is_deleted = updates.isDeleted;
    }

    const { data, error } = await client
      .from(DEFAULT_ALBUM_TABLE)
      .upsert(payload, { onConflict: 'event_id,album_type', ignoreDuplicates: false })
      .select('*')
      .single();

    if (error) {
      if (isMissingDefaultAlbumTable(error)) {
        throwMissingDefaultAlbumTableError();
      }
      throw error;
    }

    const settingRow: DefaultAlbumSettingRow | undefined = data ?? {
      event_id: eventId,
      album_type: albumType,
      custom_name: payload.custom_name ?? null,
      description: payload.description ?? null,
      cover_image_url: payload.cover_image_url ?? null,
      is_hidden: payload.is_hidden ?? false,
      is_deleted: payload.is_deleted ?? false,
      created_at: payload.updated_at,
      updated_at: payload.updated_at
    };

    const definition = DEFAULT_ALBUM_DEFINITIONS.find(def => def.key === albumType) ?? DEFAULT_ALBUM_DEFINITIONS[0];
    return mapDefaultAlbum(definition, settingRow, eventId);
  } catch (error) {
    if (error instanceof Error && error.name === 'MissingDefaultAlbumTableError') {
      throw error;
    }
    if (isMissingDefaultAlbumTable(error)) {
      throwMissingDefaultAlbumTableError();
    }
    console.error('Error updating default album settings:', error);
    throw error;
  }
};

export const softDeleteDefaultAlbum = async (eventId: string, albumType: DefaultAlbumKey): Promise<GalleryAlbum> => {
  return updateDefaultAlbumSettings(eventId, albumType, { isDeleted: true, isHidden: true });
};

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
  updatedAt: dbAlbum.updated_at,
  albumType: 'custom',
  isDefault: false,
  defaultKey: undefined,
  isHidden: dbAlbum.is_public === false,
  isDeleted: false
})

const mapDefaultAlbum = (
  definition: (typeof DEFAULT_ALBUM_DEFINITIONS)[number],
  setting: DefaultAlbumSettingRow | undefined,
  eventId: string,
  tableMissing: boolean = false
): GalleryAlbum => {
  const createdAt = setting?.created_at || new Date(0).toISOString()
  const updatedAt = setting?.updated_at || createdAt
  const isHidden = Boolean(setting?.is_hidden)
  const isDeleted = Boolean(setting?.is_deleted)

  return {
    id: definition.key,
    eventId,
    name: setting?.custom_name?.trim() || definition.defaultName,
    description: setting?.description ?? definition.defaultDescription,
    coverImageUrl: setting?.cover_image_url ?? undefined,
    isPublic: !(isHidden || isDeleted),
    createdAt,
    updatedAt,
    albumType: 'default',
    defaultKey: definition.key,
    isHidden,
    isDeleted,
    isDefault: true,
    tableMissing
  }
}

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

// Store custom album files (upload to Bunny.net and store metadata in database)
export const storeCustomAlbumFiles = async (
  files: File[],
  albumId: string,
  wwwId: string,
  mediaType: 'photos' | 'videos',
  signature?: string
): Promise<{ files: any[], cdnUrls: string[], message: string }> => {
  try {
    // First, upload files to Bunny.net using the album ID as the folder name
    const uploadResult = await uploadFiles(
      files,
      albumId as any, // We'll modify uploadFiles to accept custom album IDs
      mediaType,
      wwwId
    );

    // Get the event ID from wwwId
    const serverSupabase = createServerClient();
    const { data: event, error: eventError } = await serverSupabase
      .from('events')
      .select('id')
      .eq('www_id', wwwId)
      .single();

    if (eventError || !event) {
      throw new Error('Event not found');
    }

    // Store file metadata in database
    const imageRecords = files.map((file, index) => {
      const record = {
        album_id: albumId,
        event_id: event.id,
        filename: uploadResult.files[index] || file.name,
        original_filename: file.name,
        file_size: file.size,
        mime_type: file.type,
        image_url: uploadResult.cdnUrls[index],
        thumbnail_url: uploadResult.cdnUrls[index], // For now, use same URL as thumbnail
        uploaded_by: null, // Will be set by the calling function if needed
        is_approved: true, // Auto-approve custom album uploads
        metadata: {
          uploadedAt: new Date().toISOString(),
          mediaType: mediaType,
          signature: signature || null
        }
      };
      console.log('Creating image record:', record);
      return record;
    });

    // Insert all records at once
    const { data: insertedRecords, error: insertError } = await serverSupabase
      .from('gallery_images')
      .insert(imageRecords)
      .select();

    if (insertError) {
      console.error('Error storing custom album files in database:', insertError);
      throw insertError;
    }

    console.log('Successfully inserted records:', insertedRecords);

    return {
      files: uploadResult.files,
      cdnUrls: uploadResult.cdnUrls,
      message: `${files.length} file(s) uploaded successfully to custom album`
    };

  } catch (error) {
    console.error('Error storing custom album files:', error);
    throw error;
  }
}
