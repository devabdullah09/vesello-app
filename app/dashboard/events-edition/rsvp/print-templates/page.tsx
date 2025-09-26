"use client";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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

interface RSVPTemplate {
  id: string;
  name: string;
  format: 'A5' | 'BusinessCard';
  description: string;
  category: 'Invitation' | 'Reminder' | 'Table Tent' | 'Thank You' | 'Timeline';
}

const a5RSVPTemplates: RSVPTemplate[] = [
  {
    id: 'a5-invitation-qr',
    name: 'Wedding Invitation with RSVP',
    format: 'A5',
    description: 'Elegant invitation with RSVP QR code',
    category: 'Invitation'
  },
  {
    id: 'a5-rsvp-reminder',
    name: 'RSVP Reminder Card',
    format: 'A5',
    description: 'Gentle reminder to RSVP with QR code',
    category: 'Reminder'
  },
  {
    id: 'a5-table-tent',
    name: 'Table Tent RSVP',
    format: 'A5',
    description: 'Table tent with RSVP QR code',
    category: 'Table Tent'
  },
  {
    id: 'a5-thank-you-rsvp',
    name: 'Thank You with RSVP',
    format: 'A5',
    description: 'Thank you card with RSVP option',
    category: 'Thank You'
  },
  {
    id: 'a5-timeline-rsvp',
    name: 'Wedding Timeline with RSVP',
    format: 'A5',
    description: 'Timeline with RSVP QR code',
    category: 'Timeline'
  }
];

const businessCardRSVPTemplates: RSVPTemplate[] = [
  {
    id: 'bc-invitation-card',
    name: 'Mini Invitation Card',
    format: 'BusinessCard',
    description: 'Small invitation with RSVP QR code',
    category: 'Invitation'
  },
  {
    id: 'bc-rsvp-reminder',
    name: 'RSVP Reminder',
    format: 'BusinessCard',
    description: 'Small reminder to RSVP',
    category: 'Reminder'
  },
  {
    id: 'bc-table-tent',
    name: 'Table Tent QR Card',
    format: 'BusinessCard',
    description: 'Table tent with RSVP QR code',
    category: 'Table Tent'
  },
  {
    id: 'bc-thank-you-rsvp',
    name: 'Mini Thank You',
    format: 'BusinessCard',
    description: 'Small thank you with RSVP option',
    category: 'Thank You'
  },
  {
    id: 'bc-qr-simple-rsvp',
    name: 'Simple RSVP QR',
    format: 'BusinessCard',
    description: 'Minimalist RSVP QR code card',
    category: 'Invitation'
  }
];

export default function RSVPPrintTemplatesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<RSVPTemplate | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<RSVPTemplate | null>(null);

  const wwwId = searchParams.get('wwwId');
  const templateId = searchParams.get('template');

  useEffect(() => {
    if (!wwwId) {
      fetchEvents();
    } else {
      fetchEventDetails();
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

  const fetchEventDetails = async () => {
    try {
      const eventResponse = await fetch(`/api/event-id/${wwwId}`);
      if (!eventResponse.ok) {
        throw new Error('Event not found');
      }
      
      const eventResult = await eventResponse.json();
      setSelectedEvent(eventResult.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch event details');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (wwwId) {
      router.push("/dashboard/events-edition/rsvp/print-templates");
    } else {
      router.push("/dashboard/events-edition/rsvp");
    }
  };

  const handleEventSelect = (selectedWwwId: string) => {
    router.push(`/dashboard/events-edition/rsvp/print-templates?wwwId=${selectedWwwId}`);
  };

  const handleTemplateSelect = (template: RSVPTemplate) => {
    setSelectedTemplate(template);
    router.push(`/dashboard/events-edition/rsvp/print-templates?wwwId=${wwwId}&template=${template.id}`);
  };

  const handlePreviewTemplate = (template: RSVPTemplate) => {
    setPreviewTemplate(template);
    setShowPreviewModal(true);
  };

  const closePreviewModal = () => {
    setShowPreviewModal(false);
    setPreviewTemplate(null);
  };

  const handleDownloadTemplate = async (template: RSVPTemplate) => {
    if (!selectedEvent) return;

    try {
      const response = await fetch('/api/dashboard/events/rsvp-print-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: template.id,
          eventData: {
            wwwId: selectedEvent.wwwId,
            coupleNames: selectedEvent.coupleNames,
            eventDate: selectedEvent.eventDate,
            venue: selectedEvent.venue,
            title: selectedEvent.title,
            rsvpUrl: `${window.location.origin}/event-id/${selectedEvent.wwwId}/invitation`
          }
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rsvp-${template.name}-${selectedEvent.coupleNames.replace(/\s+/g, '-')}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Failed to generate template');
      }
    } catch (err) {
      alert('Failed to download template. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-12 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-12 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-lg">Error: {error}</div>
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
        
        <h1 className="text-3xl font-bold text-black mb-8">RSVP PRINT TEMPLATES</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-semibold text-black mb-6">Select an Event</h2>
          <p className="text-gray-600 mb-6">
            Choose an event to generate RSVP print templates with its information.
          </p>
          
          {events.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No events with RSVP enabled found.</p>
              <p className="text-gray-500 text-sm mb-6">
                To generate RSVP print templates, you need to enable the RSVP feature for your events first.
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
      </div>
    );
  }

  // Show templates when event is selected
  if (!selectedEvent) {
    return (
      <div className="flex-1 p-12 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading event details...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-12 bg-white min-h-screen">
      <div className="flex justify-between items-start mb-8">
        <button
          onClick={handleBack}
          className="bg-black text-white px-6 py-2 rounded font-semibold hover:bg-gray-800 transition-colors"
        >
          Back
        </button>
      </div>
      
      <h1 className="text-3xl font-bold text-black mb-4">RSVP PRINT TEMPLATES</h1>
      <p className="text-gray-600 mb-8">
        Creating RSVP templates for: <span className="font-semibold">{selectedEvent.title}</span> - {selectedEvent.coupleNames}
      </p>
      
      {/* A5 FORMAT Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-black mb-6">A5 FORMAT</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {a5RSVPTemplates.map((template) => (
            <div key={template.id} className="flex flex-col items-center">
              <div 
                className="bg-white border-2 border-gray-200 hover:border-[#E5B574] w-32 h-44 rounded-lg mb-3 cursor-pointer transition-all shadow-sm hover:shadow-md relative overflow-hidden group"
                onClick={() => handleTemplateSelect(template)}
              >
                {/* Template Preview */}
                <div className="p-3 h-full flex flex-col justify-between text-xs">
                  {template.category === 'Invitation' && (
                    <>
                      <div className="text-center">
                        <div className="text-[8px] text-[#E5B574]">You're Invited!</div>
                        <div className="text-[10px] font-bold text-gray-800 mb-1">{selectedEvent.coupleNames}</div>
                        <div className="text-[8px] text-gray-600">Wedding</div>
                      </div>
                      <div className="bg-gray-200 w-8 h-8 mx-auto rounded"></div>
                      <div className="text-[6px] text-center text-gray-600">Scan to RSVP</div>
                    </>
                  )}
                  {template.category === 'Reminder' && (
                    <>
                      <div className="text-center">
                        <div className="text-[8px] font-bold text-gray-800 mb-1">RSVP Reminder</div>
                        <div className="text-[6px] text-gray-600">{selectedEvent.coupleNames}</div>
                      </div>
                      <div className="bg-gray-200 w-6 h-6 mx-auto rounded"></div>
                      <div className="text-[5px] text-center text-gray-600">Please RSVP</div>
                    </>
                  )}
                  {template.category === 'Table Tent' && (
                    <>
                      <div className="text-center">
                        <div className="text-[8px] font-bold text-gray-800 mb-1">Table Tent</div>
                        <div className="text-[6px] text-gray-600">RSVP Here</div>
                      </div>
                      <div className="bg-gray-200 w-6 h-6 mx-auto rounded"></div>
                      <div className="text-[5px] text-center text-gray-600">Scan QR Code</div>
                    </>
                  )}
                  {template.category === 'Thank You' && (
                    <>
                      <div className="text-center">
                        <div className="text-[8px] text-gray-600">Thank You</div>
                        <div className="text-[7px] font-bold text-[#E5B574]">{selectedEvent.coupleNames}</div>
                      </div>
                      <div className="bg-gray-200 w-6 h-6 mx-auto rounded"></div>
                      <div className="text-[5px] text-center text-gray-600">RSVP if needed</div>
                    </>
                  )}
                  {template.category === 'Timeline' && (
                    <>
                      <div className="text-center">
                        <div className="text-[8px] font-bold text-gray-800 mb-1">Timeline</div>
                        <div className="text-[6px] text-gray-600">{selectedEvent.coupleNames}</div>
                      </div>
                      <div className="bg-gray-200 w-6 h-6 mx-auto rounded"></div>
                      <div className="text-[5px] text-center text-gray-600">RSVP included</div>
                    </>
                  )}
                </div>
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-[#E5B574] bg-opacity-90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreviewTemplate(template);
                    }}
                    className="bg-white text-[#E5B574] px-3 py-1 rounded text-xs font-semibold"
                  >
                    Preview
                  </button>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm font-medium text-black mb-1">{template.name}</div>
                <div className="text-xs text-gray-500 mb-2">{template.description}</div>
                <button
                  onClick={() => handleDownloadTemplate(template)}
                  className="bg-[#E5B574] text-white px-3 py-1 rounded text-xs font-semibold hover:bg-[#D59C58] transition-colors"
                >
                  Download PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* BUSINESS CARD FORMAT Section */}
      <div>
        <h2 className="text-2xl font-bold text-black mb-6">BUSINESS CARD FORMAT</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {businessCardRSVPTemplates.map((template) => (
            <div key={template.id} className="flex flex-col items-center">
              <div 
                className="bg-white border-2 border-gray-200 hover:border-[#E5B574] w-36 h-24 rounded-lg mb-3 cursor-pointer transition-all shadow-sm hover:shadow-md relative overflow-hidden group"
                onClick={() => handleTemplateSelect(template)}
              >
                {/* Template Preview */}
                <div className="p-2 h-full flex flex-col justify-between text-xs">
                  {template.category === 'Invitation' && (
                    <>
                      <div className="text-center">
                        <div className="text-[6px] text-[#E5B574]">Invited!</div>
                        <div className="text-[7px] font-bold text-gray-800">{selectedEvent.coupleNames}</div>
                      </div>
                      <div className="bg-gray-200 w-4 h-4 mx-auto rounded"></div>
                    </>
                  )}
                  {template.category === 'Reminder' && (
                    <>
                      <div className="text-center">
                        <div className="text-[6px] font-bold text-gray-800">RSVP</div>
                        <div className="text-[5px] text-gray-600">Reminder</div>
                      </div>
                      <div className="bg-gray-200 w-3 h-3 mx-auto rounded"></div>
                    </>
                  )}
                  {template.category === 'Table Tent' && (
                    <>
                      <div className="text-center">
                        <div className="text-[6px] font-bold text-gray-800">RSVP</div>
                        <div className="text-[5px] text-gray-600">Here</div>
                      </div>
                      <div className="bg-gray-200 w-3 h-3 mx-auto rounded"></div>
                    </>
                  )}
                  {template.category === 'Thank You' && (
                    <>
                      <div className="text-center">
                        <div className="text-[6px] text-gray-600">Thanks!</div>
                        <div className="text-[5px] font-bold text-[#E5B574]">{selectedEvent.coupleNames}</div>
                      </div>
                      <div className="bg-gray-200 w-3 h-3 mx-auto rounded"></div>
                    </>
                  )}
                </div>
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-[#E5B574] bg-opacity-90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreviewTemplate(template);
                    }}
                    className="bg-white text-[#E5B574] px-2 py-1 rounded text-xs font-semibold"
                  >
                    Preview
                  </button>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm font-medium text-black mb-1">{template.name}</div>
                <div className="text-xs text-gray-500 mb-2">{template.description}</div>
                <button
                  onClick={() => handleDownloadTemplate(template)}
                  className="bg-[#E5B574] text-white px-3 py-1 rounded text-xs font-semibold hover:bg-[#D59C58] transition-colors"
                >
                  Download PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Canva Integration Section */}
      <div className="mt-12 p-8 bg-gradient-to-r from-[#E5B574] to-[#D59C58] rounded-lg">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Need Custom Designs?</h3>
          <p className="text-white/90 mb-6">
            Create stunning custom RSVP templates with Canva's professional design tools
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.open('https://canva.com', '_blank')}
              className="bg-white text-[#E5B574] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Open Canva
            </button>
            <button
              onClick={() => alert('Custom template upload feature coming soon!')}
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#E5B574] transition-colors"
            >
              Upload Custom Template
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && previewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h3 className="text-xl font-semibold text-black">{previewTemplate.name}</h3>
                <p className="text-gray-600 text-sm">{previewTemplate.description}</p>
              </div>
              <button
                onClick={closePreviewModal}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Template Preview */}
                <div className="flex-1 flex justify-center">
                  <div className="bg-gray-50 p-8 rounded-lg">
                    {previewTemplate.format === 'A5' ? (
                      <div 
                        className="bg-white shadow-lg border border-gray-200 p-8 mx-auto"
                        style={{ 
                          width: '300px', 
                          height: '424px', 
                          transform: 'scale(0.8)',
                          transformOrigin: 'top center'
                        }}
                      >
                        {renderRSVPTemplatePreview(previewTemplate, selectedEvent)}
                      </div>
                    ) : (
                      <div 
                        className="bg-white shadow-lg border border-gray-200 p-4 mx-auto"
                        style={{ 
                          width: '240px', 
                          height: '150px',
                          transform: 'scale(1.2)',
                          transformOrigin: 'center'
                        }}
                      >
                        {renderRSVPTemplatePreview(previewTemplate, selectedEvent)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Template Info */}
                <div className="lg:w-80">
                  <h4 className="text-lg font-semibold text-black mb-4">Template Details</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Format:</span>
                      <span className="ml-2 text-gray-600">{previewTemplate.format}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Category:</span>
                      <span className="ml-2 text-gray-600">{previewTemplate.category}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Event:</span>
                      <span className="ml-2 text-gray-600">{selectedEvent.coupleNames}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Date:</span>
                      <span className="ml-2 text-gray-600">
                        {new Date(selectedEvent.eventDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    {selectedEvent.venue && (
                      <div>
                        <span className="font-medium text-gray-700">Venue:</span>
                        <span className="ml-2 text-gray-600">{selectedEvent.venue}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-8 space-y-3">
                    <button
                      onClick={() => handleDownloadTemplate(previewTemplate)}
                      className="w-full bg-[#E5B574] text-white py-3 rounded-lg font-semibold hover:bg-[#D59C58] transition-colors"
                    >
                      Download PDF
                    </button>
                    <button
                      onClick={closePreviewModal}
                      className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                      Close Preview
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// RSVP Template Preview Renderer
function renderRSVPTemplatePreview(template: RSVPTemplate, event: Event | null) {
  if (!event) return <div>Loading...</div>;

  const formattedDate = new Date(event.eventDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const isA5 = template.format === 'A5';
  const baseTextSize = isA5 ? 'text-base' : 'text-xs';
  const titleSize = isA5 ? 'text-2xl' : 'text-sm';
  const coupleSize = isA5 ? 'text-3xl' : 'text-base';

  if (template.id === 'a5-invitation-qr' || template.id === 'bc-invitation-card') {
    return (
      <div className="h-full flex flex-col justify-center items-center text-center">
        <div className={`text-[#E5B574] ${isA5 ? 'text-lg' : 'text-xs'} mb-2`}>You're Invited!</div>
        <div className={`text-gray-600 ${isA5 ? 'text-sm' : 'text-xs'} mb-2`}>To the Wedding of</div>
        <div className={`font-bold text-gray-800 ${coupleSize} mb-1`}>{event.coupleNames}</div>
        <div className={`text-gray-600 ${isA5 ? 'text-sm' : 'text-xs'} mb-4`}>
          {formattedDate}
          {event.venue && <><br/>{event.venue}</>}
        </div>
        <div className={`bg-gray-200 ${isA5 ? 'w-20 h-20' : 'w-12 h-12'} mx-auto mb-2 flex items-center justify-center rounded`}>
          QR
        </div>
        <div className={`text-gray-600 ${isA5 ? 'text-xs' : 'text-xs'}`}>Scan to RSVP</div>
      </div>
    );
  }

  if (template.id === 'a5-rsvp-reminder' || template.id === 'bc-rsvp-reminder') {
    return (
      <div className="h-full flex flex-col justify-center items-center text-center">
        <div className={`font-bold text-gray-800 ${titleSize} mb-2`}>{isA5 ? 'RSVP REMINDER' : 'RSVP'}</div>
        <div className={`text-[#E5B574] ${baseTextSize} mb-3`}>{event.coupleNames} Wedding</div>
        {isA5 && (
          <div className="text-sm text-gray-600 mb-4 leading-relaxed">
            Please confirm your attendance<br/>
            by scanning the QR code below
          </div>
        )}
        <div className={`bg-gray-200 ${isA5 ? 'w-16 h-16' : 'w-8 h-8'} mx-auto mb-2 flex items-center justify-center rounded`}>
          QR
        </div>
        <div className={`text-gray-600 font-bold ${isA5 ? 'text-sm' : 'text-xs'}`}>
          {isA5 ? 'SCAN TO RSVP' : 'RSVP'}
        </div>
      </div>
    );
  }

  if (template.id === 'a5-table-tent' || template.id === 'bc-table-tent') {
    return (
      <div className="h-full flex flex-col justify-center items-center text-center">
        <div className={`text-[#E5B574] ${isA5 ? 'text-lg' : 'text-xs'} mb-2`}>{isA5 ? 'Table Tent' : 'RSVP'}</div>
        <div className={`text-gray-800 ${baseTextSize} mb-2`}>{event.coupleNames}</div>
        <div className={`text-gray-600 ${isA5 ? 'text-sm' : 'text-xs'} mb-4`}>
          {isA5 ? 'Wedding Celebration' : 'Wedding'}
        </div>
        <div className={`bg-gray-200 ${isA5 ? 'w-14 h-14' : 'w-8 h-8'} mx-auto mb-2 flex items-center justify-center rounded`}>
          QR
        </div>
        <div className={`text-gray-600 ${isA5 ? 'text-xs' : 'text-xs'}`}>Scan to RSVP</div>
      </div>
    );
  }

  if (template.id === 'a5-thank-you-rsvp' || template.id === 'bc-thank-you-rsvp') {
    return (
      <div className="h-full flex flex-col justify-center items-center text-center">
        <div className={`text-[#E5B574] font-bold ${isA5 ? 'text-3xl' : 'text-sm'} mb-2`}>Thank You</div>
        <div className={`text-gray-800 ${baseTextSize} mb-2`}>{event.coupleNames}</div>
        <div className={`text-gray-600 ${isA5 ? 'text-sm' : 'text-xs'} mb-4`}>
          {isA5 ? 'For celebrating with us!' : 'For joining us!'}
        </div>
        <div className={`bg-gray-200 ${isA5 ? 'w-16 h-16' : 'w-8 h-8'} mx-auto mb-2 flex items-center justify-center rounded`}>
          QR
        </div>
        <div className={`text-gray-600 ${isA5 ? 'text-xs' : 'text-xs'}`}>RSVP if needed</div>
      </div>
    );
  }

  if (template.id === 'a5-timeline-rsvp') {
    return (
      <div className="h-full flex flex-col justify-center items-center text-center">
        <div className="text-[#E5B574] font-bold text-lg mb-2">Wedding Timeline</div>
        <div className="text-gray-800 text-base mb-1">{event.coupleNames}</div>
        <div className="text-gray-600 text-sm mb-4">{formattedDate}</div>
        <div className="text-xs text-gray-600 mb-4 leading-relaxed">
          2:00 PM - Ceremony<br/>
          3:30 PM - Cocktail Hour<br/>
          5:00 PM - Reception<br/>
          9:00 PM - Dancing
        </div>
        <div className="bg-gray-200 w-14 h-14 mx-auto mb-2 flex items-center justify-center rounded">
          QR
        </div>
        <div className="text-gray-600 text-xs">RSVP here if needed</div>
      </div>
    );
  }

  if (template.id === 'bc-qr-simple-rsvp') {
    return (
      <div className="h-full flex flex-col justify-center items-center text-center">
        <div className="text-[#E5B574] text-xs mb-1">RSVP</div>
        <div className="text-gray-800 text-sm mb-3">{event.coupleNames}</div>
        <div className="bg-gray-200 w-16 h-16 mx-auto flex items-center justify-center rounded">
          QR
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col justify-center items-center text-center">
      <div className="text-[#E5B574] font-bold text-lg">{event.coupleNames}</div>
      <div className="text-gray-600 text-sm mb-4">Wedding RSVP</div>
      <div className="bg-gray-200 w-12 h-12 mx-auto mb-2 flex items-center justify-center rounded">
        QR
      </div>
      <div className="text-gray-600 text-xs">Scan to RSVP</div>
    </div>
  );
}
