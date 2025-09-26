"use client";

import { useEffect, useState } from "react";
import { useAuth } from '@/components/supabase-auth-provider'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Upload, Download, Trash2, Eye, RefreshCw } from "lucide-react";
import Image from "next/image";

interface GalleryImage {
  id: string;
  filename: string;
  url: string;
  created_at: string;
  album_type: 'wedding-day' | 'party-day';
}

export default function EventGalleryPage() {
  const { user, userProfile, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const wwwId = params.wwwId as string
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'wedding-day' | 'party-day'>('wedding-day')
  const [images, setImages] = useState<GalleryImage[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadTotal, setUploadTotal] = useState(0)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user && !['superadmin', 'organizer'].includes(userProfile?.role || '')) {
      router.push('/dashboard')
    } else if (user && ['superadmin', 'organizer'].includes(userProfile?.role || '')) {
      fetchGalleryImages()
    }
  }, [user, userProfile, authLoading, router, wwwId, activeTab]);

  const fetchGalleryImages = async () => {
    try {
      setLoading(true)
      
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || ''
      
      const response = await fetch(`/api/event-id/${wwwId}/gallery?albumType=${activeTab}&mediaType=photos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch gallery images')
      }

      const result = await response.json()
      
      if (result.success) {
        const galleryImages = result.data.map((file: any) => ({
          id: file.fileName,
          filename: file.fileName,
          url: file.url,
          created_at: new Date().toISOString(),
          album_type: activeTab
        }))
        setImages(galleryImages)
      }
    } catch (error) {
      console.error('Error fetching gallery images:', error)
      toast({
        title: "Error",
        description: "Failed to load gallery images",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setUploadTotal(files.length)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      Array.from(files).forEach(file => {
        formData.append('files', file)
      })
      formData.append('albumType', activeTab)
      formData.append('mediaType', 'photos')

      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || ''

      const response = await fetch(`/api/event-id/${wwwId}/gallery/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || 'Upload failed')
      }

      const result = await response.json()
      console.log('Upload successful:', result)
      
      // Refresh gallery images
      await fetchGalleryImages()
      
      toast({
        title: "Success",
        description: `${files.length} image(s) uploaded successfully`,
      })
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Upload failed",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      setUploadProgress(0)
      setUploadTotal(0)
    }
  }

  const handleDownloadAll = async () => {
    if (images.length === 0) {
      toast({
        title: "No Images",
        description: "No images to download",
        variant: "destructive",
      })
      return
    }

    try {
      for (let i = 0; i < images.length; i++) {
        const image = images[i]
        const response = await fetch(image.url)
        const blob = await response.blob()
        
        const downloadUrl = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = image.filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(downloadUrl)
        
        if (i < images.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }
    } catch (error) {
      console.error('Error downloading images:', error)
      toast({
        title: "Error",
        description: "Failed to download images",
        variant: "destructive",
      })
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return

    try {
      // Note: You would need to implement a delete API endpoint
      toast({
        title: "Delete Feature",
        description: "Image deletion will be implemented in the next update",
      })
    } catch (error) {
      console.error('Error deleting image:', error)
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading gallery...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gallery Management</CardTitle>
          <CardDescription>Manage photos and videos for your event</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'wedding-day' | 'party-day')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="wedding-day">Wedding Day</TabsTrigger>
              <TabsTrigger value="party-day">Party Day</TabsTrigger>
            </TabsList>
            
            <TabsContent value="wedding-day" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Wedding Day Photos</h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleDownloadAll}
                    disabled={images.length === 0}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download All
                  </Button>
                  <Button
                    onClick={() => document.getElementById('file-upload')?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {uploading ? 'Uploading...' : 'Upload Photos'}
                  </Button>
                </div>
              </div>
              
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              
              {uploading && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Uploading {uploadProgress} of {uploadTotal} images...</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(uploadProgress / uploadTotal) * 100}%` }}
                    />
                  </div>
                </div>
              )}
              
              {images.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No photos uploaded yet</p>
                  <p className="text-sm">Click "Upload Photos" to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {images.map((image) => (
                    <div key={image.id} className="relative group">
                      <div className="aspect-square relative overflow-hidden rounded-lg border">
                        <Image
                          src={image.url}
                          alt={image.filename}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => window.open(image.url, '_blank')}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteImage(image.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 truncate">{image.filename}</p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="party-day" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Party Day Photos</h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleDownloadAll}
                    disabled={images.length === 0}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download All
                  </Button>
                  <Button
                    onClick={() => document.getElementById('file-upload-party')?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {uploading ? 'Uploading...' : 'Upload Photos'}
                  </Button>
                </div>
              </div>
              
              <input
                id="file-upload-party"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              
              {images.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No photos uploaded yet</p>
                  <p className="text-sm">Click "Upload Photos" to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {images.map((image) => (
                    <div key={image.id} className="relative group">
                      <div className="aspect-square relative overflow-hidden rounded-lg border">
                        <Image
                          src={image.url}
                          alt={image.filename}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => window.open(image.url, '_blank')}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteImage(image.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 truncate">{image.filename}</p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
