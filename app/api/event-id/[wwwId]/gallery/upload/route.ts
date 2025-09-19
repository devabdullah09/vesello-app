import { NextRequest, NextResponse } from 'next/server';
import { uploadSingleFile } from '@/lib/bunny-net';

// POST /api/event-id/[wwwId]/gallery/upload - Upload files to event-specific gallery
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ wwwId: string }> }
) {
  try {
    const { wwwId } = await params;
    const formData = await request.formData();
    
    const files = formData.getAll('files') as File[];
    const album = formData.get('album') as string || 'wedding-day';
    const type = formData.get('type') as string || 'photos';
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No files provided' },
        { status: 400 }
      );
    }
    
    const uploadPromises = files.map(async (file) => {
      return await uploadSingleFile(file, album, type, wwwId);
    });
    
    const uploadedFiles = await Promise.all(uploadPromises);
    
    return NextResponse.json({
      success: true,
      files: uploadedFiles,
      count: uploadedFiles.length
    });
    
  } catch (error) {
    console.error('Error uploading files:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to upload files' },
      { status: 500 }
    );
  }
}
