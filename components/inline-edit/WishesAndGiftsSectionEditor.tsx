'use client';

import React, { useState, useEffect } from 'react';
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
  wishesMessage?: string;
  place?: string;
  when?: string;
  giftSuggestions?: string;
}

interface WishesAndGiftsSectionEditorProps {
  isOpen: boolean;
  onClose: () => void;
  data: WishesAndGiftsSectionData;
  onSave: (data: WishesAndGiftsSectionData) => Promise<void>;
}

const getDefaultData = () => ({
    "title": "Wishes & Gifts",
    "description": "Your presence is the greatest gift, but if you wish to honor us with a gift, here are some suggestions.",
    "wishesMessage": "We are so grateful for your love and support!",
    "place": "At the church",
    "when": "After ceremony next to church",
    "giftSuggestions": "flowers, bottle of wine, lottery coupon"
});

export default function WishesAndGiftsSectionEditor({
  isOpen,
  onClose,
  data,
  onSave,
}: WishesAndGiftsSectionEditorProps) {
  const [formData, setFormData] = useState<WishesAndGiftsSectionData>(() => {
    if (data && typeof data === 'object') {
      return { ...getDefaultData(), ...data };
    }
    return getDefaultData();
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
      console.error('Error saving wishes and gifts section:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof WishesAndGiftsSectionData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
            onChange={(e) => handleInputChange('title', e.target.value)}
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
            onChange={(e) => handleInputChange('description', e.target.value)}
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
            onChange={(e) => handleInputChange('wishesMessage', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5B574] focus:border-transparent"
            placeholder="We are so grateful for your love and support!"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Place
          </label>
          <input
            type="text"
            value={formData.place || ''}
            onChange={(e) => handleInputChange('place', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5B574] focus:border-transparent"
            placeholder="At the church"
          />
          <p className="text-xs text-gray-500 mt-1">
            Where guests can give wishes (e.g., "At the church", "At the wedding hall")
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            When
          </label>
          <input
            type="text"
            value={formData.when || ''}
            onChange={(e) => handleInputChange('when', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5B574] focus:border-transparent"
            placeholder="After ceremony next to church"
          />
          <p className="text-xs text-gray-500 mt-1">
            When guests can give wishes (e.g., "After ceremony next to church", "At the wedding hall before main course")
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gift Suggestions
          </label>
          <textarea
            value={formData.giftSuggestions || ''}
            onChange={(e) => handleInputChange('giftSuggestions', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5B574] focus:border-transparent"
            placeholder="flowers, bottle of wine, lottery coupon"
          />
          <p className="text-xs text-gray-500 mt-1">
            Optional gift suggestions (money is the main gift in Polish weddings)
          </p>
        </div>
      </div>
    </EditModal>
  );
}
