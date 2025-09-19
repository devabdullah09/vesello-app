'use client';

import React, { useState } from 'react';
import EditModal from './EditModal';

interface InfoItem {
  id: string;
  title: string;
  description: string;
}

interface AdditionalInfoSectionData {
  title: string;
  content: string;
  items: InfoItem[];
}

interface AdditionalInfoSectionEditorProps {
  isOpen: boolean;
  onClose: () => void;
  data: AdditionalInfoSectionData;
  onSave: (data: AdditionalInfoSectionData) => Promise<void>;
}

export default function AdditionalInfoSectionEditor({
  isOpen,
  onClose,
  data,
  onSave,
}: AdditionalInfoSectionEditorProps) {
  const [formData, setFormData] = useState<AdditionalInfoSectionData>(data);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving additional info section:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addInfoItem = () => {
    const newItem: InfoItem = {
      id: Date.now().toString(),
      title: 'New Information',
      description: 'Add details here...'
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const removeInfoItem = (itemId: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const updateInfoItem = (itemId: string, field: keyof InfoItem, value: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    }));
  };

  return (
    <EditModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Additional Information"
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
            placeholder="Additional Information"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Main Content
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5B574] focus:border-transparent"
            placeholder="Add any additional information your guests should know..."
          />
        </div>

        <div className="flex justify-between items-center">
          <h4 className="font-medium text-gray-900">Information Items</h4>
          <button
            onClick={addInfoItem}
            className="bg-[#E5B574] text-white px-3 py-1 rounded text-sm hover:bg-[#D59C58] transition-colors"
          >
            Add Item
          </button>
        </div>

        <div className="space-y-3 max-h-60 overflow-y-auto">
          {formData.items.map((item, index) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm font-medium text-gray-700">Item {index + 1}</span>
                <button
                  onClick={() => removeInfoItem(item.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>
              
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Title</label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateInfoItem(item.id, 'title', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="Information title"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Description</label>
                  <textarea
                    value={item.description}
                    onChange={(e) => updateInfoItem(item.id, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="Information description"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </EditModal>
  );
}
