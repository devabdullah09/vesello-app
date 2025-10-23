'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/components/language-context';

export default function RSVPSection() {
  const { t } = useLanguage();
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
          <h2 className="text-4xl md:text-5xl font-serif text-amber-600 mb-4">{t.rsvp.title}</h2>
          <p className="text-xl text-gray-600">{t.rsvp.subtitle}</p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          {isSuccess ? (
            <div className="text-center py-12">
              <div className="text-green-500 text-6xl mb-4">✓</div>
              <h3 className="text-2xl font-serif text-amber-600 mb-2">{t.rsvp.thankYou}</h3>
              <p className="text-gray-600">{t.rsvp.receivedRsvp}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-gray-700 mb-2">{t.rsvp.yourName} *</label>
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
                  <label htmlFor="email" className="block text-gray-700 mb-2">{t.rsvp.emailAddress} *</label>
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
                  <label htmlFor="guests" className="block text-gray-700 mb-2">{t.rsvp.numberOfGuests} *</label>
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
                        {num} {num === 1 ? t.rsvp.guest : t.rsvp.guests}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2">{t.rsvp.willYouAttend} *</label>
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
                      <span className="ml-2">{t.rsvp.acceptWithPleasure}</span>
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
                      <span className="ml-2">{t.rsvp.declineWithRegret}</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-gray-700 mb-2">{t.rsvp.leaveMessage}</label>
                <textarea
                  id="message"
                  name="message"
                  rows={3}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder={t.rsvp.dietaryRestrictions}
                ></textarea>
              </div>
              
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto bg-amber-600 text-white py-3 px-8 rounded-md hover:bg-amber-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? t.rsvp.sending : t.rsvp.submitRsvp}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
