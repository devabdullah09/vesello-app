import { NextRequest, NextResponse } from 'next/server';
import { bunnyNetService } from '@/lib/bunny-net';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const uploadPath = formData.get('uploadPath') as string || 'content-images';
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    try {
      // Upload to Bunny.net using existing service
      const uploadResult = await bunnyNetService.uploadFiles(
        [file], 
        'wedding-day', // Use existing album structure
        'photos'
      );

      if (uploadResult.cdnUrls && uploadResult.cdnUrls.length > 0) {
        return NextResponse.json({
          success: true,
          data: {
            url: uploadResult.cdnUrls[0],
            filename: file.name
          },
          message: 'Image uploaded successfully'
        });
      } else {
        throw new Error('No CDN URL returned from upload');
      }

    } catch (bunnyError) {
      console.error('Bunny.net upload error:', bunnyError);
      
      // Fallback: Return a placeholder or handle gracefully
      return NextResponse.json({
        success: false,
        error: 'Upload service temporarily unavailable',
        fallback: true
      }, { status: 503 });
    }

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Upload failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
