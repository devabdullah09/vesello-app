import { NextRequest, NextResponse } from 'next/server';
import { deleteFile } from '@/lib/bunny-net';

// DELETE /api/event-id/[wwwId]/gallery/delete - Delete files from event-specific gallery
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
    
    const deleted = await deleteFile(fileName, album, type, wwwId);
    
    if (deleted) {
      return NextResponse.json({
        success: true,
        message: 'File deleted successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'File not found or could not be deleted' },
        { status: 404 }
      );
    }
    
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
