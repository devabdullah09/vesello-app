"use client";
import { DashboardHeader } from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/components/supabase-auth-provider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C18037] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole="guest">
    <div className="min-h-screen bg-white">
      <DashboardHeader />
      <div className="min-h-screen bg-white pt-20">
          <Sidebar role={(userProfile?.role === 'superadmin' ? 'superadmin' : 'organizer')} />
        <main className="ml-72 p-12 bg-white min-h-screen relative">
          {children}
        </main>
      </div>
    </div>
    </ProtectedRoute>
  );
} 