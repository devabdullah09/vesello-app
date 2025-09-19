"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { InvitationRSVP } from '@/lib/invitation-types';
import EventHeader from '@/components/layout/EventHeader';

export default function DynamicRSVPDashboardPage() {
  const params = useParams();
  const wwwId = params?.wwwId as string;
  const [rsvps, setRsvps] = useState<InvitationRSVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRSVPs();
  }, [wwwId]);

  const fetchRSVPs = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from Supabase first
      try {
        const response = await fetch(`/api/event-id/${wwwId}/invitation/rsvps`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setRsvps(data.rsvps);
            return;
          } else {
            throw new Error(data.message || 'Failed to fetch RSVPs');
          }
        }
      } catch (supabaseError) {
        console.log('Supabase fetch failed, checking for local RSVPs:', supabaseError);
      }

      // Fallback: Check if there are local RSVPs
      try {
        const localResponse = await fetch(`/api/event-id/${wwwId}/invitation/rsvp`);
        if (localResponse.ok) {
          const localData = await localResponse.json();
          if (localData.localRSVPCount > 0) {
            // Show message about local storage
            setRsvps([]);
            setError(`Supabase not accessible. ${localData.localRSVPCount} RSVP(s) stored locally. Check Supabase configuration.`);
            return;
          }
        }
      } catch (localError) {
        console.log('Local RSVP check failed:', localError);
      }

      // No RSVPs found
      setRsvps([]);
      setError('No RSVPs found. Check Supabase configuration and permissions.');
      
    } catch (error) {
      console.error('Error fetching RSVPs:', error);
      setError('Failed to load RSVPs. Check Supabase configuration.');
    } finally {
      setLoading(false);
    }
  };

  const getGuestCount = (rsvp: InvitationRSVP) => {
    return 1 + rsvp.additionalGuests.length;
  };

  const getAttendanceSummary = (rsvp: InvitationRSVP) => {
    const weddingAttending = Object.values(rsvp.weddingDayAttendance).filter(a => a === 'will').length;
    const afterPartyAttending = Object.values(rsvp.afterPartyAttendance).filter(a => a === 'will').length;
    
    return {
      wedding: weddingAttending,
      afterParty: afterPartyAttending,
      total: getGuestCount(rsvp)
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading RSVPs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <>
      <EventHeader 
        eventId={wwwId}
        galleryEnabled={true}
        rsvpEnabled={true}
        currentPage="rsvp"
      />
      <div className="min-h-screen bg-gray-50 py-8 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            RSVP Dashboard - Event {wwwId}
          </h1>

          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{rsvps.length}</div>
                <div className="text-sm text-blue-600">Total Responses</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {rsvps.reduce((total, rsvp) => total + getGuestCount(rsvp), 0)}
                </div>
                <div className="text-sm text-green-600">Total Guests</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {rsvps.reduce((total, rsvp) => {
                    const summary = getAttendanceSummary(rsvp);
                    return total + summary.wedding;
                  }, 0)}
                </div>
                <div className="text-sm text-purple-600">Wedding Day</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {rsvps.reduce((total, rsvp) => {
                    const summary = getAttendanceSummary(rsvp);
                    return total + summary.afterParty;
                  }, 0)}
                </div>
                <div className="text-sm text-orange-600">After Party</div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guest
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Guests
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wedding Day
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    After Party
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Food Preferences
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rsvps.map((rsvp) => {
                  const summary = getAttendanceSummary(rsvp);
                  return (
                    <tr key={rsvp.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {rsvp.mainGuest.name} {rsvp.mainGuest.surname}
                        </div>
                        {rsvp.email && (
                          <div className="text-sm text-gray-500">{rsvp.email}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {summary.total}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {summary.wedding}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {summary.afterParty}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="space-y-1">
                          {Object.entries(rsvp.foodPreferences).map(([guestName, preference]) => (
                            <div key={guestName} className="text-xs">
                              {guestName}: {preference}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {rsvp.submittedAt.toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {rsvps.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">No RSVPs submitted yet</div>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
