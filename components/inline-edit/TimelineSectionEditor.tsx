'use client';

import React, { useState, useEffect } from 'react';
import EditModal from './EditModal';
import ImageUpload from '@/components/ui/ImageUpload';

interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  description?: string;
  icon?: string;
}

interface TimelineSectionData {
  title: string;
  events: TimelineEvent[];
}

interface TimelineSectionEditorProps {
  isOpen: boolean;
  onClose: () => void;
  data: TimelineSectionData;
  onSave: (data: TimelineSectionData) => Promise<void>;
}

export default function TimelineSectionEditor({
  isOpen,
  onClose,
  data,
  onSave,
}: TimelineSectionEditorProps) {
  const [formData, setFormData] = useState<TimelineSectionData>(data || {
    title: 'Wedding Day',
    events: []
  });
  const [saving, setSaving] = useState(false);

  // Update formData when data prop changes
  useEffect(() => {
    if (data && typeof data === 'object') {
      setFormData(prev => ({ ...prev, ...data }));
    }
  }, [data]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving timeline section:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addEvent = () => {
    const newEvent: TimelineEvent = {
      id: Date.now().toString(),
      time: '12:00 PM',
      title: 'New Event',
      description: '',
      icon: '/images/ceremony.png'
    };

    setFormData(prev => ({
      ...prev,
      events: [...prev.events, newEvent]
    }));
  };

  const removeEvent = (eventId: string) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.filter(e => e.id !== eventId)
    }));
  };

  const updateEvent = (eventId: string, field: keyof TimelineEvent, value: string) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.map(e =>
        e.id === eventId ? { ...e, [field]: value } : e
      )
    }));
  };

  return (
    <EditModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Wedding Timeline"
      onSave={handleSave}
      saving={saving}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Section Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5B574] focus:border-transparent"
            placeholder="Wedding Day"
          />
        </div>

        <div className="flex justify-between items-center">
          <h4 className="font-medium text-gray-900">Timeline Events</h4>
          <button
            onClick={addEvent}
            className="bg-[#E5B574] text-white px-3 py-1 rounded text-sm hover:bg-[#D59C58] transition-colors"
          >
            Add Event
          </button>
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {formData.events.map((event, index) => (
            <div key={event.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm font-medium text-gray-700">Event {index + 1}</span>
                <button
                  onClick={() => removeEvent(event.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Time</label>
                  <input
                    type="text"
                    value={event.time}
                    onChange={(e) => updateEvent(event.id, 'time', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="12:00 PM"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Title</label>
                  <input
                    type="text"
                    value={event.title}
                    onChange={(e) => updateEvent(event.id, 'title', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="Event Title"
                  />
                </div>
              </div>
              
              <div className="mt-2">
                <label className="block text-xs text-gray-600 mb-1">Event Icon</label>
                <ImageUpload
                  currentImage={event.icon}
                  onImageChange={(url) => updateEvent(event.id, 'icon', url)}
                  placeholder="Upload event icon"
                  className="w-16 h-16"
                  uploadPath="timeline-icons"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </EditModal>
  );
}
