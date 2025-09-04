'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function RSVPSection() {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      console.log('RSVP submitted:', formData);
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({
        name: '',
        email: '',
        guests: '1',
        attendance: 'accept',
        message: '',
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
    }, 1500);
  };

  return (
    <section id="rsvp" className="py-20 px-4 bg-amber-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif text-amber-600 mb-4">RSVP</h2>
          <p className="text-xl text-gray-600">We hope you can join us on our special day</p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          {isSuccess ? (
            <div className="text-center py-12">
              <div className="text-green-500 text-6xl mb-4">✓</div>
              <h3 className="text-2xl font-serif text-amber-600 mb-2">Thank You!</h3>
              <p className="text-gray-600">We've received your RSVP. We look forward to celebrating with you!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-gray-700 mb-2">Your Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="guests" className="block text-gray-700 mb-2">Number of Guests *</label>
                  <select
                    id="guests"
                    name="guests"
                    value={formData.guests}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  >
                    {[1, 2, 3, 4, 5].map(num => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2">Will you attend? *</label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="attendance"
                        value="accept"
                        checked={formData.attendance === 'accept'}
                        onChange={handleChange}
                        className="text-amber-600 focus:ring-amber-500"
                        required
                      />
                      <span className="ml-2">Accept with pleasure</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="attendance"
                        value="decline"
                        checked={formData.attendance === 'decline'}
                        onChange={handleChange}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <span className="ml-2">Decline with regret</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-gray-700 mb-2">Leave us a message (optional)</label>
                <textarea
                  id="message"
                  name="message"
                  rows={3}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Any dietary restrictions or special requests?"
                ></textarea>
              </div>
              
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto bg-amber-600 text-white py-3 px-8 rounded-md hover:bg-amber-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending...' : 'Submit RSVP'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
