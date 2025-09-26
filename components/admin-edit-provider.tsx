'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/components/supabase-auth-provider';
import supabase from '@/lib/supabase';

interface AdminEditContextType {
  isAdminMode: boolean;
  toggleAdminMode: () => void;
  canEdit: boolean;
  eventOwner: boolean;
}

const AdminEditContext = createContext<AdminEditContextType>({
  isAdminMode: false,
  toggleAdminMode: () => {},
  canEdit: false,
  eventOwner: false,
});

export const useAdminEdit = () => {
  const context = useContext(AdminEditContext);
  if (!context) {
    throw new Error('useAdminEdit must be used within AdminEditProvider');
  }
  return context;
};

interface AdminEditProviderProps {
  children: React.ReactNode;
  eventOwnerId?: string;
}

export function AdminEditProvider({ children, eventOwnerId }: AdminEditProviderProps) {
  const { user } = useAuth();
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [eventOwner, setEventOwner] = useState(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user) {
        setCanEdit(false);
        setEventOwner(false);
        return;
      }

      try {
        // Check if user is superadmin first
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        const isSuperAdmin = userProfile?.role === 'superadmin';
        
        if (isSuperAdmin) {
          // Superadmin can edit all events
          setCanEdit(true);
          setEventOwner(true);
          return;
        }

        // Check if user is the event owner (only if eventOwnerId exists)
        if (eventOwnerId) {
          const isOwner = user.id === eventOwnerId;
          setEventOwner(isOwner);
          setCanEdit(isOwner);
        } else {
          // If no eventOwnerId, only superadmin can edit
          setCanEdit(false);
          setEventOwner(false);
        }
      } catch (error) {
        console.error('Error checking admin access:', error);
        setCanEdit(false);
        setEventOwner(false);
      }
    };

    checkAdminAccess();
  }, [user, eventOwnerId]);

  const toggleAdminMode = () => {
    if (canEdit) {
      setIsAdminMode(!isAdminMode);
    }
  };

  return (
    <AdminEditContext.Provider
      value={{
        isAdminMode,
        toggleAdminMode,
        canEdit,
        eventOwner,
      }}
    >
      {children}
    </AdminEditContext.Provider>
  );
}
