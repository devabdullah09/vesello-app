'use client';

import React, { useState, useEffect } from 'react';
import EditModal from './EditModal';
import ImageUpload from '@/components/ui/ImageUpload';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  photo?: string;
  bio?: string;
}

interface TeamSectionData {
  title: string;
  description?: string;
  members: TeamMember[];
}

interface TeamSectionEditorProps {
  isOpen: boolean;
  onClose: () => void;
  data: TeamSectionData;
  onSave: (data: TeamSectionData) => Promise<void>;
}

const getDefaultData = () => ({
    "title": "Wedding Team",
    "description": "Meet the special people who will be part of our big day.",
    "members": []
});

export default function TeamSectionEditor({
  isOpen,
  onClose,
  data,
  onSave,
}: TeamSectionEditorProps) {
  const [formData, setFormData] = useState<TeamSectionData>(() => {
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
      console.error('Error saving team section:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addTeamMember = () => {
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: 'New Team Member',
      role: 'Wedding Party',
      photo: '/images/team-placeholder.jpeg',
      bio: ''
    };

    setFormData(prev => ({
      ...prev,
      members: [...prev.members, newMember]
    }));
  };

  const removeTeamMember = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.filter(m => m.id !== memberId)
    }));
  };

  const updateTeamMember = (memberId: string, field: keyof TeamMember, value: string) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.map(m =>
        m.id === memberId ? { ...m, [field]: value } : m
      )
    }));
  };

  return (
    <EditModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Wedding Team"
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
            placeholder="Team"
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
            placeholder="Meet the special people who will be part of our big day..."
          />
        </div>

        <div className="flex justify-between items-center">
          <h4 className="font-medium text-gray-900">Team Members</h4>
          <button
            onClick={addTeamMember}
            className="bg-[#E5B574] text-white px-3 py-1 rounded text-sm hover:bg-[#D59C58] transition-colors"
          >
            Add Member
          </button>
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto">
          {formData.members.map((member, index) => (
            <div key={member.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm font-medium text-gray-700">Member {index + 1}</span>
                <button
                  onClick={() => removeTeamMember(member.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Name</label>
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => updateTeamMember(member.id, 'name', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="Member name"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Role</label>
                  <input
                    type="text"
                    value={member.role}
                    onChange={(e) => updateTeamMember(member.id, 'role', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="Role/Position"
                  />
                </div>
              </div>
              
              <div className="mb-2">
                <label className="block text-xs text-gray-600 mb-1">Photo</label>
                <ImageUpload
                  currentImage={member.photo}
                  onImageChange={(url) => updateTeamMember(member.id, 'photo', url)}
                  placeholder="Upload member photo"
                  className="w-20 h-20"
                  uploadPath="team-photos"
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-600 mb-1">Bio</label>
                <textarea
                  value={member.bio || ''}
                  onChange={(e) => updateTeamMember(member.id, 'bio', e.target.value)}
                  rows={2}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  placeholder="Brief bio..."
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </EditModal>
  );
}
