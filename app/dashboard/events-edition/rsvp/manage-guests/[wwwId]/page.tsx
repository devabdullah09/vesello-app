"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Search, Filter, Download, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Event {
  id: string;
  wwwId: string;
  title: string;
  coupleName: string;
  eventDate: string;
  venue: string;
}

interface CustomQuestion {
  id: string;
  title: string;
  question_type: string;
  options: string[];
}

interface Guest {
  id: string;
  main_guest: { name: string; surname: string };
  additional_guests: any[];
  wedding_day_attendance: { [key: string]: string };
  after_party_attendance: { [key: string]: string };
  food_preferences: { [key: string]: string };
  accommodation_needed: { [key: string]: string };
  transportation_needed: { [key: string]: string };
  notes: { [key: string]: string };
  email: string;
  send_email_confirmation: boolean;
  custom_responses: { [key: string]: any };
  submitted_at: string;
  status: string;
}

interface IndividualGuest {
  id: string;
  rsvpId: string;
  name: string;
  surname: string;
  email: string;
  wedding_day_attendance: string;
  after_party_attendance: string;
  food_preference: string;
  accommodation_needed: string;
  transportation_needed: string;
  notes: string;
  custom_responses: { [key: string]: any };
  submitted_at: string;
  status: string;
}

export default function EventGuestListPage() {
  const params = useParams();
  const router = useRouter();
  const wwwId = params?.wwwId as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [individualGuests, setIndividualGuests] = useState<IndividualGuest[]>([]);
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedGuests, setSelectedGuests] = useState<Set<string>>(new Set());
  const [selectedGuest, setSelectedGuest] = useState<IndividualGuest | null>(null);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGuest, setEditingGuest] = useState<IndividualGuest | null>(null);
  const [hiddenGuests, setHiddenGuests] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (wwwId) {
      fetchGuestData();
    }
  }, [wwwId]);

  const transformGuestsToIndividual = (guests: Guest[]): IndividualGuest[] => {
    const individualGuests: IndividualGuest[] = [];
    
    guests.forEach(guest => {
      // Add main guest
      individualGuests.push({
        id: `${guest.id}-main`,
        rsvpId: guest.id,
        name: guest.main_guest.name,
        surname: guest.main_guest.surname,
        email: guest.email,
        wedding_day_attendance: guest.wedding_day_attendance[guest.main_guest.name] || 'No',
        after_party_attendance: guest.after_party_attendance[guest.main_guest.name] || 'No',
        food_preference: guest.food_preferences[guest.main_guest.name] || 'Regular',
        accommodation_needed: guest.accommodation_needed[guest.main_guest.name] || 'No',
        transportation_needed: guest.transportation_needed[guest.main_guest.name] || 'No',
        notes: guest.notes[guest.main_guest.name] || '',
        custom_responses: guest.custom_responses,
        submitted_at: guest.submitted_at,
        status: guest.status
      });

      // Add additional guests
      guest.additional_guests?.forEach((additionalGuest, index) => {
        if (additionalGuest.name) {
          individualGuests.push({
            id: `${guest.id}-additional-${index}`,
            rsvpId: guest.id,
            name: additionalGuest.name,
            surname: additionalGuest.surname || '',
            email: '', // Additional guests don't have separate emails
            wedding_day_attendance: guest.wedding_day_attendance[additionalGuest.name] || 'No',
            after_party_attendance: guest.after_party_attendance[additionalGuest.name] || 'No',
            food_preference: guest.food_preferences[additionalGuest.name] || 'Regular',
            accommodation_needed: guest.accommodation_needed[additionalGuest.name] || 'No',
            transportation_needed: guest.transportation_needed[additionalGuest.name] || 'No',
            notes: guest.notes[additionalGuest.name] || '',
            custom_responses: guest.custom_responses,
            submitted_at: guest.submitted_at,
            status: guest.status
          });
        }
      });
    });

    return individualGuests;
  };

  const fetchGuestData = async () => {
    try {
      setLoading(true);
      
      // Temporarily skip authentication for debugging
      const response = await fetch(`/api/dashboard/events/rsvp-guests/${wwwId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch guest data');
      }

      const data = await response.json();
      setEvent(data.event);
      setGuests(data.guests);
      setCustomQuestions(data.customQuestions);
      
      // Transform guests to individual entries
      const transformedGuests = transformGuestsToIndividual(data.guests);
      setIndividualGuests(transformedGuests);
    } catch (error) {
      console.error('Error fetching guest data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load guest data');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/dashboard/events-edition/rsvp/manage-guests');
  };

  const handleSelectGuest = (guestId: string) => {
    const newSelected = new Set(selectedGuests);
    if (newSelected.has(guestId)) {
      newSelected.delete(guestId);
    } else {
      newSelected.add(guestId);
    }
    setSelectedGuests(newSelected);
  };

  const handleViewGuest = (guest: Guest) => {
    // Convert Guest to IndividualGuest format
    const individualGuest: IndividualGuest = {
      id: guest.id,
      rsvpId: guest.id, // Using guest.id as rsvpId
      name: guest.main_guest.name,
      surname: guest.main_guest.surname,
      email: guest.email,
      wedding_day_attendance: guest.wedding_day_attendance[guest.main_guest.name] || '',
      after_party_attendance: guest.after_party_attendance[guest.main_guest.name] || '',
      food_preference: guest.food_preferences[guest.main_guest.name] || '',
      accommodation_needed: guest.accommodation_needed[guest.main_guest.name] || '',
      transportation_needed: guest.transportation_needed[guest.main_guest.name] || '',
      notes: guest.notes[guest.main_guest.name] || '',
      custom_responses: guest.custom_responses || {},
      submitted_at: guest.submitted_at || '',
      status: guest.status || 'pending'
    };
    setSelectedGuest(individualGuest);
    setShowGuestModal(true);
  };

  const handleViewIndividualGuest = (guest: IndividualGuest) => {
    setSelectedGuest(guest);
    setShowGuestModal(true);
  };

  const handleSelectAll = () => {
    if (selectedGuests.size === filteredGuests.length) {
      setSelectedGuests(new Set());
    } else {
      setSelectedGuests(new Set(filteredGuests.map(g => g.id)));
    }
  };

  const getAttendanceStatus = (attendance: { [key: string]: string }) => {
    const values = Object.values(attendance);
    if (values.every(v => v === 'will' || v === 'Yes')) return 'Yes';
    if (values.every(v => v === 'cant' || v === 'No')) return 'No';
    if (values.some(v => v === 'will' || v === 'Yes')) return 'Partial';
    return 'No';
  };

  const formatGuestChoices = (choices: { [key: string]: string }) => {
    if (!choices || Object.keys(choices).length === 0) return '----';
    
    const formatted = Object.entries(choices)
      .filter(([_, value]) => value && value.trim() !== '')
      .map(([guest, choice]) => `${guest}: ${choice}`)
      .join(', ');
    
    return formatted || '----';
  };

  const formatFoodPreferences = (preferences: { [key: string]: string }) => {
    if (!preferences || Object.keys(preferences).length === 0) return '----';
    
    const formatted = Object.entries(preferences)
      .filter(([_, value]) => value && value.trim() !== '')
      .map(([guest, preference]) => `${guest}: ${preference}`)
      .join(', ');
    
    return formatted || '----';
  };

  const formatCustomResponses = (responses: { [key: string]: any }, questionId: string) => {
    if (!responses || !responses[questionId]) return '----';
    
    const response = responses[questionId];
    if (typeof response === 'object' && response !== null) {
      const formatted = Object.entries(response)
        .filter(([_, value]) => value && value.toString().trim() !== '')
        .map(([guest, answer]) => `${guest}: ${answer}`)
        .join(', ');
      return formatted || '----';
    }
    
    return response.toString() || '----';
  };

  const getGuestNames = (guest: Guest) => {
    const names = [guest.main_guest.name];
    if (guest.additional_guests && guest.additional_guests.length > 0) {
      names.push(...guest.additional_guests.map(g => g.name).filter(Boolean));
    }
    return names;
  };

  const filteredGuests = individualGuests.filter(guest => {
    // Filter out hidden guests
    if (hiddenGuests.has(guest.id)) return false;
    
    const matchesSearch = searchTerm === '' || 
      guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (filterStatus === 'all') return true;
    if (filterStatus === 'confirmed') return guest.wedding_day_attendance === 'Yes' || guest.wedding_day_attendance === 'will';
    if (filterStatus === 'declined') return guest.wedding_day_attendance === 'No' || guest.wedding_day_attendance === 'cant';
    if (filterStatus === 'partial') return guest.wedding_day_attendance === 'Partial';
    
    return true;
  });

  const downloadGuestList = () => {
    if (individualGuests.length === 0) {
      alert('No guests to download');
      return;
    }

    // Create CSV headers
    const headers = [
      'Name',
      'Surname', 
      'Email',
      'Wedding Day Attendance',
      'After Party Attendance',
      'Food Preference',
      'Accommodation Needed',
      'Transportation Needed',
      ...customQuestions.map(q => q.title),
      'Notes',
      'Submitted At',
      'Status'
    ];

    // Create CSV rows
    const rows = individualGuests.map(guest => [
      guest.name,
      guest.surname,
      guest.email,
      guest.wedding_day_attendance,
      guest.after_party_attendance,
      guest.food_preference,
      guest.accommodation_needed,
      guest.transportation_needed,
      ...customQuestions.map(q => {
        const response = guest.custom_responses[q.id];
        if (typeof response === 'object' && response !== null) {
          return Object.entries(response).map(([guestName, answer]) => `${guestName}: ${answer}`).join(', ');
        }
        return response || '';
      }),
      guest.notes,
      new Date(guest.submitted_at).toLocaleDateString(),
      guest.status
    ]);

    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `guest-list-${event?.title?.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addGuest = () => {
    setShowAddGuestModal(true);
  };

  const handleEditGuest = (guest: IndividualGuest) => {
    setEditingGuest(guest);
    setShowEditModal(true);
  };

  const handleDeleteGuest = (guest: IndividualGuest) => {
    if (confirm(`Are you sure you want to delete ${guest.name} ${guest.surname}? This action cannot be undone.`)) {
      // TODO: Implement actual delete functionality
      alert(`Delete functionality for ${guest.name} ${guest.surname} will be implemented`);
      // For now, just remove from the list locally
      setIndividualGuests(prev => prev.filter(g => g.id !== guest.id));
    }
  };

  const handleHideGuest = (guest: IndividualGuest) => {
    const newHiddenGuests = new Set(hiddenGuests);
    if (hiddenGuests.has(guest.id)) {
      newHiddenGuests.delete(guest.id);
    } else {
      newHiddenGuests.add(guest.id);
    }
    setHiddenGuests(newHiddenGuests);
  };

  if (loading) {
    return (
      <div className="flex-1 p-12 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading guest list...</div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex-1 p-12 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error || 'Event not found'}</p>
          <button
            onClick={handleBack}
            className="bg-[#E5B574] text-white px-6 py-2 rounded-md hover:bg-[#D59C58] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-12 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-start mb-8">
        <button
          onClick={handleBack}
          className="bg-black text-white px-6 py-2 rounded font-semibold hover:bg-gray-800 transition-colors"
        >
          Back
        </button>
      </div>
      
      <h1 className="text-3xl font-bold text-black mb-8">MANAGE GUEST LISTS</h1>
      
      {/* Event Info */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-xl font-semibold text-black mb-4">Event Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">Event Title</label>
            <p className="text-lg font-medium text-black">{event.title}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Couple Names</label>
            <p className="text-lg font-medium text-black">{event.coupleName}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Event Date</label>
            <p className="text-lg font-medium text-black">
              {new Date(event.eventDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Venue</label>
            <p className="text-lg font-medium text-black">{event.venue || 'Not specified'}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Find Guests"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#E5B574] focus:border-[#E5B574]"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#E5B574] focus:border-[#E5B574]"
            >
              <option value="all">All Guests</option>
              <option value="confirmed">Confirmed</option>
              <option value="declined">Declined</option>
              <option value="partial">Partial</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={downloadGuestList}
              className="flex items-center gap-2 bg-[#E5B574] text-white px-4 py-2 rounded-md hover:bg-[#D59C58] transition-colors"
            >
              <Download className="h-4 w-4" />
              Download List
            </button>
            <button
              onClick={addGuest}
              className="flex items-center gap-2 bg-[#E5B574] text-white px-4 py-2 rounded-md hover:bg-[#D59C58] transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Guest
            </button>
          </div>
        </div>
      </div>

      {/* Guest List Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedGuests.size === filteredGuests.length && filteredGuests.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-[#E5B574] focus:ring-[#E5B574]"
                      />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Surname
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RSVP Status (Wedding Day)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RSVP Status (After Party)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Is it child?
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Child's age
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Meal Preference
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Accommodation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transport
                  </th>
                  {customQuestions.map((question) => (
                    <th key={question.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {question.title}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Note
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGuests.map((guest) => {
                  const weddingStatus = guest.wedding_day_attendance === 'will' ? 'Yes' : guest.wedding_day_attendance === 'cant' ? 'No' : guest.wedding_day_attendance;
                  const afterPartyStatus = guest.after_party_attendance === 'will' ? 'Yes' : guest.after_party_attendance === 'cant' ? 'No' : guest.after_party_attendance;
                  
                  return (
                    <tr key={guest.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedGuests.has(guest.id)}
                          onChange={() => handleSelectGuest(guest.id)}
                          className="rounded border-gray-300 text-[#E5B574] focus:ring-[#E5B574]"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {guest.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {guest.surname}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          weddingStatus === 'Yes' ? 'bg-green-100 text-green-800' :
                          weddingStatus === 'No' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {weddingStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          afterPartyStatus === 'Yes' ? 'bg-green-100 text-green-800' :
                          afterPartyStatus === 'No' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {afterPartyStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {guest.rsvpId.includes('additional') ? 'Yes' : 'No'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {guest.rsvpId.includes('additional') ? 'Additional Guest' : '----'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                        <div className="truncate" title={guest.food_preference}>
                          {guest.food_preference}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                        <div className="truncate" title={guest.accommodation_needed}>
                          {guest.accommodation_needed}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                        <div className="truncate" title={guest.transportation_needed}>
                          {guest.transportation_needed}
                        </div>
                      </td>
                      {customQuestions.map((question) => (
                        <td key={question.id} className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                          <div className="truncate" title={formatCustomResponses(guest.custom_responses, question.id)}>
                            {formatCustomResponses(guest.custom_responses, question.id)}
                          </div>
                        </td>
                      ))}
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                        <div className="truncate" title={guest.notes}>
                          {guest.notes || '----'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {guest.email || ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleViewIndividualGuest(guest)}
                            className="text-[#E5B574] hover:text-[#D59C58]"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEditGuest(guest)}
                            className="text-[#E5B574] hover:text-[#D59C58]" 
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteGuest(guest)}
                            className="text-red-600 hover:text-red-900" 
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        {filteredGuests.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Guests Found</h3>
            <p className="text-gray-600">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'No guests have RSVP\'d for this event yet.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Guest Details Modal */}
      {showGuestModal && selectedGuest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-lg">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-black">
                  Guest Details - {selectedGuest.name} {selectedGuest.surname}
                </h2>
                <button
                  onClick={() => setShowGuestModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Guest Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-black mb-3">Guest Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium text-gray-700">Name:</span> <span className="text-black">{selectedGuest.name} {selectedGuest.surname}</span></p>
                    <p><span className="font-medium text-gray-700">Email:</span> <span className="text-black">{selectedGuest.email || 'Not provided'}</span></p>
                    <p><span className="font-medium text-gray-700">Guest Type:</span> <span className="text-black">{selectedGuest.rsvpId.includes('additional') ? 'Additional Guest' : 'Main Guest'}</span></p>
                    <p><span className="font-medium text-gray-700">Status:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        selectedGuest.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        selectedGuest.status === 'pending' ? 'bg-[#E5B574] text-white' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedGuest.status}
                      </span>
                    </p>
                    <p><span className="font-medium text-gray-700">Submitted:</span> <span className="text-black">{new Date(selectedGuest.submitted_at).toLocaleDateString()}</span></p>
                  </div>
                </div>

                {/* Wedding Day Attendance */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-black mb-3">Wedding Day Attendance</h3>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">{selectedGuest.name}:</span> 
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                        selectedGuest.wedding_day_attendance === 'will' || selectedGuest.wedding_day_attendance === 'Yes' ? 'bg-green-100 text-green-800' :
                        selectedGuest.wedding_day_attendance === 'cant' || selectedGuest.wedding_day_attendance === 'No' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedGuest.wedding_day_attendance}
                      </span>
                    </p>
                  </div>
                </div>

                {/* After Party Attendance */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-black mb-3">After Party Attendance</h3>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">{selectedGuest.name}:</span> 
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                        selectedGuest.after_party_attendance === 'will' || selectedGuest.after_party_attendance === 'Yes' ? 'bg-green-100 text-green-800' :
                        selectedGuest.after_party_attendance === 'cant' || selectedGuest.after_party_attendance === 'No' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedGuest.after_party_attendance}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Food Preferences */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-black mb-3">Food Preferences</h3>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">{selectedGuest.name}:</span> {selectedGuest.food_preference}
                    </p>
                  </div>
                </div>

                {/* Accommodation */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-black mb-3">Accommodation</h3>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">{selectedGuest.name}:</span> {selectedGuest.accommodation_needed}
                    </p>
                  </div>
                </div>

                {/* Transportation */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-black mb-3">Transportation</h3>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">{selectedGuest.name}:</span> {selectedGuest.transportation_needed}
                    </p>
                  </div>
                </div>

                {/* Custom Questions */}
                {customQuestions.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                    <h3 className="font-semibold text-black mb-3">Custom Questions</h3>
                    <div className="space-y-3">
                      {customQuestions.map((question) => (
                        <div key={question.id}>
                          <p className="font-medium text-sm text-gray-700">{question.title}</p>
                          <div className="mt-1">
                            {selectedGuest.custom_responses && selectedGuest.custom_responses[question.id] ? (
                              typeof selectedGuest.custom_responses[question.id] === 'object' ? (
                                Object.entries(selectedGuest.custom_responses[question.id]).map(([guest, answer]) => (
                                  <p key={guest} className="text-sm text-gray-600 ml-2">
                                    <span className="font-medium">{guest}:</span> {String(answer)}
                                  </p>
                                ))
                              ) : (
                                <p className="text-sm text-gray-600 ml-2">{selectedGuest.custom_responses[question.id]}</p>
                              )
                            ) : (
                              <p className="text-sm text-gray-500 ml-2">No response</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                  <h3 className="font-semibold text-black mb-3">Notes</h3>
                  {selectedGuest.notes && selectedGuest.notes.trim() ? (
                    <p className="text-sm">
                      <span className="font-medium">{selectedGuest.name}:</span> {selectedGuest.notes}
                    </p>
                  ) : (
                    <p className="text-gray-500 text-sm">No notes provided</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Guest Modal */}
      {showAddGuestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-black">Add Guest</h2>
              <button
                onClick={() => setShowAddGuestModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form id="add-guest-form" className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#E5B574] focus:border-[#E5B574]"
                  placeholder="Enter guest name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Surname</label>
                <input
                  type="text"
                  name="surname"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#E5B574] focus:border-[#E5B574]"
                  placeholder="Enter guest surname"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#E5B574] focus:border-[#E5B574]"
                  placeholder="Enter guest email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Wedding Day Attendance</label>
                <select 
                  name="wedding_day_attendance"
                  defaultValue="Yes"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#E5B574] focus:border-[#E5B574]"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">After Party Attendance</label>
                <select 
                  name="after_party_attendance"
                  defaultValue="Yes"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#E5B574] focus:border-[#E5B574]"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Food Preference</label>
                <select 
                  name="food_preference"
                  defaultValue="Regular"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#E5B574] focus:border-[#E5B574]"
                >
                  <option value="Regular">Regular</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Gluten Free">Gluten Free</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Accommodation</label>
                <select 
                  name="accommodation_needed"
                  defaultValue="No"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#E5B574] focus:border-[#E5B574]"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transportation</label>
                <select 
                  name="transportation_needed"
                  defaultValue="No"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#E5B574] focus:border-[#E5B574]"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#E5B574] focus:border-[#E5B574]"
                  rows={3}
                  placeholder="Enter any notes"
                />
              </div>
            </form>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddGuestModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Get form data
                  const form = document.querySelector('#add-guest-form') as HTMLFormElement;
                  if (!form) return;
                  
                  const formData = new FormData(form);
                  const name = formData.get('name') as string;
                  const surname = formData.get('surname') as string;
                  
                  if (!name || !surname) {
                    alert('Please fill in at least the name and surname fields.');
                    return;
                  }
                  
                  const newGuest: IndividualGuest = {
                    id: `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    rsvpId: `manual-${Date.now()}`,
                    name: name,
                    surname: surname,
                    email: formData.get('email') as string || '',
                    wedding_day_attendance: formData.get('wedding_day_attendance') as string || 'Yes',
                    after_party_attendance: formData.get('after_party_attendance') as string || 'Yes',
                    food_preference: formData.get('food_preference') as string || 'Regular',
                    accommodation_needed: formData.get('accommodation_needed') as string || 'No',
                    transportation_needed: formData.get('transportation_needed') as string || 'No',
                    notes: formData.get('notes') as string || '',
                    custom_responses: {},
                    submitted_at: new Date().toISOString(),
                    status: 'pending'
                  };

                  // Add the new guest to the list
                  setIndividualGuests(prev => [...prev, newGuest]);

                  // Close modal and reset form
                  setShowAddGuestModal(false);
                  form.reset();
                  
                  // Show success message
                  alert(`Guest ${newGuest.name} ${newGuest.surname} has been added successfully!`);
                }}
                className="px-4 py-2 bg-[#E5B574] text-white rounded-md hover:bg-[#D59C58] transition-colors"
              >
                Add Guest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Guest Modal */}
      {showEditModal && editingGuest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-black">Edit Guest</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form id="edit-guest-form" className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingGuest.name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#E5B574] focus:border-[#E5B574]"
                  placeholder="Enter guest name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Surname</label>
                <input
                  type="text"
                  name="surname"
                  defaultValue={editingGuest.surname}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#E5B574] focus:border-[#E5B574]"
                  placeholder="Enter guest surname"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={editingGuest.email}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#E5B574] focus:border-[#E5B574]"
                  placeholder="Enter guest email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Wedding Day Attendance</label>
                <select 
                  name="wedding_day_attendance"
                  defaultValue={editingGuest.wedding_day_attendance}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#E5B574] focus:border-[#E5B574]"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">After Party Attendance</label>
                <select 
                  name="after_party_attendance"
                  defaultValue={editingGuest.after_party_attendance}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#E5B574] focus:border-[#E5B574]"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Food Preference</label>
                <select 
                  name="food_preference"
                  defaultValue={editingGuest.food_preference}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#E5B574] focus:border-[#E5B574]"
                >
                  <option value="Regular">Regular</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Gluten Free">Gluten Free</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Accommodation</label>
                <select 
                  name="accommodation_needed"
                  defaultValue={editingGuest.accommodation_needed}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#E5B574] focus:border-[#E5B574]"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transportation</label>
                <select 
                  name="transportation_needed"
                  defaultValue={editingGuest.transportation_needed}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#E5B574] focus:border-[#E5B574]"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  defaultValue={editingGuest.notes}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#E5B574] focus:border-[#E5B574]"
                  rows={3}
                  placeholder="Enter any notes"
                />
              </div>
            </form>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Get form data
                  const form = document.querySelector('#edit-guest-form') as HTMLFormElement;
                  if (!form) return;
                  
                  const formData = new FormData(form);
                  const updatedGuest: IndividualGuest = {
                    ...editingGuest,
                    name: formData.get('name') as string || editingGuest.name,
                    surname: formData.get('surname') as string || editingGuest.surname,
                    email: formData.get('email') as string || editingGuest.email,
                    wedding_day_attendance: formData.get('wedding_day_attendance') as string || editingGuest.wedding_day_attendance,
                    after_party_attendance: formData.get('after_party_attendance') as string || editingGuest.after_party_attendance,
                    food_preference: formData.get('food_preference') as string || editingGuest.food_preference,
                    accommodation_needed: formData.get('accommodation_needed') as string || editingGuest.accommodation_needed,
                    transportation_needed: formData.get('transportation_needed') as string || editingGuest.transportation_needed,
                    notes: formData.get('notes') as string || editingGuest.notes,
                  };

                  // Update the guest in the list
                  setIndividualGuests(prev => 
                    prev.map(guest => 
                      guest.id === editingGuest.id ? updatedGuest : guest
                    )
                  );

                  // Close modal
                  setShowEditModal(false);
                  setEditingGuest(null);
                  
                  // Show success message
                  alert(`Guest ${updatedGuest.name} ${updatedGuest.surname} has been updated successfully!`);
                }}
                className="px-4 py-2 bg-[#E5B574] text-white rounded-md hover:bg-[#D59C58] transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
