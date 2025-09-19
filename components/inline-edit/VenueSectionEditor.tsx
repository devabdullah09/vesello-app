'use client';

import React, { useState } from 'react';
import EditModal from './EditModal';
import ImageUpload from '@/components/ui/ImageUpload';

interface VenueSectionData {
  title: string;
  venueName: string;
  address: string;
  description?: string;
  mapUrl?: string;
}

interface VenueSectionEditorProps {
  isOpen: boolean;
  onClose: () => void;
  data: VenueSectionData;
  onSave: (data: VenueSectionData) => Promise<void>;
}

export default function VenueSectionEditor({
  isOpen,
  onClose,
  data,
  onSave,
}: VenueSectionEditorProps) {
  const [formData, setFormData] = useState<VenueSectionData>(data);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving venue section:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof VenueSectionData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <EditModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Wedding Venue"
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
            placeholder="Our Wedding"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Venue Name
          </label>
          <input
            type="text"
            value={formData.venueName}
            onChange={(e) => handleInputChange('venueName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5B574] focus:border-transparent"
            placeholder="Grand Palace Hotel"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5B574] focus:border-transparent"
            placeholder="456 palace avenue, warsaw"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5B574] focus:border-transparent"
            placeholder="Describe your beautiful venue..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Venue Photo (Optional)
          </label>
          <ImageUpload
            currentImage={formData.images?.[0]}
            onImageChange={(url) => handleInputChange('images', [url])}
            placeholder="Upload venue photo"
            className="w-full h-48"
            uploadPath="venue-photos"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Map URL (Optional)
          </label>
          <input
            type="url"
            value={formData.mapUrl || ''}
            onChange={(e) => handleInputChange('mapUrl', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5B574] focus:border-transparent"
            placeholder="https://maps.google.com/..."
          />
        </div>
      </div>
    </EditModal>
  );
}
