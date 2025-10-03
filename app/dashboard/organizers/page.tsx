"use client";
import { useEffect, useState } from "react";
import { useAuth } from '@/components/supabase-auth-provider'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import Sidebar from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Edit, Plus, Eye, Key, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Organizer {
  id: string;
  email: string;
  display_name: string;
  event_id: string;
  created_at: string;
  last_login: string;
  events?: {
    id: string;
    www_id: string;
    title: string;
    couple_names: string;
    status: string;
  };
}

interface AvailableEvent {
  id: string;
  www_id: string;
  title: string;
  couple_names: string;
  event_date: string;
  status: string;
}

export default function OrganizersPage() {
  const { user, userProfile, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [organizers, setOrganizers] = useState<Organizer[]>([])
  const [availableEvents, setAvailableEvents] = useState<AvailableEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [editingOrganizer, setEditingOrganizer] = useState<Organizer | null>(null)
  const [passwordData, setPasswordData] = useState({
    id: '',
    email: '',
    displayName: '',
    newPassword: ''
  })
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    eventId: ''
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user && userProfile?.role !== 'superadmin') {
      router.push('/dashboard')
    } else if (user && userProfile?.role === 'superadmin') {
      fetchOrganizers()
      fetchAvailableEvents()
    }
  }, [user, userProfile, authLoading, router]);

  // Auto-refresh mechanisms for real-time updates
  useEffect(() => {
    if (!user || userProfile?.role !== 'superadmin') return

    // 1. Periodic refresh every 10 seconds for more responsive updates
    const intervalId = setInterval(() => {
      fetchAvailableEvents(true) // Show toast for new events
    }, 10000) // 10 seconds

    // 2. Visibility change refresh
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchAvailableEvents(true) // Show toast for new events
      }
    }

    // 3. Window focus refresh
    const handleFocus = () => {
      fetchAvailableEvents(true) // Show toast for new events
    }

    // 4. Storage event listener (for cross-tab communication)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'event-created' || e.key === 'event-updated') {
        fetchAvailableEvents(true) // Show toast for new events
      }
    }

    // 5. Page show event (when returning from another tab)
    const handlePageShow = () => {
      fetchAvailableEvents(true) // Show toast for new events
    }

    // Add all event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('pageshow', handlePageShow)
    
    return () => {
      clearInterval(intervalId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('pageshow', handlePageShow)
    }
  }, [user, userProfile])

  const fetchOrganizers = async () => {
    try {
      setLoading(true)
      
      // Get the session token from Supabase
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || ''
      
      const response = await fetch('/api/dashboard/organizers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to fetch organizers: ${response.status}`)
      }

      const result = await response.json()
      setOrganizers(result.data || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch organizers. Check console for details.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableEvents = async (showToast = false) => {
    try {
      setRefreshing(true)
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || ''
      
      const response = await fetch('/api/dashboard/events/available', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Failed to fetch available events:', errorText)
        throw new Error(`Failed to fetch available events: ${response.status}`)
      }

      const result = await response.json()
      const previousCount = availableEvents.length
      const newCount = result.data?.length || 0
      
      setAvailableEvents(result.data || [])
      
      // Show toast if new events were found
      if (showToast && newCount > previousCount) {
        toast({
          title: "New Events Found!",
          description: `${newCount - previousCount} new event(s) are now available for assignment.`,
        })
      }
    } catch (error) {
      console.error('Error fetching available events:', error)
      if (showToast) {
        toast({
          title: "Error",
          description: "Failed to fetch available events. Check console for details.",
          variant: "destructive",
        })
      }
    } finally {
      setRefreshing(false)
      setLoading(false)
    }
  }

  const handleCreateOrganizer = async () => {
    try {
      if (!formData.email || !formData.password || !formData.displayName || !formData.eventId) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      if (availableEvents.length === 0) {
        toast({
          title: "Error",
          description: "No events available. Please create an event first.",
          variant: "destructive",
        })
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || ''
      
      const response = await fetch('/api/dashboard/organizers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create organizer')
      }

      const result = await response.json()
      
      toast({
        title: "Success",
        description: `Organizer account created successfully for ${result.data.event_title}`,
      })

      setFormData({ email: '', password: '', displayName: '', eventId: '' })
      setShowCreateModal(false)
      fetchOrganizers()
      fetchAvailableEvents()
    } catch (error) {
      console.error('Error creating organizer:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create organizer",
        variant: "destructive",
      })
    }
  }

  const handleGeneratePassword = async (organizer: Organizer) => {
    try {
      setPasswordData({
        id: organizer.id,
        email: organizer.email,
        displayName: organizer.display_name,
        newPassword: ''
      })
      setShowPasswordModal(true)
    } catch (error) {
      console.error('Error preparing password generation:', error)
    }
  }

  const handleConfirmPasswordGeneration = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || ''
      
      const response = await fetch(`/api/dashboard/organizers/${passwordData.id}/password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate password')
      }

      const result = await response.json()
      
      setPasswordData(prev => ({
        ...prev,
        newPassword: result.data.newPassword
      }))

      toast({
        title: "Success",
        description: "New password generated successfully",
      })
    } catch (error) {
      console.error('Error generating password:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate password",
        variant: "destructive",
      })
    }
  }

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(passwordData.newPassword)
    toast({
      title: "Copied",
      description: "Password copied to clipboard",
    })
  }

  const handleDeleteOrganizer = async (organizerId: string, organizerEmail: string) => {
    if (!confirm(`Are you sure you want to delete the organizer account for ${organizerEmail}? This action cannot be undone.`)) {
      return
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || ''
      
      const response = await fetch(`/api/dashboard/organizers/${organizerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete organizer')
      }

      toast({
        title: "Success",
        description: "Organizer account deleted successfully",
      })

      fetchOrganizers()
      fetchAvailableEvents()
    } catch (error) {
      console.error('Error deleting organizer:', error)
      toast({
        title: "Error",
        description: "Failed to delete organizer",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
        <div className="text-lg">Loading organizers...</div>
      </div>
    )
  }

  if (!user || userProfile?.role !== 'superadmin') return null

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar role="superadmin" />
      <div className="flex-1 p-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-black">ORGANIZERS MANAGEMENT</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              disabled={refreshing}
              onClick={() => {
                fetchAvailableEvents(true)
              }}
            >
              {refreshing ? 'Refreshing...' : `Refresh Events (${availableEvents.length})`}
            </Button>
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-[#E5B574] via-[#D59C58] to-[#C18037] text-white font-semibold px-6 py-2 rounded-md shadow-md hover:from-[#D59C58] hover:to-[#E5B574] transition-colors">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Organizer
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Organizer Account</DialogTitle>
                  <DialogDescription>
                    Create a new organizer account for an event. The organizer will only be able to manage their assigned event.
                  </DialogDescription>
                </DialogHeader>
              {availableEvents.length === 0 && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
                  <strong>No events found!</strong> Please check if you have created any events in the system.
                </div>
              )}
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="col-span-3"
                    placeholder="organizer@example.com"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">
                    Password *
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="col-span-3"
                    placeholder="Enter password"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="displayName" className="text-right">
                    Name *
                  </Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="col-span-3"
                    placeholder="Organizer Name"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="eventId" className="text-right">
                    Event *
                  </Label>
                  <Select value={formData.eventId} onValueChange={(value) => setFormData({ ...formData, eventId: value })}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder={availableEvents.length === 0 ? "No events available" : "Select an event"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableEvents.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          No events available. Create an event first.
                        </div>
                      ) : (
                        availableEvents.map((event) => (
                          <SelectItem key={event.www_id} value={event.www_id}>
                            {event.title} - {event.couple_names} ({event.www_id})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateOrganizer}>
                  Create Organizer
                </Button>
              </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {organizers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">No Organizers Found</h3>
                <p className="text-gray-600 mb-4">Create your first organizer account to get started.</p>
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-[#E5B574] via-[#D59C58] to-[#C18037] text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Organizer
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {organizers.map((organizer) => (
              <Card key={organizer.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {organizer.display_name}
                        <Badge variant="outline">Organizer</Badge>
                      </CardTitle>
                      <CardDescription>{organizer.email}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGeneratePassword(organizer)}
                        title="Generate New Password"
                      >
                        <Key className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteOrganizer(organizer.id, organizer.email)}
                        title="Delete Organizer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Event Assignment</h4>
                      {organizer.events ? (
                        <div className="space-y-2">
                          <p><strong>Event:</strong> {organizer.events.title}</p>
                          <p><strong>Couple:</strong> {organizer.events.couple_names}</p>
                          <p><strong>Event ID:</strong> {organizer.events.www_id}</p>
                          <Badge variant={getStatusBadgeVariant(organizer.events.status)}>
                            {organizer.events.status}
                          </Badge>
                        </div>
                      ) : (
                        <p className="text-gray-500">No event assigned</p>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Account Details</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><strong>Created:</strong> {formatDate(organizer.created_at)}</p>
                        <p><strong>Last Login:</strong> {formatDate(organizer.last_login)}</p>
                        <div><strong>Status:</strong> <Badge variant="default">Active</Badge></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Password Generation Modal */}
        <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Password Management</DialogTitle>
              <DialogDescription>
                Generate a new password for {passwordData.displayName} ({passwordData.email})
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {passwordData.newPassword ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">New Password Generated</h4>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-2 bg-white border rounded text-sm font-mono">
                        {passwordData.newPassword}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyPassword}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded">
                    <strong>Important:</strong> This password will only be shown once. Make sure to copy it and share it securely with the organizer.
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-4">
                    Click the button below to generate a new secure password for this organizer.
                  </p>
                  <Button onClick={handleConfirmPasswordGeneration} className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Generate New Password
                  </Button>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPasswordModal(false)}>
                {passwordData.newPassword ? 'Close' : 'Cancel'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
