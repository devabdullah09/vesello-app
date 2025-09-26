"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Trash2, Edit3, Plus, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react';

interface FormQuestion {
  id: string;
  event_id: string;
  question_type: 'yes_no' | 'multiple_choice' | 'text' | 'attendance' | 'food_preference';
  title: string;
  description?: string;
  options: string[];
  required: boolean;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface EventData {
  id: string;
  wwwId: string;
  title: string;
  coupleNames: string;
  eventDate: string;
  venue?: string;
  rsvpEnabled: boolean;
}

const DEFAULT_QUESTIONS = [
  {
    id: 'guests',
    title: 'Add Guests',
    description: 'Add plus ones or household members',
    questionType: 'guests' as const,
    isDefault: true
  },
  {
    id: 'attendance',
    title: 'Wedding Day Attendance',
    description: 'Will you attend the wedding day?',
    questionType: 'attendance' as const,
    isDefault: true
  },
  {
    id: 'after-party',
    title: 'After Party',
    description: 'Will you attend the after party?',
    questionType: 'attendance' as const,
    isDefault: true
  },
  {
    id: 'food-selection',
    title: 'Food Selection',
    description: 'What\'s your meal preference?',
    questionType: 'food_preference' as const,
    isDefault: true
  },
  {
    id: 'accommodation',
    title: 'Accommodation',
    description: 'Do you need accommodation?',
    questionType: 'yes_no' as const,
    isDefault: true
  },
  {
    id: 'transportation',
    title: 'Transportation',
    description: 'Do you need transportation?',
    questionType: 'yes_no' as const,
    isDefault: true
  },
  {
    id: 'note',
    title: 'Send a Note',
    description: 'Send a note to the couple',
    questionType: 'text' as const,
    isDefault: true
  },
  {
    id: 'confirmation',
    title: 'Confirmation',
    description: 'Final confirmation and email',
    questionType: 'confirmation' as const,
    isDefault: true
  }
];

export default function ManageFormPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventData[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [questions, setQuestions] = useState<FormQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<FormQuestion | null>(null);

  // New question form state
  const [newQuestion, setNewQuestion] = useState({
    questionType: 'yes_no' as const,
    title: '',
    description: '',
    options: [''] as string[],
    required: true
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('Please log in to manage RSVP forms');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/dashboard/events', {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // The API returns a paginated response, so we need to access data.data.data
        const events = data.data.data || [];
        // Filter events that have RSVP enabled
        const rsvpEnabledEvents = events.filter((event: EventData) => event.rsvpEnabled);
        setEvents(rsvpEnabledEvents);
        
        if (rsvpEnabledEvents.length === 0) {
          setError('No events with RSVP enabled found');
        }
      } else {
        setError('Failed to load events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async (wwwId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setError('Please log in to manage RSVP forms');
        return;
      }

      const response = await fetch(`/api/dashboard/events/rsvp-form-questions?wwwId=${wwwId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setQuestions(data.data.questions || []);
      } else {
        console.error('Failed to fetch questions');
        setQuestions([]);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      setQuestions([]);
    }
  };

  const handleEventSelect = (event: EventData) => {
    setSelectedEvent(event);
    fetchQuestions(event.wwwId);
  };

  const handleBack = () => {
    router.push('/dashboard/events-edition/rsvp');
  };

  const handleAddQuestion = async () => {
    if (!selectedEvent || !newQuestion.title.trim()) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setError('Please log in to add questions');
        return;
      }

      const response = await fetch('/api/dashboard/events/rsvp-form-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          wwwId: selectedEvent.wwwId,
          questionData: {
            questionType: newQuestion.questionType,
            title: newQuestion.title,
            description: newQuestion.description,
            options: newQuestion.options.filter(opt => opt.trim() !== ''),
            required: newQuestion.required
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setQuestions(prev => [...prev, data.data]);
        setNewQuestion({
          questionType: 'yes_no',
          title: '',
          description: '',
          options: [''],
          required: true
        });
        setShowAddQuestion(false);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to add question');
      }
    } catch (error) {
      console.error('Error adding question:', error);
      setError('Failed to add question');
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!selectedEvent) return;

    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setError('Please log in to delete questions');
        return;
      }

      const response = await fetch(`/api/dashboard/events/rsvp-form-questions?questionId=${questionId}&wwwId=${selectedEvent.wwwId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        setQuestions(prev => prev.filter(q => q.id !== questionId));
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete question');
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      setError('Failed to delete question');
    }
  };

  const handleToggleActive = async (question: FormQuestion) => {
    if (!selectedEvent) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setError('Please log in to update questions');
        return;
      }

      const response = await fetch('/api/dashboard/events/rsvp-form-questions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          questionId: question.id,
          wwwId: selectedEvent.wwwId,
        questionData: {
          ...question,
          isActive: !question.is_active
        }
        }),
      });

      if (response.ok) {
        setQuestions(prev => prev.map(q => 
          q.id === question.id ? { ...q, is_active: !q.is_active } : q
        ));
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update question');
      }
    } catch (error) {
      console.error('Error updating question:', error);
      setError('Failed to update question');
    }
  };

  const addOption = () => {
    setNewQuestion(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const removeOption = (index: number) => {
    setNewQuestion(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const updateOption = (index: number, value: string) => {
    setNewQuestion(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  if (loading) {
    return (
      <div className="flex-1 p-12 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  if (error && events.length === 0) {
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
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h1 className="text-2xl font-bold text-black mb-4">RSVP Form Management</h1>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchEvents}
            className="bg-[#E5B574] text-white px-6 py-2 rounded font-semibold hover:bg-[#D59C58] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show event selection if no event is selected
  if (!selectedEvent) {
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

        <h1 className="text-3xl font-bold text-black mb-8">RSVP FORM MANAGEMENT</h1>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-semibold text-black mb-6">Select Event to Manage Form</h2>
          <p className="text-gray-600 mb-8">
            Choose an event to manage its RSVP form questions and settings.
          </p>

          {events.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No events with RSVP enabled found.</p>
              <button
                onClick={() => router.push('/dashboard/events-edition')}
                className="bg-[#E5B574] text-white px-6 py-2 rounded font-semibold hover:bg-[#D59C58] transition-colors"
              >
                Create Event
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div
                  key={event.id}
                  onClick={() => handleEventSelect(event)}
                  className="border border-gray-200 rounded-lg p-6 cursor-pointer hover:border-[#E5B574] hover:shadow-md transition-all"
                >
                  <h3 className="font-semibold text-black mb-2">{event.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{event.coupleNames}</p>
                  <p className="text-gray-500 text-xs">
                    {new Date(event.eventDate).toLocaleDateString()}
                  </p>
                  <p className="text-gray-500 text-xs">{event.venue || 'Venue TBA'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show form management for selected event
  return (
    <div className="flex-1 p-12 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-start mb-8">
        <button
          onClick={handleBack}
          className="bg-black text-white px-6 py-2 rounded font-semibold hover:bg-gray-800 transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => setSelectedEvent(null)}
          className="bg-gray-500 text-white px-6 py-2 rounded font-semibold hover:bg-gray-600 transition-colors"
        >
          Change Event
        </button>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-black mb-2">RSVP FORM MANAGEMENT</h1>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-xl font-semibold text-black">{selectedEvent.title}</h2>
          <p className="text-gray-600">{selectedEvent.coupleNames}</p>
          <p className="text-gray-500 text-sm">
            {new Date(selectedEvent.eventDate).toLocaleDateString()} • {selectedEvent.venue || 'Venue TBA'}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-black">Form Questions</h2>
          <button
            onClick={() => setShowAddQuestion(true)}
            className="bg-[#E5B574] text-white px-4 py-2 rounded font-semibold hover:bg-[#D59C58] transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Question
          </button>
        </div>

        {/* Default Questions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-black mb-4">Default Questions</h3>
          <div className="space-y-3">
            {DEFAULT_QUESTIONS.map((question, index) => (
              <div key={question.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Default</span>
                      <h4 className="font-semibold text-black">{question.title}</h4>
                    </div>
                    <p className="text-gray-600 text-sm">{question.description}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      Type: {question.questionType.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">#{index + 1}</span>
                    <Eye className="w-4 h-4 text-green-600" title="Always Active" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Questions */}
        <div>
          <h3 className="text-lg font-semibold text-black mb-4">Custom Questions</h3>
          {questions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No custom questions added yet.</p>
              <p className="text-sm">Click "Add Question" to create your first custom question.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((question, index) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-black">{question.title}</h4>
                        {!question.is_active && (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Inactive</span>
                        )}
                      </div>
                      {question.description && (
                        <p className="text-gray-600 text-sm mb-2">{question.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Type: {question.question_type?.replace('_', ' ') || 'Unknown'}</span>
                        <span>Required: {question.required ? 'Yes' : 'No'}</span>
                        {question.options.length > 0 && (
                          <span>Options: {question.options.length}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">#{DEFAULT_QUESTIONS.length + index + 1}</span>
                      <button
                        onClick={() => handleToggleActive(question)}
                        className="p-1 rounded hover:bg-gray-100"
                        title={question.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {question.is_active ? (
                          <Eye className="w-4 h-4 text-green-600" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      <button
                        onClick={() => setEditingQuestion(question)}
                        className="p-1 rounded hover:bg-gray-100"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="p-1 rounded hover:bg-gray-100"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Question Modal */}
      {showAddQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-black">Add New Question</h3>
              <button
                onClick={() => setShowAddQuestion(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Type
                </label>
                <select
                  value={newQuestion.questionType}
                  onChange={(e) => setNewQuestion(prev => ({ 
                    ...prev, 
                    questionType: e.target.value as any,
                    options: e.target.value === 'multiple_choice' ? ['', ''] : ['']
                  }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E5B574]"
                >
                  <option value="yes_no">Yes/No Question</option>
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="text">Text Input</option>
                  <option value="attendance">Attendance</option>
                  <option value="food_preference">Food Preference</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Title *
                </label>
                <input
                  type="text"
                  value={newQuestion.title}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Do you need special accommodations?"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E5B574]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={newQuestion.description}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Additional context or instructions..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E5B574]"
                />
              </div>

              {(newQuestion.questionType === 'multiple_choice' || newQuestion.questionType === 'food_preference') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Options
                  </label>
                  {newQuestion.options.map((option, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E5B574]"
                      />
                      {newQuestion.options.length > 1 && (
                        <button
                          onClick={() => removeOption(index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addOption}
                    className="text-[#E5B574] hover:text-[#D59C58] text-sm font-medium flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Option
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="required"
                  checked={newQuestion.required}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, required: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <label htmlFor="required" className="text-sm font-medium text-gray-700">
                  Required question
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowAddQuestion(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddQuestion}
                disabled={!newQuestion.title.trim()}
                className="bg-[#E5B574] text-white px-6 py-2 rounded font-semibold hover:bg-[#D59C58] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}