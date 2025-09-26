"use client";

import { useEffect, useState } from "react";
import { useAuth } from '@/components/supabase-auth-provider'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Camera, MessageSquare, Settings, Key } from "lucide-react";

interface OrganizerEvent {
  id: string;
  www_id: string;
  title: string;
  couple_names: string;
  event_date: string;
  status: string;
  gallery_enabled: boolean;
  rsvp_enabled: boolean;
}

export default function OrganizerDashboard() {
  const { user, userProfile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [event, setEvent] = useState<OrganizerEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalPhotos: 0,
    pendingRSVPs: 0,
    confirmedRSVPs: 0
  })
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordLoading, setPasswordLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user && userProfile?.role !== 'organizer') {
      router.push('/dashboard')
    } else if (user && userProfile?.role === 'organizer') {
      fetchOrganizerEvent()
    }
  }, [user, userProfile, authLoading, router]);

  const fetchOrganizerEvent = async () => {
    try {
      setLoading(true)
      
      // Get the session token from Supabase
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || ''
      
      // Get organizer's assigned event
      const response = await fetch('/api/dashboard/organizer/event', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch event data')
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        setEvent(result.data)
        await fetchEventStats(result.data.www_id)
      }
    } catch (error) {
      console.error('Error fetching organizer event:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match')
      return
    }
    
    if (passwordForm.newPassword.length < 8) {
      alert('New password must be at least 8 characters long')
      return
    }
    
    setPasswordLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || ''
      
      const response = await fetch('/api/dashboard/organizer/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to change password')
      }

      alert('Password changed successfully!')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setShowPasswordModal(false)
    } catch (error) {
      console.error('Error changing password:', error)
      alert(error instanceof Error ? error.message : 'Failed to change password')
    } finally {
      setPasswordLoading(false)
    }
  }

  const fetchEventStats = async (wwwId: string) => {
    try {
      // Get event UUID first
      const { data: eventData } = await supabase
        .from('events')
        .select('id')
        .eq('www_id', wwwId)
        .single()

      if (!eventData) {
        console.error('Event not found for wwwId:', wwwId)
        return
      }

      // Get RSVP stats for the event - use event UUID
      const { data: rsvps } = await supabase
        .from('invitation_rsvps')
        .select('status')
        .eq('event_id', eventData.id)

      const pendingRSVPs = rsvps?.filter(r => r.status === 'pending').length || 0
      const confirmedRSVPs = rsvps?.filter(r => r.status === 'confirmed').length || 0

      // Get photo count for the event - use event UUID
      let totalPhotos = 0
      try {
        const { data: photos } = await supabase
          .from('gallery_images')
          .select('id')
          .eq('event_id', eventData.id)

        totalPhotos = photos?.length || 0
      } catch (photoError) {
        console.log('Gallery images table may not exist yet:', photoError)
      }

      setStats({
        totalPhotos,
        pendingRSVPs,
        confirmedRSVPs
      })
    } catch (error) {
      console.error('Error fetching event stats:', error)
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

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading your event...</div>
      </div>
    )
  }

  if (!user || userProfile?.role !== 'organizer') return null

  if (!event) {
    return (
      <div className="min-h-screen bg-white flex">
        <Sidebar role="organizer" />
        <div className="flex-1 p-12">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">No Event Assigned</h2>
              <p className="text-gray-600">You don't have an event assigned yet. Please contact your administrator.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar role="organizer" />
      <div className="flex-1 p-12">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">Event Dashboard</h1>
              <p className="text-gray-600">Manage your assigned event: <strong>{event.title}</strong></p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowPasswordModal(true)}
              className="flex items-center gap-2"
            >
              <Key className="w-4 h-4" />
              Change Password
            </Button>
          </div>
        </div>

        {/* Event Overview Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Event Overview</span>
              <Badge variant={getStatusBadgeVariant(event.status)}>
                {event.status}
              </Badge>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending RSVPs</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingRSVPs}</div>
              <p className="text-xs text-muted-foreground">Awaiting response</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed RSVPs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.confirmedRSVPs}</div>
              <p className="text-xs text-muted-foreground">Guests confirmed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Photos Uploaded</CardTitle>
              <Camera className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPhotos}</div>
              <p className="text-xs text-muted-foreground">In gallery</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your event efficiently</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2"
                onClick={() => router.push(`/dashboard/events-edition/${event.www_id}/settings`)}
              >
                <Settings className="w-6 h-6" />
                <span>Event Settings</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2"
                onClick={() => router.push(`/dashboard/events-edition/${event.www_id}/gallery`)}
              >
                <Camera className="w-6 h-6" />
                <span>Gallery</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2"
                onClick={() => router.push(`/dashboard/events-edition/${event.www_id}/rsvp`)}
              >
                <MessageSquare className="w-6 h-6" />
                <span>RSVP Management</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2"
                onClick={() => router.push(`/dashboard/events-edition/${event.www_id}/details`)}
              >
                <Calendar className="w-6 h-6" />
                <span>Event Details</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Password Change Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold mb-4">Change Password</h2>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">New Password</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                    minLength={8}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                    minLength={8}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    disabled={passwordLoading}
                    className="flex-1"
                  >
                    {passwordLoading ? 'Changing...' : 'Change Password'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowPasswordModal(false)
                      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
