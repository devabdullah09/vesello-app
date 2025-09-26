'use client';

import React, { useState, useEffect } from 'react';
import EditModal from './EditModal';

interface Table {
  id: string;
  tableNumber: string;
  guests: string[];
  specialNotes?: string;
}

interface SeatingChartSectionData {
  title: string;
  description?: string;
  tables: Table[];
}

interface SeatingChartSectionEditorProps {
  isOpen: boolean;
  onClose: () => void;
  data: SeatingChartSectionData;
  onSave: (data: SeatingChartSectionData) => Promise<void>;
}

const getDefaultData = () => ({
    "title": "Seating Chart",
    "description": "Find your seat for the reception.",
    "tables": []
});

export default function SeatingChartSectionEditor({
  isOpen,
  onClose,
  data,
  onSave,
}: SeatingChartSectionEditorProps) {
  const [formData, setFormData] = useState<SeatingChartSectionData>(() => {
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
      console.error('Error saving seating chart section:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addTable = () => {
    const newTable: Table = {
      id: Date.now().toString(),
      tableNumber: `Table ${formData.tables.length + 1}`,
      guests: [''],
      specialNotes: ''
    };

    setFormData(prev => ({
      ...prev,
      tables: [...prev.tables, newTable]
    }));
  };

  const removeTable = (tableId: string) => {
    setFormData(prev => ({
      ...prev,
      tables: prev.tables.filter(t => t.id !== tableId)
    }));
  };

  const updateTable = (tableId: string, field: keyof Table, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      tables: prev.tables.map(t =>
        t.id === tableId ? { ...t, [field]: value } : t
      )
    }));
  };

  const addGuest = (tableId: string) => {
    setFormData(prev => ({
      ...prev,
      tables: prev.tables.map(t =>
        t.id === tableId ? { ...t, guests: [...t.guests, ''] } : t
      )
    }));
  };

  const updateGuest = (tableId: string, guestIndex: number, guestName: string) => {
    setFormData(prev => ({
      ...prev,
      tables: prev.tables.map(t =>
        t.id === tableId ? {
          ...t,
          guests: t.guests.map((guest, idx) => idx === guestIndex ? guestName : guest)
        } : t
      )
    }));
  };

  return (
    <EditModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Seating Chart"
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
            placeholder="Seating Chart"
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
            placeholder="Find your seat for the reception..."
          />
        </div>

        <div className="flex justify-between items-center">
          <h4 className="font-medium text-gray-900">Tables</h4>
          <button
            onClick={addTable}
            className="bg-[#E5B574] text-white px-3 py-1 rounded text-sm hover:bg-[#D59C58] transition-colors"
          >
            Add Table
          </button>
        </div>

        <div className="space-y-3 max-h-60 overflow-y-auto">
          {formData.tables.map((table, index) => (
            <div key={table.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm font-medium text-gray-700">Table {index + 1}</span>
                <button
                  onClick={() => removeTable(table.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>
              
              <div className="mb-2">
                <label className="block text-xs text-gray-600 mb-1">Table Number</label>
                <input
                  type="text"
                  value={table.tableNumber}
                  onChange={(e) => updateTable(table.id, 'tableNumber', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  placeholder="Table 1"
                />
              </div>
              
              <div className="mb-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs text-gray-600">Guests</label>
                  <button
                    onClick={() => addGuest(table.id)}
                    className="text-[#E5B574] hover:text-[#D59C58] text-xs"
                  >
                    + Add Guest
                  </button>
                </div>
                <div className="space-y-1">
                  {table.guests.map((guest, guestIndex) => (
                    <input
                      key={guestIndex}
                      type="text"
                      value={guest}
                      onChange={(e) => updateGuest(table.id, guestIndex, e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="Guest name"
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </EditModal>
  );
}
