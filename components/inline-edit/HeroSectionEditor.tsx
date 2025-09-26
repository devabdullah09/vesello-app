'use client';

import React, { useState, useEffect } from 'react';
import EditModal from './EditModal';
import ImageUpload from '@/components/ui/ImageUpload';

interface HeroSectionData {
  coupleNames: string;
  eventDate: string;
  venue?: string;
  customMessage?: string;
  backgroundImage?: string;
}

interface HeroSectionEditorProps {
  isOpen: boolean;
  onClose: () => void;
  data: HeroSectionData;
  onSave: (data: HeroSectionData) => Promise<void>;
}

export default function HeroSectionEditor({
  isOpen,
  onClose,
  data,
  onSave,
}: HeroSectionEditorProps) {
  const [formData, setFormData] = useState<HeroSectionData>(data || {
    coupleNames: '',
    eventDate: '',
    venue: '',
    customMessage: 'WE\'RE GETTING MARRIED!',
    backgroundImage: ''
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
      console.error('Error saving hero section:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof HeroSectionData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <EditModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Hero Section"
      onSave={handleSave}
      saving={saving}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Couple Names
          </label>
          <input
            type="text"
            value={formData.coupleNames}
            onChange={(e) => handleInputChange('coupleNames', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5B574] focus:border-transparent"
            placeholder="John & Jane"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Date & Time
          </label>
          <input
            type="datetime-local"
            value={formData.eventDate ? formData.eventDate.slice(0, 16) : ''}
            onChange={(e) => handleInputChange('eventDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5B574] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Venue
          </label>
          <input
            type="text"
            value={formData.venue || ''}
            onChange={(e) => handleInputChange('venue', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5B574] focus:border-transparent"
            placeholder="Wedding Venue Name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Message
          </label>
          <input
            type="text"
            value={formData.customMessage || ''}
            onChange={(e) => handleInputChange('customMessage', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5B574] focus:border-transparent"
            placeholder="WE'RE GETTING MARRIED!"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Background Image (Optional)
          </label>
          <ImageUpload
            currentImage={formData.backgroundImage}
            onImageChange={(url) => handleInputChange('backgroundImage', url)}
            placeholder="Upload hero background"
            className="w-full h-32"
            uploadPath="hero-backgrounds"
          />
        </div>
      </div>
    </EditModal>
  );
}
