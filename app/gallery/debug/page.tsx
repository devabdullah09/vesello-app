'use client';
import { useState, useEffect } from 'react';

export default function DebugPage() {
  const [envStatus, setEnvStatus] = useState<any>(null);
  const [bunnyStatus, setBunnyStatus] = useState<any>(null);
  const [galleryStatus, setGalleryStatus] = useState<any>(null);
  const [uploadStatus, setUploadStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  const testEnvironment = async () => {
    try {
      const response = await fetch('/api/gallery/test-env');
      const data = await response.json();
      setEnvStatus(data);
    } catch (error) {
      setEnvStatus({ error: 'Failed to test environment' });
    }
  };

  const testBunnyNet = async () => {
    try {
      const response = await fetch('/api/gallery/test-bunny');
      const data = await response.json();
      setBunnyStatus(data);
    } catch (error) {
      setBunnyStatus({ error: 'Failed to test Bunny.net' });
    }
  };

  const testGallery = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/gallery/images?albumType=wedding-day&mediaType=photos');
      const data = await response.json();
      setGalleryStatus(data);
    } catch (error) {
      setGalleryStatus({ error: 'Failed to test gallery' });
    } finally {
      setLoading(false);
    }
  };

  const testUpload = async () => {
    setUploadLoading(true);
    try {
      // Create a test file
      const testContent = 'This is a test file for Bunny.net upload verification';
      const testBlob = new Blob([testContent], { type: 'text/plain' });
      const testFile = new File([testBlob], 'test-upload.txt', { type: 'text/plain' });

      const formData = new FormData();
      formData.append('testFile', testFile);

      const response = await fetch('/api/gallery/test-upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setUploadStatus(data);
    } catch (error) {
      setUploadStatus({ error: 'Failed to test upload' });
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Gallery Debug Page</h1>
        
        <div className="space-y-6">
          {/* Environment Test */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Environment Variables Test</h2>
            <button 
              onClick={testEnvironment}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Test Environment
            </button>
            {envStatus && (
              <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-auto">
                {JSON.stringify(envStatus, null, 2)}
              </pre>
            )}
          </div>

          {/* Bunny.net Test */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Bunny.net Connection Test</h2>
            <button 
              onClick={testBunnyNet}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Test Bunny.net
            </button>
            {bunnyStatus && (
              <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-auto">
                {JSON.stringify(bunnyStatus, null, 2)}
              </pre>
            )}
          </div>

          {/* Gallery Test */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Gallery API Test</h2>
            <button 
              onClick={testGallery}
              disabled={loading}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Gallery API'}
            </button>
            {galleryStatus && (
              <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-auto">
                {JSON.stringify(galleryStatus, null, 2)}
              </pre>
            )}
          </div>

          {/* Upload Test */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Upload Test</h2>
            <button 
              onClick={testUpload}
              disabled={uploadLoading}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
            >
              {uploadLoading ? 'Testing Upload...' : 'Test File Upload'}
            </button>
            {uploadStatus && (
              <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-auto">
                {JSON.stringify(uploadStatus, null, 2)}
              </pre>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800 mb-3">Troubleshooting Steps:</h3>
            <ol className="list-decimal list-inside space-y-2 text-yellow-700">
              <li>Check your <code className="bg-yellow-100 px-1 rounded">.env</code> file has the complete Bunny.net API key</li>
              <li>Verify your storage zone name matches exactly</li>
              <li>Ensure your storage endpoint URL is correct</li>
              <li>Check that your CDN URL is accessible</li>
              <li>Verify your Bunny.net account has sufficient credits</li>
              <li>Run the tests above in order to identify the specific issue</li>
            </ol>
          </div>

          {/* Quick Fixes */}
          <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Quick Fixes:</h3>
            <ul className="list-disc list-inside space-y-2 text-blue-700">
              <li>Make sure your <code className="bg-blue-100 px-1 rounded">BUNNY_NET_STORAGE_API_KEY</code> is complete (not truncated)</li>
              <li>Verify the storage zone <code className="bg-blue-100 px-1 rounded">wedding-app-storage</code> exists in your Bunny.net account</li>
              <li>Check that your storage endpoint URL is correct: <code className="bg-blue-100 px-1 rounded">https://storage.bunnycdn.com/wedding-app-storage</code></li>
              <li>Ensure your CDN pull zone is properly configured</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
