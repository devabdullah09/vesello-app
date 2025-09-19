'use client';

import React, { useState } from 'react';
import EditModal from './EditModal';

interface Hotel {
  id: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  specialRate?: string;
  bookingCode?: string;
}

interface AccommodationSectionData {
  title: string;
  description?: string;
  hotels: Hotel[];
}

interface AccommodationSectionEditorProps {
  isOpen: boolean;
  onClose: () => void;
  data: AccommodationSectionData;
  onSave: (data: AccommodationSectionData) => Promise<void>;
}

export default function AccommodationSectionEditor({
  isOpen,
  onClose,
  data,
  onSave,
}: AccommodationSectionEditorProps) {
  const [formData, setFormData] = useState<AccommodationSectionData>(data);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving accommodation section:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addHotel = () => {
    const newHotel: Hotel = {
      id: Date.now().toString(),
      name: 'New Hotel',
      address: '',
      phone: '',
      website: '',
      specialRate: '',
      bookingCode: ''
    };

    setFormData(prev => ({
      ...prev,
      hotels: [...prev.hotels, newHotel]
    }));
  };

  const removeHotel = (hotelId: string) => {
    setFormData(prev => ({
      ...prev,
      hotels: prev.hotels.filter(h => h.id !== hotelId)
    }));
  };

  const updateHotel = (hotelId: string, field: keyof Hotel, value: string) => {
    setFormData(prev => ({
      ...prev,
      hotels: prev.hotels.map(h =>
        h.id === hotelId ? { ...h, [field]: value } : h
      )
    }));
  };

  return (
    <EditModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Accommodation"
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
            placeholder="Accommodation"
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
            placeholder="Here are some hotel options for out-of-town guests..."
          />
        </div>

        <div className="flex justify-between items-center">
          <h4 className="font-medium text-gray-900">Hotels</h4>
          <button
            onClick={addHotel}
            className="bg-[#E5B574] text-white px-3 py-1 rounded text-sm hover:bg-[#D59C58] transition-colors"
          >
            Add Hotel
          </button>
        </div>

        <div className="space-y-3 max-h-60 overflow-y-auto">
          {formData.hotels.map((hotel, index) => (
            <div key={hotel.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm font-medium text-gray-700">Hotel {index + 1}</span>
                <button
                  onClick={() => removeHotel(hotel.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Hotel Name</label>
                  <input
                    type="text"
                    value={hotel.name}
                    onChange={(e) => updateHotel(hotel.id, 'name', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="Hotel name"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Phone</label>
                  <input
                    type="text"
                    value={hotel.phone || ''}
                    onChange={(e) => updateHotel(hotel.id, 'phone', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="Phone number"
                  />
                </div>
              </div>
              
              <div className="mb-2">
                <label className="block text-xs text-gray-600 mb-1">Address</label>
                <input
                  type="text"
                  value={hotel.address}
                  onChange={(e) => updateHotel(hotel.id, 'address', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  placeholder="Hotel address"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Website</label>
                  <input
                    type="url"
                    value={hotel.website || ''}
                    onChange={(e) => updateHotel(hotel.id, 'website', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="https://hotel.com"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Booking Code</label>
                  <input
                    type="text"
                    value={hotel.bookingCode || ''}
                    onChange={(e) => updateHotel(hotel.id, 'bookingCode', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="WEDDING2024"
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
