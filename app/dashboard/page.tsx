"use client";

import { useDashboardStats } from '@/hooks/use-dashboard'
import { useAuth } from '@/components/supabase-auth-provider'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const { stats, loading, error } = useDashboardStats()
  const { user, userProfile, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user && userProfile?.role === 'organizer') {
      router.push('/dashboard/organizer')
    }
  }, [user, userProfile, authLoading, router])

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Error loading dashboard: {error}</div>
      </div>
    )
  }

  const dashboardStats = [
    { label: "Total Events", value: stats?.totalEvents || 0, bg: "bg-blue-100", text: "text-blue-900" },
    { label: "Active Events", value: stats?.activeEvents || 0, bg: "bg-green-100", text: "text-green-900" },
    { label: "Photos Uploaded", value: stats?.totalPhotos || 0, bg: "bg-purple-100", text: "text-purple-900" },
    { label: "RSVP Pending", value: stats?.pendingRSVPs || 0, bg: "bg-yellow-100", text: "text-yellow-900" },
  ];


  return (
    <>
      <h2 className="text-xl font-semibold text-[#6B3F0B] mb-6">Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {dashboardStats.map(stat => (
          <div key={stat.label} className={`rounded-lg p-6 ${stat.bg} ${stat.text} shadow-sm`}>
            <div className="text-sm font-medium mb-1 opacity-80">{stat.label}</div>
            <div className="text-3xl font-bold">{stat.value}</div>
          </div>
        ))}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-[#6B3F0B] mb-3">Recent Activity</h3>
        <div className="bg-gray-50 rounded-lg p-6">
          {stats?.recentActivity && stats.recentActivity.length > 0 ? (
            <ul className="space-y-2">
              {stats.recentActivity.map((item, idx) => (
                <li key={idx} className="text-base text-gray-800">
                  {item.message}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500">No recent activity</div>
          )}
        </div>
      </div>
    </>
  );
} 