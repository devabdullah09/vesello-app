'use client';

import React from 'react';
import { useAdminEdit } from '@/components/admin-edit-provider';

export default function AdminToggle() {
  const { isAdminMode, toggleAdminMode, canEdit } = useAdminEdit();

  if (!canEdit) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={toggleAdminMode}
        className={`flex items-center space-x-2 px-4 py-2 rounded-full shadow-lg transition-all duration-200 ${
          isAdminMode
            ? 'bg-[#E5B574] text-white hover:bg-[#D59C58]'
            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
        }`}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
        <span className="font-medium">
          {isAdminMode ? 'Exit Edit Mode' : 'Edit Mode'}
        </span>
      </button>
    </div>
  );
}
