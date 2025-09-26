"use client";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface RSVPQRData {
  eventId: string;
  wwwId: string;
  title: string;
  coupleNames: string;
  eventDate: string;
  venue?: string;
  rsvpUrl: string;
  qrCodeDataUrl: string;
  rsvpEnabled: boolean;
  status: string;
}

interface Event {
  id: string;
  wwwId: string;
  title: string;
  coupleNames: string;
  eventDate: string;
  venue?: string;
  status: string;
  rsvpEnabled: boolean;
}

export default function RSVPQRCodePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [rsvpData, setRsvpData] = useState<RSVPQRData | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const wwwId = searchParams.get('wwwId');

  useEffect(() => {
    if (!wwwId) {
      fetchEvents();
    } else {
      fetchRSVPQR();
    }
  }, [wwwId]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch('/api/dashboard/events', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch events');
      }

      const result = await response.json();
      // Filter events to only show those with RSVP enabled
      const allEvents = result.data.data || [];
      const rsvpEnabledEvents = allEvents.filter((event: Event) => event.rsvpEnabled);
      setEvents(rsvpEnabledEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const fetchRSVPQR = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Please log in to access this feature");
        return;
      }

      const response = await fetch(`/api/dashboard/events/rsvp-qr?wwwId=${encodeURIComponent(wwwId || '')}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch RSVP QR code');
      }

      const result = await response.json();
      setRsvpData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch RSVP QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push("/dashboard/events-edition/rsvp");
  };

  const handleEventSelect = (selectedWwwId: string) => {
    router.push(`/dashboard/events-edition/rsvp/qr-code?wwwId=${selectedWwwId}`);
  };

  const downloadQRCode = () => {
    if (!rsvpData?.qrCodeDataUrl) return;

    const link = document.createElement('a');
    link.href = rsvpData.qrCodeDataUrl;
    link.download = `rsvp-qr-${rsvpData.wwwId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyLink = () => {
    if (!rsvpData?.rsvpUrl) return;
    navigator.clipboard.writeText(rsvpData.rsvpUrl);
    // You could add a toast notification here
  };

  const handleCanvaTemplate = (templateType: string) => {
    if (!rsvpData) return;

    // Map template types to specific search terms for Canva
    const canvaSearchTerms = {
      'elegant-gold': 'elegant gold wedding invitation',
      'modern-minimal': 'modern minimalist wedding invitation',
      'romantic-blush': 'romantic blush wedding invitation',
      'rustic-wood': 'rustic wood wedding invitation',
      'ocean-blue': 'beach ocean wedding invitation',
      'garden-green': 'garden wedding invitation'
    };

    const searchTerm = canvaSearchTerms[templateType as keyof typeof canvaSearchTerms] || 'wedding invitation';
    
    // Prepare event data
    const eventData = {
      coupleNames: rsvpData.coupleNames,
      eventDate: new Date(rsvpData.eventDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      venue: rsvpData.venue || 'TBA',
      title: rsvpData.title,
      rsvpUrl: rsvpData.rsvpUrl,
      templateType: templateType
    };

    // Open Canva with search for the specific template style
    const canvaUrl = `https://canva.com/create/wedding-invitations?search=${encodeURIComponent(searchTerm)}`;
    window.open(canvaUrl, '_blank');
    
    // Show instructions with event details
    showTemplateInstructions(templateType, eventData);
  };

  const showTemplateInstructions = (templateType: string, eventData: any) => {
    // Create a modal with instructions
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-black">Canva Templates Found!</h3>
          <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>
        
        <div class="mb-4">
          <div class="bg-gradient-to-r from-[#E5B574] to-[#D59C58] text-white px-3 py-2 rounded-lg mb-3">
            <p class="font-semibold">${templateType.replace('-', ' ').toUpperCase()} TEMPLATE</p>
          </div>
          
          <div class="bg-gray-50 p-4 rounded-lg">
            <h4 class="font-semibold text-black mb-2">Your Event Details:</h4>
            <div class="space-y-1 text-sm">
              <p><strong>Couple:</strong> ${eventData.coupleNames}</p>
              <p><strong>Date:</strong> ${eventData.eventDate}</p>
              <p><strong>Venue:</strong> ${eventData.venue}</p>
              <p><strong>RSVP Link:</strong> <span class="text-xs break-all">${eventData.rsvpUrl}</span></p>
            </div>
          </div>
        </div>
        
        <div class="mb-4">
          <h4 class="font-semibold text-black mb-2">Quick Instructions:</h4>
          <ol class="text-sm text-gray-700 space-y-1">
            <li>1. Choose a template that matches your style</li>
            <li>2. Click on text boxes to replace with your details above</li>
            <li>3. Customize colors, fonts, and layout</li>
            <li>4. Download when finished!</li>
          </ol>
        </div>
        
        <div class="bg-blue-50 p-3 rounded-lg mb-4">
          <p class="text-xs text-blue-800">
            💡 <strong>Tip:</strong> You can add your own photos and customize the design further!
          </p>
        </div>
        
        <button 
          onclick="this.closest('.fixed').remove()" 
          class="w-full bg-[#E5B574] text-white py-2 rounded-lg font-semibold hover:bg-[#D59C58] transition-colors"
        >
          Got it! Start Designing
        </button>
      </div>
    `;
    
    document.body.appendChild(modal);
  };

  if (loading) {
    return (
      <div className="flex-1 p-12 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading RSVP details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-12 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-lg">Error: {error}</div>
        <button
          onClick={handleBack}
          className="mt-4 bg-black text-white px-6 py-2 rounded font-semibold hover:bg-gray-800 transition-colors"
        >
          Back
        </button>
      </div>
    );
  }

  // Show event selection interface when no wwwId is provided
  if (!wwwId) {
    return (
      <div className="flex-1 p-12 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-start mb-8">
          <button
            onClick={handleBack}
            className="bg-black text-white px-6 py-2 rounded font-semibold hover:bg-gray-800 transition-colors"
          >
            Back
          </button>
        </div>
        
        <h1 className="text-3xl font-bold text-black mb-8">RSVP QR CODE/LINK MANAGEMENT</h1>
        
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-lg">Loading events...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-red-600 text-lg">Error: {error}</div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-semibold text-black mb-6">Select an Event</h2>
          <p className="text-gray-600 mb-6">
            Choose an event to generate its RSVP QR code and link for sharing with guests.
          </p>
          
          {events.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No events with RSVP enabled found.</p>
              <p className="text-gray-500 text-sm mb-6">
                To generate RSVP QR codes, you need to enable the RSVP feature for your events first.
              </p>
              <button
                onClick={() => router.push('/dashboard/events-list')}
                className="bg-[#E5B574] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#D59C58] transition-colors"
              >
                Manage Events
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div
                  key={event.id}
                  onClick={() => handleEventSelect(event.wwwId)}
                  className="border border-gray-200 rounded-lg p-6 hover:border-[#E5B574] hover:shadow-md transition-all cursor-pointer"
                >
                  <h3 className="text-lg font-semibold text-black mb-2">{event.title}</h3>
                  <p className="text-[#E5B574] font-medium mb-3">{event.coupleNames}</p>
                  <p className="text-gray-600 text-sm mb-2">
                    {new Date(event.eventDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  {event.venue && (
                    <p className="text-gray-500 text-sm mb-3">{event.venue}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        event.status === 'active' ? 'bg-green-100 text-green-800' :
                        event.status === 'planned' ? 'bg-blue-100 text-blue-800' :
                        event.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </span>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-[#E5B574] text-white">
                        RSVP Enabled
                      </span>
                    </div>
                    <span className="text-[#E5B574] text-sm font-medium">Select →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
        )}
      </div>
    );
  }

  // Show RSVP QR code when event is selected
  if (!rsvpData) {
    return (
      <div className="flex-1 p-12 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading RSVP QR code...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-12 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-start mb-8">
        <button
          onClick={handleBack}
          className="bg-black text-white px-6 py-2 rounded font-semibold hover:bg-gray-800 transition-colors"
        >
          Back
        </button>
      </div>
      
      <h1 className="text-3xl font-bold text-black mb-8">RSVP QR CODE/LINK</h1>
      
      {/* Event Info */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-xl font-semibold text-black mb-4">Event Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">Event Title</label>
            <p className="text-lg font-medium text-black">{rsvpData.title}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Couple Names</label>
            <p className="text-lg font-medium text-black">{rsvpData.coupleNames}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Event Date</label>
            <p className="text-lg font-medium text-black">
              {new Date(rsvpData.eventDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Venue</label>
            <p className="text-lg font-medium text-black">{rsvpData.venue || 'Not specified'}</p>
        </div>
        </div>
      </div>

      <div className="flex justify-between items-start">
        {/* Left content - RSVP Link Section */}
        <div className="flex-1">
          <div className="mb-6">
            <p className="text-lg text-gray-700 mb-4">
              Copy the link and invite guests to your event RSVP
            </p>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-2xl font-bold text-black bg-white p-4 rounded border flex-1">
                {rsvpData.rsvpUrl}
              </div>
              <button
                onClick={copyLink}
                className="bg-[#E5B574] text-white px-4 py-2 rounded font-semibold hover:bg-[#D59C58] transition-colors"
              >
                Copy Link
              </button>
            </div>

            <p className="text-sm text-gray-700 mb-4">
              Download the QR code and share the event's RSVP page with your guests:
            </p>

            {/* Wedding Card Templates */}
            <div className="bg-white p-4 rounded border mb-4">
              <h3 className="font-semibold text-black mb-3">Wedding Card Templates</h3>
              {/* <p className="text-sm text-gray-600 mb-4">
                Choose from professional Canva templates with your event details:
              </p> */}
              {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               
                <div className="border border-gray-200 rounded-lg overflow-hidden hover:border-[#E5B574] transition-colors cursor-pointer group shadow-sm">
                  <div className="relative h-32 bg-gradient-to-br from-[#D4AF37] via-[#E5B574] to-[#D4AF37]">
                   
                    <div className="absolute inset-2 border-2 border-white/30 rounded-lg"></div>
                    <div className="absolute inset-4 border border-white/20 rounded-lg"></div>
                    
                   
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
                      <div className="text-white text-xs font-serif mb-1 opacity-90">You're Invited</div>
                      <div className="text-white text-sm font-bold mb-1">{rsvpData.coupleNames.split(' ')[0]} & {rsvpData.coupleNames.split(' ')[2]}</div>
                      <div className="text-white text-xs opacity-80">Wedding</div>
                      <div className="w-4 h-4 bg-white/20 rounded-full mt-2"></div>
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="font-semibold text-sm text-black mb-1">Elegant Gold</h4>
                    <p className="text-xs text-gray-600 mb-2">Classic luxury design</p>
                    <button
                      onClick={() => handleCanvaTemplate('elegant-gold')}
                      className="w-full bg-[#E5B574] text-white px-3 py-1.5 rounded text-xs font-semibold hover:bg-[#D59C58] transition-colors"
                    >
                      Find Templates
                    </button>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-lg overflow-hidden hover:border-[#E5B574] transition-colors cursor-pointer group shadow-sm">
                  <div className="relative h-32 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
                   
                    <div className="absolute top-2 right-2 w-6 h-6 border border-white/30"></div>
                    <div className="absolute bottom-2 left-2 w-4 h-4 bg-white/20"></div>
                    
                  
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
                      <div className="text-white text-xs font-light mb-2 opacity-80">WEDDING</div>
                      <div className="text-white text-sm font-bold mb-1">{rsvpData.coupleNames.split(' ')[0]} & {rsvpData.coupleNames.split(' ')[2]}</div>
                      <div className="w-8 h-0.5 bg-white/40 mb-1"></div>
                      <div className="text-white text-xs opacity-60">INVITATION</div>
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="font-semibold text-sm text-black mb-1">Modern Minimal</h4>
                    <p className="text-xs text-gray-600 mb-2">Clean contemporary style</p>
                    <button
                      onClick={() => handleCanvaTemplate('modern-minimal')}
                      className="w-full bg-[#E5B574] text-white px-3 py-1.5 rounded text-xs font-semibold hover:bg-[#D59C58] transition-colors"
                    >
                      Find Templates
                    </button>
                  </div>
                </div>

                
                <div className="border border-gray-200 rounded-lg overflow-hidden hover:border-[#E5B574] transition-colors cursor-pointer group shadow-sm">
                  <div className="relative h-32 bg-gradient-to-br from-rose-200 via-pink-100 to-rose-300">
                   
                    <div className="absolute top-1 right-1 w-3 h-3 bg-rose-400/40 rounded-full"></div>
                    <div className="absolute top-3 right-3 w-2 h-2 bg-pink-300/60 rounded-full"></div>
                    <div className="absolute bottom-2 left-2 w-4 h-4 bg-rose-300/30 rounded-full"></div>
                    
                   
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
                      <div className="text-rose-800 text-xs font-serif mb-1">Wedding Invitation</div>
                      <div className="text-rose-900 text-sm font-bold mb-1">{rsvpData.coupleNames.split(' ')[0]} & {rsvpData.coupleNames.split(' ')[2]}</div>
                      <div className="text-rose-700 text-xs">Together with their families</div>
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="font-semibold text-sm text-black mb-1">Romantic Blush</h4>
                    <p className="text-xs text-gray-600 mb-2">Soft romantic design</p>
                    <button
                      onClick={() => handleCanvaTemplate('romantic-blush')}
                      className="w-full bg-[#E5B574] text-white px-3 py-1.5 rounded text-xs font-semibold hover:bg-[#D59C58] transition-colors"
                    >
                      Find Templates
                    </button>
                  </div>
                </div>


                <div className="border border-gray-200 rounded-lg overflow-hidden hover:border-[#E5B574] transition-colors cursor-pointer group shadow-sm">
                  <div className="relative h-32 bg-gradient-to-br from-amber-800 via-orange-700 to-amber-900">
             
                    <div className="absolute inset-0 opacity-20">
                      <div className="w-full h-full bg-gradient-to-r from-transparent via-amber-600/20 to-transparent transform -skew-x-12"></div>
                    </div>
                    
                   
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
                      <div className="text-amber-100 text-xs font-serif mb-1">Join Us</div>
                      <div className="text-amber-50 text-sm font-bold mb-1">{rsvpData.coupleNames.split(' ')[0]} & {rsvpData.coupleNames.split(' ')[2]}</div>
                      <div className="text-amber-200 text-xs">For Our Wedding</div>
                      <div className="w-6 h-0.5 bg-amber-300/60 mt-1"></div>
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="font-semibold text-sm text-black mb-1">Rustic Wood</h4>
                    <p className="text-xs text-gray-600 mb-2">Warm vintage charm</p>
                    <button
                      onClick={() => handleCanvaTemplate('rustic-wood')}
                      className="w-full bg-[#E5B574] text-white px-3 py-1.5 rounded text-xs font-semibold hover:bg-[#D59C58] transition-colors"
                    >
                      Find Templates
                    </button>
                  </div>
                </div>


                <div className="border border-gray-200 rounded-lg overflow-hidden hover:border-[#E5B574] transition-colors cursor-pointer group shadow-sm">
                  <div className="relative h-32 bg-gradient-to-br from-cyan-400 via-blue-500 to-cyan-600">
                  
                    <div className="absolute bottom-0 left-0 w-full h-8 bg-cyan-300/30 rounded-t-full"></div>
                    <div className="absolute bottom-2 left-4 w-3 h-3 bg-white/30 rounded-full"></div>
                    <div className="absolute bottom-3 right-6 w-2 h-2 bg-cyan-200/40 rounded-full"></div>
                    
                   
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
                      <div className="text-cyan-50 text-xs font-light mb-1">Beach Wedding</div>
                      <div className="text-white text-sm font-bold mb-1">{rsvpData.coupleNames.split(' ')[0]} & {rsvpData.coupleNames.split(' ')[2]}</div>
                      <div className="text-cyan-100 text-xs">By the Ocean</div>
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="font-semibold text-sm text-black mb-1">Ocean Blue</h4>
                    <p className="text-xs text-gray-600 mb-2">Coastal celebration</p>
                    <button
                      onClick={() => handleCanvaTemplate('ocean-blue')}
                      className="w-full bg-[#E5B574] text-white px-3 py-1.5 rounded text-xs font-semibold hover:bg-[#D59C58] transition-colors"
                    >
                      Find Templates
                    </button>
                  </div>
                </div>

                
                <div className="border border-gray-200 rounded-lg overflow-hidden hover:border-[#E5B574] transition-colors cursor-pointer group shadow-sm">
                  <div className="relative h-32 bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600">
                  
                    <div className="absolute top-2 left-2 w-4 h-4 bg-emerald-300/40 transform rotate-45 rounded-sm"></div>
                    <div className="absolute top-4 left-4 w-3 h-3 bg-green-300/30 transform rotate-12 rounded-sm"></div>
                    <div className="absolute bottom-3 right-3 w-3 h-3 bg-emerald-200/50 transform -rotate-12 rounded-sm"></div>
                    
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
                      <div className="text-emerald-50 text-xs font-serif mb-1">Garden Party</div>
                      <div className="text-white text-sm font-bold mb-1">{rsvpData.coupleNames.split(' ')[0]} & {rsvpData.coupleNames.split(' ')[2]}</div>
                      <div className="text-emerald-100 text-xs">Among the Flowers</div>
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="font-semibold text-sm text-black mb-1">Garden Green</h4>
                    <p className="text-xs text-gray-600 mb-2">Natural garden theme</p>
                    <button
                      onClick={() => handleCanvaTemplate('garden-green')}
                      className="w-full bg-[#E5B574] text-white px-3 py-1.5 rounded text-xs font-semibold hover:bg-[#D59C58] transition-colors"
                    >
                      Find Templates
                    </button>
                  </div>
                </div>
              </div> */}
              
              {/* Canva Integration */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700 font-medium">Want more design options?</p>
                    <p className="text-xs text-gray-500">Browse thousands of professional templates</p>
        </div>
        <button
                    onClick={() => window.open('https://canva.com/create/wedding-invitations', '_blank')}
                    className="bg-gradient-to-r from-[#00C4CC] to-[#00A6B7] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-[#00A6B7] hover:to-[#008A9A] transition-all flex items-center gap-2"
        >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                    Browse All Templates
        </button>
      </div>
              </div>
            </div>

            {/* RSVP Status */}
            <div className="bg-white p-4 rounded border">
              <h3 className="font-semibold text-black mb-2">RSVP Status</h3>
              <div className="flex gap-4">
                <div className={`px-3 py-1 rounded text-sm ${rsvpData.rsvpEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  RSVP: {rsvpData.rsvpEnabled ? 'Enabled' : 'Disabled'}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right content - QR Code Section */}
        <div className="flex flex-col items-center ml-12">
          <div className="bg-white p-4 rounded shadow-sm">
            {rsvpData.qrCodeDataUrl ? (
              <img 
                src={rsvpData.qrCodeDataUrl} 
                alt="QR Code" 
                className="w-32 h-32"
              />
            ) : (
              <div className="bg-gray-200 w-32 h-32 flex items-center justify-center">
                <div className="text-gray-500 text-xs text-center">
                  QR Code<br />Error
                </div>
              </div>
            )}
          </div>
          <div className="text-left mt-4">
            <button 
              onClick={downloadQRCode}
              className="text-[#E5B574] font-semibold hover:underline"
            >
              Download QR Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 