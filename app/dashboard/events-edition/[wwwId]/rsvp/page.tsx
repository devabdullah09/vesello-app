"use client";

import { useEffect, useState } from "react";
import { useAuth } from '@/components/supabase-auth-provider'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Search, Download, Mail, RefreshCw, CheckCircle, XCircle, Clock } from "lucide-react";

interface RSVPResponse {
  id: string;
  event_id: string;
  main_guest: {
    name: string;
    surname: string;
    email?: string;
    phone?: string;
  };
  additional_guests: Array<{
    name: string;
    surname: string;
  }>;
  status: 'pending' | 'confirmed' | 'declined';
  attendance: 'will' | 'cant';
  dietary_requirements?: string;
  special_notes?: string;
  submitted_at: string;
}

export default function EventRSVPPage() {
  const { user, userProfile, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const wwwId = params.wwwId as string
  const [loading, setLoading] = useState(true)
  const [rsvps, setRsvps] = useState<RSVPResponse[]>([])
  const [filteredRsvps, setFilteredRsvps] = useState<RSVPResponse[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'confirmed' | 'declined' | 'pending'>('all')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user && !['superadmin', 'organizer'].includes(userProfile?.role || '')) {
      router.push('/dashboard')
    } else if (user && ['superadmin', 'organizer'].includes(userProfile?.role || '')) {
      fetchRSVPs()
    }
  }, [user, userProfile, authLoading, router, wwwId]);

  useEffect(() => {
    filterRSVPs()
  }, [rsvps, searchTerm, activeTab]);

  const fetchRSVPs = async () => {
    try {
      setLoading(true)
      
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

      const { data: rsvpData, error } = await supabase
        .from('invitation_rsvps')
        .select('*')
        .eq('event_id', eventData.id)
        .order('submitted_at', { ascending: false })

      if (error) throw error

      setRsvps(rsvpData || [])
    } catch (error) {
      console.error('Error fetching RSVPs:', error)
      toast({
        title: "Error",
        description: "Failed to load RSVP responses",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterRSVPs = () => {
    let filtered = rsvps

    // Filter by status
    if (activeTab !== 'all') {
      filtered = filtered.filter(rsvp => rsvp.status === activeTab)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(rsvp => 
        rsvp.main_guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rsvp.main_guest.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rsvp.main_guest.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rsvp.additional_guests.some(guest => 
          guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          guest.surname.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    setFilteredRsvps(filtered)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Confirmed</Badge>
      case 'declined':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Declined</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getAttendanceBadge = (attendance: string) => {
    switch (attendance) {
      case 'will':
        return <Badge className="bg-green-100 text-green-800">Will Attend</Badge>
      case 'cant':
        return <Badge className="bg-red-100 text-red-800">Cannot Attend</Badge>
      default:
        return <Badge variant="secondary">{attendance}</Badge>
    }
  }

  const handleExportCSV = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Status', 'Attendance', 'Additional Guests', 'Dietary Requirements', 'Special Notes', 'Submitted At'],
      ...filteredRsvps.map(rsvp => [
        `${rsvp.main_guest.name} ${rsvp.main_guest.surname}`,
        rsvp.main_guest.email || '',
        rsvp.main_guest.phone || '',
        rsvp.status,
        rsvp.attendance,
        rsvp.additional_guests.map(g => `${g.name} ${g.surname}`).join('; '),
        rsvp.dietary_requirements || '',
        rsvp.special_notes || '',
        new Date(rsvp.submitted_at).toLocaleString()
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `rsvp-responses-${wwwId}-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const getStats = () => {
    const total = rsvps.length
    const confirmed = rsvps.filter(r => r.status === 'confirmed').length
    const declined = rsvps.filter(r => r.status === 'declined').length
    const pending = rsvps.filter(r => r.status === 'pending').length
    const willAttend = rsvps.filter(r => r.attendance === 'will').length

    return { total, confirmed, declined, pending, willAttend }
  }

  const stats = getStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading RSVP responses...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-gray-600">Total Responses</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
            <p className="text-sm text-gray-600">Confirmed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.declined}</div>
            <p className="text-sm text-gray-600">Declined</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-sm text-gray-600">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.willAttend}</div>
            <p className="text-sm text-gray-600">Will Attend</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>RSVP Responses</CardTitle>
              <CardDescription>Manage and view guest responses</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleExportCSV}
                disabled={filteredRsvps.length === 0}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                onClick={fetchRSVPs}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search Responses</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Search by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                <TabsTrigger value="confirmed">Confirmed ({stats.confirmed})</TabsTrigger>
                <TabsTrigger value="declined">Declined ({stats.declined})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-4">
                {filteredRsvps.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No RSVP responses found</p>
                    <p className="text-sm">Responses will appear here as guests respond</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredRsvps.map((rsvp) => (
                      <Card key={rsvp.id} className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {rsvp.main_guest.name} {rsvp.main_guest.surname}
                            </h3>
                            {rsvp.main_guest.email && (
                              <p className="text-sm text-gray-600">{rsvp.main_guest.email}</p>
                            )}
                            {rsvp.main_guest.phone && (
                              <p className="text-sm text-gray-600">{rsvp.main_guest.phone}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {getStatusBadge(rsvp.status)}
                            {getAttendanceBadge(rsvp.attendance)}
                          </div>
                        </div>

                        {rsvp.additional_guests.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-700 mb-1">Additional Guests:</p>
                            <div className="flex flex-wrap gap-1">
                              {rsvp.additional_guests.map((guest, index) => (
                                <Badge key={index} variant="outline">
                                  {guest.name} {guest.surname}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {(rsvp.dietary_requirements || rsvp.special_notes) && (
                          <div className="mb-3 space-y-2">
                            {rsvp.dietary_requirements && (
                              <div>
                                <p className="text-sm font-medium text-gray-700">Dietary Requirements:</p>
                                <p className="text-sm text-gray-600">{rsvp.dietary_requirements}</p>
                              </div>
                            )}
                            {rsvp.special_notes && (
                              <div>
                                <p className="text-sm font-medium text-gray-700">Special Notes:</p>
                                <p className="text-sm text-gray-600">{rsvp.special_notes}</p>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="text-xs text-gray-500">
                          Submitted: {new Date(rsvp.submitted_at).toLocaleString()}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
