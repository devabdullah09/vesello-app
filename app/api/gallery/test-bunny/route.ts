import { NextRequest, NextResponse } from 'next/server';
import { bunnyNetService } from '@/lib/bunny-net';

export async function GET(request: NextRequest) {
  try {
    // Test connection to Bunny.net with detailed logging
    console.log('Testing Bunny.net connection...');
    
    // First, let's test the basic endpoint without authentication
    const baseResponse = await fetch('https://storage.bunnycdn.com/wedding-app-storage/', {
      method: 'GET',
    });
    
    console.log('Base endpoint test:', {
      status: baseResponse.status,
      statusText: baseResponse.statusText,
      url: baseResponse.url
    });
    
    // Now test with authentication
    const isConnected = await bunnyNetService.testConnection();
    
    if (!isConnected) {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to connect to Bunny.net',
        message: 'Check your API key and storage zone configuration',
        debug: {
          baseEndpointStatus: baseResponse.status,
          baseEndpointStatusText: baseResponse.statusText,
          note: 'If base endpoint returns 404, the storage zone does not exist. If it returns 401, the API key is invalid.'
        }
      }, { status: 500 });
    }

    // Try to list files from a test directory
    try {
      const files = await bunnyNetService.listFiles('wedding-day', 'photos');
      return NextResponse.json({ 
        success: true, 
        message: 'Successfully connected to Bunny.net',
        connection: 'OK',
        testDirectory: 'wedding-day/photos',
        fileCount: files.length,
        sampleFiles: files.slice(0, 5) // Show first 5 files
      });
    } catch (listError) {
      return NextResponse.json({ 
        success: true, 
        message: 'Connected to Bunny.net but could not list files',
        connection: 'OK',
        listError: listError instanceof Error ? listError.message : 'Unknown error',
        note: 'This might be normal if the directory is empty or newly created'
      });
    }

  } catch (error) {
    console.error('Bunny.net test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Bunny.net test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      message: 'Check your environment variables and Bunny.net configuration'
    }, { status: 500 });
  }
}
