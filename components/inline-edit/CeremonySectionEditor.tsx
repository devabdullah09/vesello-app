'use client';

import React, { useState } from 'react';
import EditModal from './EditModal';

interface CeremonySectionData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  details?: string;
}

interface CeremonySectionEditorProps {
  isOpen: boolean;
  onClose: () => void;
  data: CeremonySectionData;
  onSave: (data: CeremonySectionData) => Promise<void>;
}

export default function CeremonySectionEditor({
  isOpen,
  onClose,
  data,
  onSave,
}: CeremonySectionEditorProps) {
  const [formData, setFormData] = useState<CeremonySectionData>(data);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving ceremony section:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof CeremonySectionData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <EditModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Ceremony Details"
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
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5B574] focus:border-transparent"
            placeholder="Ceremony Details"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5B574] focus:border-transparent"
            placeholder="Join us as we exchange vows..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={formData.date ? formData.date.slice(0, 10) : ''}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5B574] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time
            </label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => handleInputChange('time', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5B574] focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5B574] focus:border-transparent"
            placeholder="Ceremony location"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Details
          </label>
          <textarea
            value={formData.details || ''}
            onChange={(e) => handleInputChange('details', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5B574] focus:border-transparent"
            placeholder="Any additional ceremony information..."
          />
        </div>
      </div>
    </EditModal>
  );
}
