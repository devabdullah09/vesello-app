"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface EventData {
  id: string;
  wwwId: string;
  title: string;
  coupleNames: string;
  eventDate: string;
  venue?: string;
}

interface RSVPFormData {
  guestName: string;
  email: string;
  phone?: string;
  attendance: 'attending' | 'not_attending' | 'maybe';
  guestCount: number;
  dietaryRestrictions?: string;
  message?: string;
}

export default function EventRSVPPage() {
  const params = useParams();
  const wwwId = params.wwwId as string;
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState<RSVPFormData>({
    guestName: '',
    email: '',
    phone: '',
    attendance: 'attending',
    guestCount: 1,
    dietaryRestrictions: '',
    message: ''
  });

  useEffect(() => {
    if (!wwwId) {
      setError('Invalid event link');
      setLoading(false);
      return;
    }

    fetchEventData();
  }, [wwwId]);

  const fetchEventData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/event-id/${wwwId}`);
      
      if (!response.ok) {
        throw new Error('Event not found');
      }

      const result = await response.json();
      setEventData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'guestCount' ? parseInt(value) || 1 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.guestName || !formData.email) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(`/api/event-id/${wwwId}/rsvp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit RSVP');
      }

      setSubmitted(true);
    } catch (err) {
      alert('Failed to submit RSVP. Please try again.');
      console.error('RSVP submission error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8F5F0] to-[#E8DCC6] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E5B574] mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Loading RSVP form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8F5F0] to-[#E8DCC6] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">RSVP Not Available</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            href={`/event-id/${wwwId}`}
            className="bg-[#E5B574] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#D59C58] transition-colors"
          >
            Back to Event
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8F5F0] to-[#E8DCC6] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="text-green-600 text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">RSVP Submitted!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for your response. We look forward to celebrating with you!
          </p>
          <Link 
            href={`/event-id/${wwwId}`}
            className="bg-[#E5B574] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#D59C58] transition-colors"
          >
            Back to Event
          </Link>
        </div>
      </div>
    );
  }

  const eventDate = new Date(eventData!.eventDate);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F5F0] to-[#E8DCC6]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href={`/event-id/${wwwId}`} className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <Image
                src="/images/logo.png"
                alt="Vasello"
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="text-xl font-bold text-gray-800">Vasello</span>
            </Link>
            <div className="flex items-center space-x-6">
              <Link href={`/event-id/${wwwId}`} className="text-gray-600 hover:text-[#E5B574] transition-colors">
                Home
              </Link>
              {eventData && (
                <Link href={`/event-id/${wwwId}/gallery`} className="text-gray-600 hover:text-[#E5B574] transition-colors">
                  Gallery
                </Link>
              )}
              <span className="text-[#E5B574] font-medium">Reply to Invitation</span>
            </div>
          </div>
        </div>
      </header>

      {/* RSVP Header */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Reply to Invitation</h1>
          <p className="text-xl text-[#E5B574] mb-6">{eventData?.coupleNames}</p>
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 shadow-sm max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-[#E5B574] rounded-full"></div>
              <span className="text-lg font-semibold text-gray-800">{formattedDate}</span>
            </div>
            {eventData?.venue && (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-3 h-3 bg-[#D59C58] rounded-full"></div>
                <span className="text-lg text-gray-700">{eventData.venue}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* RSVP Form */}
      <section className="pb-16 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Guest Name */}
              <div>
                <label htmlFor="guestName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="guestName"
                  name="guestName"
                  value={formData.guestName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5B574] focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5B574] focus:border-transparent"
                  placeholder="Enter your email address"
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5B574] focus:border-transparent"
                  placeholder="Enter your phone number"
                />
              </div>

              {/* Attendance */}
              <div>
                <label htmlFor="attendance" className="block text-sm font-medium text-gray-700 mb-2">
                  Will you be attending? *
                </label>
                <select
                  id="attendance"
                  name="attendance"
                  value={formData.attendance}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5B574] focus:border-transparent"
                >
                  <option value="attending">Yes, I'll be there!</option>
                  <option value="maybe">Maybe</option>
                  <option value="not_attending">No, I can't make it</option>
                </select>
              </div>

              {/* Guest Count */}
              {formData.attendance === 'attending' && (
                <div>
                  <label htmlFor="guestCount" className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Guests
                  </label>
                  <input
                    type="number"
                    id="guestCount"
                    name="guestCount"
                    value={formData.guestCount}
                    onChange={handleInputChange}
                    min="1"
                    max="10"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5B574] focus:border-transparent"
                  />
                </div>
              )}

              {/* Dietary Restrictions */}
              {formData.attendance === 'attending' && (
                <div>
                  <label htmlFor="dietaryRestrictions" className="block text-sm font-medium text-gray-700 mb-2">
                    Dietary Restrictions
                  </label>
                  <textarea
                    id="dietaryRestrictions"
                    name="dietaryRestrictions"
                    value={formData.dietaryRestrictions}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5B574] focus:border-transparent"
                    placeholder="Please let us know about any dietary restrictions or allergies"
                  />
                </div>
              )}

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message for the Couple
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5B574] focus:border-transparent"
                  placeholder="Share your well wishes or any other message"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#E5B574] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#D59C58] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit RSVP'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/30">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600">
            Powered by <span className="font-semibold text-[#E5B574]">Vasello</span> - Wedding Event Management
          </p>
        </div>
      </footer>
    </div>
  );
}
