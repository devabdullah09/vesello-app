'use client';

import React, { useState } from 'react';
import EditModal from './EditModal';

interface MenuItem {
  name: string;
  description?: string;
  allergens?: string[];
}

interface MenuCourse {
  id: string;
  courseName: string;
  items: MenuItem[];
}

interface MenuSectionData {
  title: string;
  description?: string;
  courses: MenuCourse[];
}

interface MenuSectionEditorProps {
  isOpen: boolean;
  onClose: () => void;
  data: MenuSectionData;
  onSave: (data: MenuSectionData) => Promise<void>;
}

export default function MenuSectionEditor({
  isOpen,
  onClose,
  data,
  onSave,
}: MenuSectionEditorProps) {
  const [formData, setFormData] = useState<MenuSectionData>(data);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving menu section:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addCourse = () => {
    const newCourse: MenuCourse = {
      id: Date.now().toString(),
      courseName: 'NEW COURSE',
      items: [{ name: 'New Item', description: '' }]
    };

    setFormData(prev => ({
      ...prev,
      courses: [...prev.courses, newCourse]
    }));
  };

  const removeCourse = (courseId: string) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.filter(c => c.id !== courseId)
    }));
  };

  const updateCourse = (courseId: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.map(c =>
        c.id === courseId ? { ...c, [field]: value } : c
      )
    }));
  };

  const addMenuItem = (courseId: string) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.map(c =>
        c.id === courseId 
          ? { ...c, items: [...c.items, { name: 'New Item', description: '' }] }
          : c
      )
    }));
  };

  const updateMenuItem = (courseId: string, itemIndex: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.map(c =>
        c.id === courseId 
          ? { 
              ...c, 
              items: c.items.map((item, idx) =>
                idx === itemIndex ? { ...item, [field]: value } : item
              )
            }
          : c
      )
    }));
  };

  return (
    <EditModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Wedding Menu"
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
            placeholder="Menu"
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
            placeholder="Describe your wedding menu..."
          />
        </div>

        <div className="flex justify-between items-center">
          <h4 className="font-medium text-gray-900">Menu Courses</h4>
          <button
            onClick={addCourse}
            className="bg-[#E5B574] text-white px-3 py-1 rounded text-sm hover:bg-[#D59C58] transition-colors"
          >
            Add Course
          </button>
        </div>

        <div className="space-y-4 max-h-80 overflow-y-auto">
          {formData.courses.map((course, courseIndex) => (
            <div key={course.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm font-medium text-gray-700">Course {courseIndex + 1}</span>
                <button
                  onClick={() => removeCourse(course.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>
              
              <div className="mb-3">
                <label className="block text-xs text-gray-600 mb-1">Course Name</label>
                <input
                  type="text"
                  value={course.courseName}
                  onChange={(e) => updateCourse(course.id, 'courseName', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  placeholder="STARTER"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs text-gray-600">Menu Items</label>
                  <button
                    onClick={() => addMenuItem(course.id)}
                    className="text-[#E5B574] hover:text-[#D59C58] text-xs"
                  >
                    + Add Item
                  </button>
                </div>
                {course.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateMenuItem(course.id, itemIndex, 'name', e.target.value)}
                      placeholder="Item name"
                      className="px-2 py-1 border border-gray-300 rounded text-xs"
                    />
                    <input
                      type="text"
                      value={item.description || ''}
                      onChange={(e) => updateMenuItem(course.id, itemIndex, 'description', e.target.value)}
                      placeholder="Description"
                      className="px-2 py-1 border border-gray-300 rounded text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </EditModal>
  );
}
