'use client';

import React, { useState } from 'react';
import { useAdminEdit } from '@/components/admin-edit-provider';

interface EditableSectionProps {
  children: React.ReactNode;
  onEdit: () => void;
  sectionName: string;
  className?: string;
}

export default function EditableSection({ 
  children, 
  onEdit, 
  sectionName, 
  className = '' 
}: EditableSectionProps) {
  const { isAdminMode, canEdit } = useAdminEdit();
  const [isHovered, setIsHovered] = useState(false);

  if (!canEdit) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      className={`relative ${className} ${isAdminMode ? 'transition-all duration-200' : ''}`}
      onMouseEnter={() => isAdminMode && setIsHovered(true)}
      onMouseLeave={() => isAdminMode && setIsHovered(false)}
      style={{
        border: isAdminMode ? (isHovered ? '2px dashed #E5B574' : '2px dashed transparent') : 'none',
        borderRadius: isAdminMode ? '8px' : '0',
        padding: isAdminMode ? '8px' : '0',
      }}
    >
      {children}
      
      {isAdminMode && (
        <button
          onClick={onEdit}
          className={`absolute top-2 right-2 bg-[#E5B574] text-white p-2 rounded-full shadow-lg hover:bg-[#D59C58] transition-all duration-200 z-50 ${
            isHovered ? 'opacity-100 scale-100' : 'opacity-70 scale-90'
          }`}
          title={`Edit ${sectionName}`}
        >
          <svg
            className="w-4 h-4"
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
        </button>
      )}
    </div>
  );
}
