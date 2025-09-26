"use client";

import { useEffect, useState } from "react";
import { useAuth } from '@/components/supabase-auth-provider'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Save, RefreshCw, Plus, Trash2 } from "lucide-react";

interface EventDetails {
  id: string;
  www_id: string;
  title: string;
  couple_names: string;
  event_date: string;
  venue: string;
  description: string;
  sectionContent: {
    heroSection?: {
      coupleNames: string;
      eventDate: string;
      venue: string;
      customMessage: string;
    };
    timelineSection?: {
      title: string;
      events: Array<{
        time: string;
        title: string;
        description: string;
      }>;
    };
    menuSection?: {
      title: string;
      items: Array<{
        category: string;
        items: string[];
      }>;
    };
    teamSection?: {
      title: string;
      description: string;
      members: Array<{
        name: string;
        role: string;
        description: string;
      }>;
    };
  };
}

export default function EventDetailsPage() {
  const { user, userProfile, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const wwwId = params.wwwId as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null)
  const [activeTab, setActiveTab] = useState<'hero' | 'timeline' | 'menu' | 'team'>('hero')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user && !['superadmin', 'organizer'].includes(userProfile?.role || '')) {
      router.push('/dashboard')
    } else if (user && ['superadmin', 'organizer'].includes(userProfile?.role || '')) {
      fetchEventDetails()
    }
  }, [user, userProfile, authLoading, router, wwwId]);

  const fetchEventDetails = async () => {
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
        throw new Error('Failed to fetch event details')
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        setEventDetails({
          id: result.data.id,
          www_id: result.data.wwwId,
          title: result.data.title,
          couple_names: result.data.coupleNames,
          event_date: result.data.eventDate,
          venue: result.data.venue,
          description: result.data.description,
          sectionContent: result.data.sectionContent || {}
        })
      }
    } catch (error) {
      console.error('Error fetching event details:', error)
      toast({
        title: "Error",
        description: "Failed to load event details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!eventDetails) return

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
          sectionContent: eventDetails.sectionContent
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update event details')
      }

      toast({
        title: "Success",
        description: "Event details updated successfully",
      })
    } catch (error) {
      console.error('Error saving event details:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save details",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const addTimelineEvent = () => {
    if (!eventDetails) return
    
    const newEvent = {
      time: '',
      title: '',
      description: ''
    }
    
    setEventDetails(prev => ({
      ...prev!,
      sectionContent: {
        ...prev!.sectionContent,
        timelineSection: {
          ...prev!.sectionContent.timelineSection,
          title: prev!.sectionContent.timelineSection?.title || 'Timeline',
          events: [...(prev!.sectionContent.timelineSection?.events || []), newEvent]
        }
      }
    }))
  }

  const removeTimelineEvent = (index: number) => {
    if (!eventDetails) return
    
    setEventDetails(prev => ({
      ...prev!,
      sectionContent: {
        ...prev!.sectionContent,
        timelineSection: {
          ...prev!.sectionContent.timelineSection!,
          events: prev!.sectionContent.timelineSection?.events.filter((_, i) => i !== index) || []
        }
      }
    }))
  }

  const addMenuCategory = () => {
    if (!eventDetails) return
    
    const newCategory = {
      category: '',
      items: ['']
    }
    
    setEventDetails(prev => ({
      ...prev!,
      sectionContent: {
        ...prev!.sectionContent,
        menuSection: {
          ...prev!.sectionContent.menuSection,
          title: prev!.sectionContent.menuSection?.title || 'Menu',
          items: [...(prev!.sectionContent.menuSection?.items || []), newCategory]
        }
      }
    }))
  }

  const addTeamMember = () => {
    if (!eventDetails) return
    
    const newMember = {
      name: '',
      role: '',
      description: ''
    }
    
    setEventDetails(prev => ({
      ...prev!,
      sectionContent: {
        ...prev!.sectionContent,
        teamSection: {
          ...prev!.sectionContent.teamSection,
          title: prev!.sectionContent.teamSection?.title || 'Wedding Team',
          description: prev!.sectionContent.teamSection?.description || '',
          members: [...(prev!.sectionContent.teamSection?.members || []), newMember]
        }
      }
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading event details...</div>
      </div>
    )
  }

  if (!eventDetails) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Event not found</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Event Content Management</CardTitle>
              <CardDescription>Edit the content and details of your event</CardDescription>
            </div>
            <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="hero">Hero Section</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="menu">Menu</TabsTrigger>
              <TabsTrigger value="team">Wedding Team</TabsTrigger>
            </TabsList>

            <TabsContent value="hero" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="coupleNames">Couple Names</Label>
                  <Input
                    id="coupleNames"
                    value={eventDetails.sectionContent.heroSection?.coupleNames || ''}
                    onChange={(e) => setEventDetails(prev => ({
                      ...prev!,
                      sectionContent: {
                        ...prev!.sectionContent,
                        heroSection: {
                          ...prev!.sectionContent.heroSection!,
                          coupleNames: e.target.value
                        }
                      }
                    }))}
                    placeholder="e.g., John & Jane"
                  />
                </div>
                <div>
                  <Label htmlFor="eventDate">Event Date</Label>
                  <Input
                    id="eventDate"
                    type="date"
                    value={eventDetails.sectionContent.heroSection?.eventDate || ''}
                    onChange={(e) => setEventDetails(prev => ({
                      ...prev!,
                      sectionContent: {
                        ...prev!.sectionContent,
                        heroSection: {
                          ...prev!.sectionContent.heroSection!,
                          eventDate: e.target.value
                        }
                      }
                    }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="venue">Venue</Label>
                <Input
                  id="venue"
                  value={eventDetails.sectionContent.heroSection?.venue || ''}
                  onChange={(e) => setEventDetails(prev => ({
                    ...prev!,
                    sectionContent: {
                      ...prev!.sectionContent,
                      heroSection: {
                        ...prev!.sectionContent.heroSection!,
                        venue: e.target.value
                      }
                    }
                  }))}
                  placeholder="Enter venue name"
                />
              </div>
              <div>
                <Label htmlFor="customMessage">Custom Message</Label>
                <Textarea
                  id="customMessage"
                  value={eventDetails.sectionContent.heroSection?.customMessage || ''}
                  onChange={(e) => setEventDetails(prev => ({
                    ...prev!,
                    sectionContent: {
                      ...prev!.sectionContent,
                      heroSection: {
                        ...prev!.sectionContent.heroSection!,
                        customMessage: e.target.value
                      }
                    }
                  }))}
                  placeholder="Enter a custom message for your guests"
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Event Timeline</h3>
                <Button onClick={addTimelineEvent} size="sm" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Event
                </Button>
              </div>
              
              {eventDetails.sectionContent.timelineSection?.events?.map((event, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium">Event {index + 1}</h4>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeTimelineEvent(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Time</Label>
                      <Input
                        value={event.time}
                        onChange={(e) => {
                          const newEvents = [...(eventDetails.sectionContent.timelineSection?.events || [])]
                          newEvents[index].time = e.target.value
                          setEventDetails(prev => ({
                            ...prev!,
                            sectionContent: {
                              ...prev!.sectionContent,
                              timelineSection: {
                                ...prev!.sectionContent.timelineSection!,
                                events: newEvents
                              }
                            }
                          }))
                        }}
                        placeholder="e.g., 2:00 PM"
                      />
                    </div>
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={event.title}
                        onChange={(e) => {
                          const newEvents = [...(eventDetails.sectionContent.timelineSection?.events || [])]
                          newEvents[index].title = e.target.value
                          setEventDetails(prev => ({
                            ...prev!,
                            sectionContent: {
                              ...prev!.sectionContent,
                              timelineSection: {
                                ...prev!.sectionContent.timelineSection!,
                                events: newEvents
                              }
                            }
                          }))
                        }}
                        placeholder="e.g., Ceremony"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input
                        value={event.description}
                        onChange={(e) => {
                          const newEvents = [...(eventDetails.sectionContent.timelineSection?.events || [])]
                          newEvents[index].description = e.target.value
                          setEventDetails(prev => ({
                            ...prev!,
                            sectionContent: {
                              ...prev!.sectionContent,
                              timelineSection: {
                                ...prev!.sectionContent.timelineSection!,
                                events: newEvents
                              }
                            }
                          }))
                        }}
                        placeholder="Brief description"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="menu" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Menu Items</h3>
                <Button onClick={addMenuCategory} size="sm" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Category
                </Button>
              </div>
              
              {eventDetails.sectionContent.menuSection?.items?.map((category, categoryIndex) => (
                <Card key={categoryIndex} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium">Category {categoryIndex + 1}</h4>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        const newItems = eventDetails.sectionContent.menuSection?.items.filter((_, i) => i !== categoryIndex) || []
                        setEventDetails(prev => ({
                          ...prev!,
                          sectionContent: {
                            ...prev!.sectionContent,
                            menuSection: {
                              ...prev!.sectionContent.menuSection!,
                              items: newItems
                            }
                          }
                        }))
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label>Category Name</Label>
                      <Input
                        value={category.category}
                        onChange={(e) => {
                          const newItems = [...(eventDetails.sectionContent.menuSection?.items || [])]
                          newItems[categoryIndex].category = e.target.value
                          setEventDetails(prev => ({
                            ...prev!,
                            sectionContent: {
                              ...prev!.sectionContent,
                              menuSection: {
                                ...prev!.sectionContent.menuSection!,
                                items: newItems
                              }
                            }
                          }))
                        }}
                        placeholder="e.g., Appetizers"
                      />
                    </div>
                    <div>
                      <Label>Menu Items (one per line)</Label>
                      <Textarea
                        value={category.items.join('\n')}
                        onChange={(e) => {
                          const newItems = [...(eventDetails.sectionContent.menuSection?.items || [])]
                          newItems[categoryIndex].items = e.target.value.split('\n').filter(item => item.trim())
                          setEventDetails(prev => ({
                            ...prev!,
                            sectionContent: {
                              ...prev!.sectionContent,
                              menuSection: {
                                ...prev!.sectionContent.menuSection!,
                                items: newItems
                              }
                            }
                          }))
                        }}
                        placeholder="Enter menu items, one per line"
                        rows={4}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="team" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Wedding Team</h3>
                <Button onClick={addTeamMember} size="sm" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Member
                </Button>
              </div>
              
              {eventDetails.sectionContent.teamSection?.members?.map((member, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium">Team Member {index + 1}</h4>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        const newMembers = eventDetails.sectionContent.teamSection?.members.filter((_, i) => i !== index) || []
                        setEventDetails(prev => ({
                          ...prev!,
                          sectionContent: {
                            ...prev!.sectionContent,
                            teamSection: {
                              ...prev!.sectionContent.teamSection!,
                              members: newMembers
                            }
                          }
                        }))
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={member.name}
                        onChange={(e) => {
                          const newMembers = [...(eventDetails.sectionContent.teamSection?.members || [])]
                          newMembers[index].name = e.target.value
                          setEventDetails(prev => ({
                            ...prev!,
                            sectionContent: {
                              ...prev!.sectionContent,
                              teamSection: {
                                ...prev!.sectionContent.teamSection!,
                                members: newMembers
                              }
                            }
                          }))
                        }}
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <Label>Role</Label>
                      <Input
                        value={member.role}
                        onChange={(e) => {
                          const newMembers = [...(eventDetails.sectionContent.teamSection?.members || [])]
                          newMembers[index].role = e.target.value
                          setEventDetails(prev => ({
                            ...prev!,
                            sectionContent: {
                              ...prev!.sectionContent,
                              teamSection: {
                                ...prev!.sectionContent.teamSection!,
                                members: newMembers
                              }
                            }
                          }))
                        }}
                        placeholder="e.g., Maid of Honor"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input
                        value={member.description}
                        onChange={(e) => {
                          const newMembers = [...(eventDetails.sectionContent.teamSection?.members || [])]
                          newMembers[index].description = e.target.value
                          setEventDetails(prev => ({
                            ...prev!,
                            sectionContent: {
                              ...prev!.sectionContent,
                              teamSection: {
                                ...prev!.sectionContent.teamSection!,
                                members: newMembers
                              }
                            }
                          }))
                        }}
                        placeholder="Brief description"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
