import { NextRequest, NextResponse } from 'next/server';
import { bunnyNetService } from '@/lib/bunny-net';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const testFile = formData.get('testFile') as File;
    
    if (!testFile) {
      return NextResponse.json({ error: 'No test file provided' }, { status: 400 });
    }

    // Create a simple test file content
    const testContent = 'This is a test file for Bunny.net upload verification';
    const testBlob = new Blob([testContent], { type: 'text/plain' });
    const testFileObj = new File([testBlob], 'test-upload.txt', { type: 'text/plain' });

    // Test upload to a test directory
    const uploadResult = await bunnyNetService.uploadFiles(
      [testFileObj], 
      'wedding-day', 
      'photos'
    );

    return NextResponse.json({
      success: true,
      message: 'Test upload successful',
      result: uploadResult,
      testFile: {
        name: testFileObj.name,
        size: testFileObj.size,
        type: testFileObj.type
      }
    });

  } catch (error) {
    console.error('Test upload error:', error);
    return NextResponse.json({ 
      error: 'Test upload failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Test upload endpoint ready. Send a POST request with a test file.',
    method: 'POST',
    body: 'FormData with testFile field'
  });
}
