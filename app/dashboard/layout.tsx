"use client";
import { DashboardHeader } from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/components/supabase-auth-provider";
import { useLanguage } from "@/components/language-context";
import { useState } from "react";
import { EventEditionProvider } from "@/components/event-edition-context";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userProfile, loading } = useAuth();
  const { t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C18037] mx-auto mb-4"></div>
          <p className="text-gray-600">{t.status.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole="guest">
    <EventEditionProvider>
    <div className="min-h-screen bg-white">
      <DashboardHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className="min-h-screen bg-white pt-20">
          <Sidebar 
            role={(userProfile?.role === 'superadmin' ? 'superadmin' : 'organizer')} 
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        <main className="ml-0 md:ml-72 p-4 md:p-12 bg-white min-h-screen relative">
          {children}
        </main>
      </div>
    </div>
    </EventEditionProvider>
    </ProtectedRoute>
  );
} 