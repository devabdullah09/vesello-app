"use client";
import { useEffect, useState } from "react";
import { useEvents, useAuth } from '@/hooks/use-dashboard'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/components/language-context'
import { useEventEdition } from '@/components/event-edition-context'

export default function EventsListPage() {
  const { events, loading, error, fetchEvents, createEvent, updateEvent, deleteEvent } = useEvents()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { t } = useLanguage()
  const { setSelectedEvent } = useEventEdition()
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    coupleNames: "",
    eventDate: "",
    venue: "",
    description: "",
    galleryEnabled: false,
    rsvpEnabled: false,
  });

  // Filter states
  const [filters, setFilters] = useState({
    wwwId: "",
    organizer: "",
    dateFrom: "",
    dateTo: "",
    status: "",
    search: ""
  });

  // Filtered events
  const [filteredEvents, setFilteredEvents] = useState(events);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user) {
      fetchEvents()
    }
  }, [user, authLoading, router]);

  // Filter events when events or filters change
  useEffect(() => {
    let filtered = [...events];

    if (filters.wwwId) {
      filtered = filtered.filter(event => 
        event.wwwId.toLowerCase().includes(filters.wwwId.toLowerCase())
      );
    }

    if (filters.organizer) {
      filtered = filtered.filter(event => 
        event.organizerId && event.organizerId.toLowerCase().includes(filters.organizer.toLowerCase())
      );
    }

    if (filters.status) {
      filtered = filtered.filter(event => event.status === filters.status);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(event => 
        new Date(event.eventDate) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(event => 
        new Date(event.eventDate) <= new Date(filters.dateTo)
      );
    }

    if (filters.search) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        event.coupleNames.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  }, [events, filters]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">{t.status.loading}</div>
      </div>
    )
  }

  if (!user) return null;

  const resetForm = () => {
    setForm({
      title: "",
      coupleNames: "",
      eventDate: "",
      venue: "",
      description: "",
      galleryEnabled: false,
      rsvpEnabled: false,
    })
  }

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return ""
    try {
      const d = new Date(dateString)
      if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10)
      return dateString.slice(0, 10)
    } catch {
      return dateString
    }
  }

  const openCreateModal = () => {
    setIsEdit(false)
    setEditingEventId(null)
    resetForm()
    setShowModal(true)
  }

  const openEditModal = (event: any) => {
    setIsEdit(true)
    setEditingEventId(event.id)
    setForm({
      title: event.title || "",
      coupleNames: event.coupleNames || "",
      eventDate: formatDateForInput(event.eventDate || ""),
      venue: event.venue || "",
      description: event.description || "",
      galleryEnabled: !!event.galleryEnabled,
      rsvpEnabled: !!event.rsvpEnabled,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (isEdit && editingEventId) {
        await updateEvent(editingEventId, {
          title: form.title,
          coupleNames: form.coupleNames,
          eventDate: form.eventDate,
          venue: form.venue,
          description: form.description,
          galleryEnabled: form.galleryEnabled,
          rsvpEnabled: form.rsvpEnabled,
        })
      } else {
        await createEvent({
          title: form.title,
          coupleNames: form.coupleNames,
          eventDate: form.eventDate,
          venue: form.venue,
          description: form.description,
          galleryEnabled: form.galleryEnabled,
          rsvpEnabled: form.rsvpEnabled,
        })
        
        // Trigger storage event to notify other tabs about new event
        localStorage.setItem('event-created', Date.now().toString())
        localStorage.removeItem('event-created') // Remove immediately to trigger storage event
      }
      setShowModal(false)
      resetForm()
      setIsEdit(false)
      setEditingEventId(null)
    } catch (error) {
      console.error('Error creating event:', error)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm(t.dashboard.confirm)) {
      try {
        await deleteEvent(eventId)
      } catch (error) {
        console.error('Error deleting event:', error)
      }
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      wwwId: "",
      organizer: "",
      dateFrom: "",
      dateTo: "",
      status: "",
      search: ""
    });
  };

  const handleManageClick = async (event: any) => {
    // Set the selected event in context
    const eventData = {
      id: event.id,
      wwwId: event.wwwId,
      title: event.title,
      coupleNames: event.coupleNames,
      eventDate: event.eventDate,
      venue: event.venue,
      status: event.status,
      galleryEnabled: event.galleryEnabled,
      rsvpEnabled: event.rsvpEnabled,
      eventUrl: `/${event.wwwId}`
    };
    setSelectedEvent(eventData);
    router.push('/dashboard/events-edition');
  };

  return (
    <div className="flex-1 p-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-black">{t.dashboard.events}</h1>
        <button
          className="bg-gradient-to-r from-[#E5B574] via-[#D59C58] to-[#C18037] text-white font-semibold px-6 py-2 rounded-md shadow-md hover:from-[#D59C58] hover:to-[#E5B574] transition-colors"
          onClick={openCreateModal}
        >
          {t.dashboard.createEvent}
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {t.status.error}: {error}
        </div>
      )}

      {/* Filter Section */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Filter Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event ID</label>
            <input 
              className="w-full border rounded px-3 py-2" 
              placeholder="Enter WWW ID..." 
              value={filters.wwwId}
              onChange={(e) => handleFilterChange('wwwId', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Organizer</label>
            <input 
              className="w-full border rounded px-3 py-2" 
              placeholder="Enter organizer..." 
              value={filters.organizer}
              onChange={(e) => handleFilterChange('organizer', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select 
              className="w-full border rounded px-3 py-2" 
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="planned">Planned</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
            <input 
              type="date"
              className="w-full border rounded px-3 py-2" 
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
            <input 
              type="date"
              className="w-full border rounded px-3 py-2" 
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input 
              className="w-full border rounded px-3 py-2" 
              placeholder="Search by title or couple names..." 
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
        </div>
        <button 
          onClick={clearFilters}
          className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500 transition-colors"
        >
          Clear Filters
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg border">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">WWW ID</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{t.dashboard.eventName}</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">COUPLE</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{t.dashboard.eventDate}</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{t.dashboard.eventStatus}</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{t.dashboard.gallery}</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">RSVP</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{t.dashboard.actions}</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                  {events.length === 0 ? t.dashboard.noEvents : t.status.noData}
                </td>
              </tr>
            ) : (
              filteredEvents.map((event, idx) => (
                <tr key={event.id} className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{event.wwwId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{event.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{event.coupleNames}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(event.eventDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      event.status === 'active' ? 'bg-green-100 text-green-800' :
                      event.status === 'planned' ? 'bg-blue-100 text-blue-800' :
                      event.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {event.galleryEnabled ? <input type="checkbox" checked readOnly className="w-4 h-4" /> : <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {event.rsvpEnabled ? <span role="img" aria-label="rsvp" className="text-lg">📷</span> : <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      className="text-green-600 font-semibold mr-2 hover:text-green-800"
                      onClick={() => handleManageClick(event)}
                    >
                      {t.dashboard.manage}
                    </button>
                    <button 
                      className="text-blue-600 font-semibold mr-2 hover:text-blue-800"
                      onClick={() => openEditModal(event)}
                    >
                      {t.forms.edit}
                    </button>
                    <button 
                      className="text-red-500 font-semibold hover:text-red-700"
                      onClick={() => handleDeleteEvent(event.id)}
                    >
                      {t.forms.delete}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Event Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <h2 className="text-lg font-semibold mb-4">{isEdit ? 'Edit Event' : 'Add New Event'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Event Title</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Enter event title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Couple Names</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={form.coupleNames}
                  onChange={e => setForm(f => ({ ...f, coupleNames: e.target.value }))}
                  placeholder="e.g., John & Jane"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Event Date</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  type="date"
                  value={form.eventDate}
                  onChange={e => setForm(f => ({ ...f, eventDate: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Venue (Optional)</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={form.venue}
                  onChange={e => setForm(f => ({ ...f, venue: e.target.value }))}
                  placeholder="Enter venue name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                <textarea
                  className="w-full border rounded px-3 py-2"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Enter event description"
                  rows={3}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={form.galleryEnabled}
                    onChange={e => setForm(f => ({ ...f, galleryEnabled: e.target.checked }))}
                  />
                  Enable Gallery Module
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={form.rsvpEnabled}
                    onChange={e => setForm(f => ({ ...f, rsvpEnabled: e.target.checked }))}
                  />
                  Enable RSVP Module
                </label>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[#6C63FF] text-white font-semibold hover:bg-[#554ee0]"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 