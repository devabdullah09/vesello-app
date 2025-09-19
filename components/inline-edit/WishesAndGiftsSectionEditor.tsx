'use client';

import React, { useState } from 'react';
import EditModal from './EditModal';

interface RegistryLink {
  id: string;
  storeName: string;
  url: string;
  description?: string;
}

interface WishesAndGiftsSectionData {
  title: string;
  description?: string;
  registryLinks: RegistryLink[];
  wishesMessage?: string;
}

interface WishesAndGiftsSectionEditorProps {
  isOpen: boolean;
  onClose: () => void;
  data: WishesAndGiftsSectionData;
  onSave: (data: WishesAndGiftsSectionData) => Promise<void>;
}

export default function WishesAndGiftsSectionEditor({
  isOpen,
  onClose,
  data,
  onSave,
}: WishesAndGiftsSectionEditorProps) {
  const [formData, setFormData] = useState<WishesAndGiftsSectionData>(data);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving wishes and gifts section:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addRegistryLink = () => {
    const newLink: RegistryLink = {
      id: Date.now().toString(),
      storeName: 'New Store',
      url: '',
      description: ''
    };

    setFormData(prev => ({
      ...prev,
      registryLinks: [...prev.registryLinks, newLink]
    }));
  };

  const removeRegistryLink = (linkId: string) => {
    setFormData(prev => ({
      ...prev,
      registryLinks: prev.registryLinks.filter(l => l.id !== linkId)
    }));
  };

  const updateRegistryLink = (linkId: string, field: keyof RegistryLink, value: string) => {
    setFormData(prev => ({
      ...prev,
      registryLinks: prev.registryLinks.map(l =>
        l.id === linkId ? { ...l, [field]: value } : l
      )
    }));
  };

  return (
    <EditModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Wishes & Gifts"
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
            placeholder="Wishes & Gifts"
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
            placeholder="Your presence is the greatest gift..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Wishes Message
          </label>
          <textarea
            value={formData.wishesMessage || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, wishesMessage: e.target.value }))}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5B574] focus:border-transparent"
            placeholder="We are so grateful for your love and support!"
          />
        </div>

        <div className="flex justify-between items-center">
          <h4 className="font-medium text-gray-900">Gift Registry Links</h4>
          <button
            onClick={addRegistryLink}
            className="bg-[#E5B574] text-white px-3 py-1 rounded text-sm hover:bg-[#D59C58] transition-colors"
          >
            Add Registry
          </button>
        </div>

        <div className="space-y-3 max-h-60 overflow-y-auto">
          {formData.registryLinks.map((link, index) => (
            <div key={link.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm font-medium text-gray-700">Registry {index + 1}</span>
                <button
                  onClick={() => removeRegistryLink(link.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Store Name</label>
                  <input
                    type="text"
                    value={link.storeName}
                    onChange={(e) => updateRegistryLink(link.id, 'storeName', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="Amazon"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Registry URL</label>
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => updateRegistryLink(link.id, 'url', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="https://registry.com/..."
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs text-gray-600 mb-1">Description</label>
                <input
                  type="text"
                  value={link.description || ''}
                  onChange={(e) => updateRegistryLink(link.id, 'description', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  placeholder="Home essentials and more"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </EditModal>
  );
}
