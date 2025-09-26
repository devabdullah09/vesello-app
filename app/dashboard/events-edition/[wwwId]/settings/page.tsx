"use client";

import { useEffect, useState } from "react";
import { useAuth } from '@/components/supabase-auth-provider'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Save, RefreshCw } from "lucide-react";

interface EventSettings {
  title: string;
  couple_names: string;
  event_date: string;
  venue: string;
  description: string;
  gallery_enabled: boolean;
  rsvp_enabled: boolean;
  status: string;
}

export default function EventSettingsPage() {
  const { user, userProfile, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const wwwId = params.wwwId as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<EventSettings>({
    title: '',
    couple_names: '',
    event_date: '',
    venue: '',
    description: '',
    gallery_enabled: false,
    rsvp_enabled: false,
    status: 'planned'
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user && !['superadmin', 'organizer'].includes(userProfile?.role || '')) {
      router.push('/dashboard')
    } else if (user && ['superadmin', 'organizer'].includes(userProfile?.role || '')) {
      fetchEventSettings()
    }
  }, [user, userProfile, authLoading, router, wwwId]);

  const fetchEventSettings = async () => {
    try {
      setLoading(true)
      
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || ''
      
      const response = await fetch(`/api/event-id/${wwwId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch event settings')
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        setSettings({
          title: result.data.title || '',
          couple_names: result.data.coupleNames || '',
          event_date: result.data.eventDate || '',
          venue: result.data.venue || '',
          description: result.data.description || '',
          gallery_enabled: result.data.galleryEnabled || false,
          rsvp_enabled: result.data.rsvpEnabled || false,
          status: result.data.status || 'planned'
        })
      }
    } catch (error) {
      console.error('Error fetching event settings:', error)
      toast({
        title: "Error",
        description: "Failed to load event settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || ''
      
      const response = await fetch(`/api/event-id/${wwwId}/update-content`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sectionContent: {
            heroSection: {
              coupleNames: settings.couple_names,
              eventDate: settings.event_date,
              venue: settings.venue,
              customMessage: settings.description
            }
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update event settings')
      }

      // Also update the main event fields
      const updateResponse = await fetch(`/api/dashboard/events/${wwwId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: settings.title,
          couple_names: settings.couple_names,
          event_date: settings.event_date,
          venue: settings.venue,
          description: settings.description,
          gallery_enabled: settings.gallery_enabled,
          rsvp_enabled: settings.rsvp_enabled,
          status: settings.status
        })
      })

      if (!updateResponse.ok) {
        throw new Error('Failed to update event details')
      }

      toast({
        title: "Success",
        description: "Event settings updated successfully",
      })
    } catch (error) {
      console.error('Error saving event settings:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading event settings...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Update the basic details of your event</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                value={settings.title}
                onChange={(e) => setSettings(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter event title"
              />
            </div>
            <div>
              <Label htmlFor="couple_names">Couple Names</Label>
              <Input
                id="couple_names"
                value={settings.couple_names}
                onChange={(e) => setSettings(prev => ({ ...prev, couple_names: e.target.value }))}
                placeholder="e.g., John & Jane"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="event_date">Event Date</Label>
              <Input
                id="event_date"
                type="date"
                value={settings.event_date}
                onChange={(e) => setSettings(prev => ({ ...prev, event_date: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="venue">Venue</Label>
              <Input
                id="venue"
                value={settings.venue}
                onChange={(e) => setSettings(prev => ({ ...prev, venue: e.target.value }))}
                placeholder="Enter venue name"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={settings.description}
              onChange={(e) => setSettings(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter event description"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Features & Status</CardTitle>
          <CardDescription>Enable/disable features and set event status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="gallery_enabled">Gallery</Label>
              <p className="text-sm text-gray-600">Allow guests to upload photos and videos</p>
            </div>
            <Switch
              id="gallery_enabled"
              checked={settings.gallery_enabled}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, gallery_enabled: checked }))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="rsvp_enabled">RSVP</Label>
              <p className="text-sm text-gray-600">Allow guests to respond to invitations</p>
            </div>
            <Switch
              id="rsvp_enabled"
              checked={settings.rsvp_enabled}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, rsvp_enabled: checked }))}
            />
          </div>
          
          <div>
            <Label htmlFor="status">Event Status</Label>
            <select
              id="status"
              value={settings.status}
              onChange={(e) => setSettings(prev => ({ ...prev, status: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="planned">Planned</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
          {saving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  )
}
