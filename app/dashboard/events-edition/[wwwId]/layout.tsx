"use client";

import { useEffect, useState } from "react";
import { useAuth } from '@/components/supabase-auth-provider'
import { useRouter, useParams } from 'next/navigation'
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Camera, MessageSquare, Settings, ExternalLink } from "lucide-react";
import { supabase } from '@/lib/supabase';

interface EventData {
  id: string;
  www_id: string;
  title: string;
  couple_names: string;
  event_date: string;
  status: string;
  gallery_enabled: boolean;
  rsvp_enabled: boolean;
}

export default function EventEditionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userProfile, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const wwwId = params.wwwId as string
  const [event, setEvent] = useState<EventData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user && !['superadmin', 'organizer'].includes(userProfile?.role || '')) {
      router.push('/dashboard')
    } else if (user && ['superadmin', 'organizer'].includes(userProfile?.role || '')) {
      fetchEventData()
    }
  }, [user, userProfile, authLoading, router, wwwId]);

  const fetchEventData = async () => {
    try {
      setLoading(true)
      
      // Get the session token from Supabase
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || ''
      
      // Get event data
      const response = await fetch(`/api/event-id/${wwwId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch event data')
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        setEvent({
          id: result.data.id,
          www_id: result.data.wwwId,
          title: result.data.title,
          couple_names: result.data.coupleNames,
          event_date: result.data.eventDate,
          status: result.data.status,
          gallery_enabled: result.data.galleryEnabled,
          rsvp_enabled: result.data.rsvpEnabled
        })
      }
    } catch (error) {
      console.error('Error fetching event data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'planned': return 'secondary'
      case 'completed': return 'outline'
      case 'cancelled': return 'destructive'
      default: return 'secondary'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex">
        <Sidebar role={userProfile?.role as any} />
        <div className="flex-1 p-12">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading event data...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-white flex">
        <Sidebar role={userProfile?.role as any} />
        <div className="flex-1 p-12">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-red-600">Event not found</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar role={userProfile?.role as any} />
      <div className="flex-1 p-12">
        {/* Event Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">Event Management</h1>
              <p className="text-gray-600">Manage event: <strong>{event.title}</strong></p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={getStatusBadgeVariant(event.status)}>
                {event.status}
              </Badge>
              <Button
                variant="outline"
                onClick={() => window.open(`/event-id/${event.www_id}`, '_blank')}
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                View Event
              </Button>
            </div>
          </div>
        </div>

        {/* Event Overview Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Event Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                <p className="text-gray-600 mb-2">Couple: {event.couple_names}</p>
                <p className="text-gray-600 mb-2">Event ID: {event.www_id}</p>
                <p className="text-gray-600">Date: {formatDate(event.event_date)}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Features Enabled</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    <span>Gallery: {event.gallery_enabled ? 'Enabled' : 'Disabled'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>RSVP: {event.rsvp_enabled ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Tabs */}
        <Card className="mb-8">
          <CardContent className="p-0">
            <div className="flex border-b">
              <Button
                variant="ghost"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                onClick={() => router.push(`/dashboard/events-edition/${wwwId}/settings`)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button
                variant="ghost"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                onClick={() => router.push(`/dashboard/events-edition/${wwwId}/gallery`)}
              >
                <Camera className="w-4 h-4 mr-2" />
                Gallery
              </Button>
              <Button
                variant="ghost"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                onClick={() => router.push(`/dashboard/events-edition/${wwwId}/rsvp`)}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                RSVP Management
              </Button>
              <Button
                variant="ghost"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                onClick={() => router.push(`/dashboard/events-edition/${wwwId}/details`)}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Event Details
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Page Content */}
        {children}
      </div>
    </div>
  )
}
