'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface DynamicRSVPSectionProps {
  eventId: string;
  wwwId: string;
  coupleNames: string;
  eventDate: string;
  venue?: string;
  rsvpEnabled: boolean;
}

export default function DynamicRSVPSection({ 
  eventId, 
  wwwId, 
  coupleNames, 
  eventDate, 
  venue, 
  rsvpEnabled 
}: DynamicRSVPSectionProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    guests: '1',
    attendance: 'accept',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/event-id/${wwwId}/rsvp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guestName: formData.name,
          email: formData.email,
          attendance: formData.attendance === 'accept' ? 'attending' : 'not_attending',
          guestCount: parseInt(formData.guests),
          message: formData.message
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
      } else {
        throw new Error('Failed to submit RSVP');
      }
    } catch (error) {
      console.error('RSVP submission error:', error);
      alert('Failed to submit RSVP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!rsvpEnabled) {
    return null;
  }

  const eventDateObj = new Date(eventDate);
  const formattedDate = eventDateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  if (isSuccess) {
    return (
      <div className="py-16 px-4 bg-gradient-to-br from-[#F8F5F0] to-[#E8DCC6]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-lg shadow-lg p-12">
            <div className="text-green-600 text-6xl mb-6">✅</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">RSVP Submitted!</h2>
            <p className="text-lg text-gray-600 mb-8">
              Thank you for your response, {formData.name}! We look forward to celebrating with you.
            </p>
            <Link 
              href={`/event-id/${wwwId}`}
              className="bg-[#E5B574] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#D59C58] transition-colors"
            >
              Back to Event
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 px-4 bg-gradient-to-br from-[#F8F5F0] to-[#E8DCC6]">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#E5B574] to-[#C18037] p-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-2">RSVP</h2>
            <p className="text-white/90 text-lg">{coupleNames}</p>
            <div className="mt-4 text-white/90">
              <p className="text-lg font-semibold">{formattedDate}</p>
              {venue && <p className="text-sm">{venue}</p>}
            </div>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5B574] focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5B574] focus:border-transparent"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="attendance" className="block text-sm font-medium text-gray-700 mb-2">
                    Will you be attending? *
                  </label>
                  <select
                    id="attendance"
                    name="attendance"
                    value={formData.attendance}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5B574] focus:border-transparent"
                  >
                    <option value="accept">Yes, I'll be there!</option>
                    <option value="decline">No, I can't make it</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Guests
                  </label>
                  <select
                    id="guests"
                    name="guests"
                    value={formData.guests}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5B574] focus:border-transparent"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message for the Couple
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5B574] focus:border-transparent"
                  placeholder="Share your well wishes or any other message"
                />
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#E5B574] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#D59C58] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit RSVP'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
