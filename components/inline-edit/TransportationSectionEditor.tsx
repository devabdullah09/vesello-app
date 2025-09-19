'use client';

import React, { useState } from 'react';
import EditModal from './EditModal';

interface TransportationOption {
  id: string;
  type: string;
  description: string;
  details?: string;
  contactInfo?: string;
}

interface TransportationSectionData {
  title: string;
  description?: string;
  options: TransportationOption[];
}

interface TransportationSectionEditorProps {
  isOpen: boolean;
  onClose: () => void;
  data: TransportationSectionData;
  onSave: (data: TransportationSectionData) => Promise<void>;
}

export default function TransportationSectionEditor({
  isOpen,
  onClose,
  data,
  onSave,
}: TransportationSectionEditorProps) {
  const [formData, setFormData] = useState<TransportationSectionData>(data);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving transportation section:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addTransportationOption = () => {
    const newOption: TransportationOption = {
      id: Date.now().toString(),
      type: 'Shuttle Service',
      description: 'Free shuttle from hotel to venue',
      details: '',
      contactInfo: ''
    };

    setFormData(prev => ({
      ...prev,
      options: [...prev.options, newOption]
    }));
  };

  const removeTransportationOption = (optionId: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter(o => o.id !== optionId)
    }));
  };

  const updateTransportationOption = (optionId: string, field: keyof TransportationOption, value: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map(o =>
        o.id === optionId ? { ...o, [field]: value } : o
      )
    }));
  };

  return (
    <EditModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Transportation"
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
            placeholder="Transportation"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5B574] focus:border-transparent"
            placeholder="Information about getting to and from the venue..."
          />
        </div>

        <div className="flex justify-between items-center">
          <h4 className="font-medium text-gray-900">Transportation Options</h4>
          <button
            onClick={addTransportationOption}
            className="bg-[#E5B574] text-white px-3 py-1 rounded text-sm hover:bg-[#D59C58] transition-colors"
          >
            Add Option
          </button>
        </div>

        <div className="space-y-3 max-h-60 overflow-y-auto">
          {formData.options.map((option, index) => (
            <div key={option.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm font-medium text-gray-700">Option {index + 1}</span>
                <button
                  onClick={() => removeTransportationOption(option.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Type</label>
                  <input
                    type="text"
                    value={option.type}
                    onChange={(e) => updateTransportationOption(option.id, 'type', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="Shuttle Service"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Contact Info</label>
                  <input
                    type="text"
                    value={option.contactInfo || ''}
                    onChange={(e) => updateTransportationOption(option.id, 'contactInfo', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="Phone or email"
                  />
                </div>
              </div>
              
              <div className="mb-2">
                <label className="block text-xs text-gray-600 mb-1">Description</label>
                <textarea
                  value={option.description}
                  onChange={(e) => updateTransportationOption(option.id, 'description', e.target.value)}
                  rows={2}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  placeholder="Transportation description"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </EditModal>
  );
}
