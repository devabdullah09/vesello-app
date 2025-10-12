import React from 'react';
import { MapPin } from 'lucide-react';
import CollapsibleSection from '../CollapsibleSection';

interface DynamicCeremonySectionProps {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  details?: string;
  mapUrl?: string;
}

export default function DynamicCeremonySection({ 
  title, 
  description, 
  date, 
  time, 
  location, 
  details,
  mapUrl 
}: DynamicCeremonySectionProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).toUpperCase();
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).toUpperCase();
    } catch {
      return timeString;
    }
  };

  return (
    <CollapsibleSection title="Ceremony">
      <div className="flex flex-col md:flex-row items-center md:items-stretch">
        {/* Left: Text Content */}
        <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 md:px-10 py-6 md:py-0">
          <div className="mb-2">
            <span style={{ 
              fontFamily: 'Montserrat', 
              fontWeight: 400, 
              fontSize: 'clamp(0.875rem, 2.5vw, 1rem)', 
              color: '#08080A', 
              letterSpacing: '0.01em', 
              lineHeight: 1.4 
            }}>
              {description}
            </span>
          </div>
          <div className="mb-4 sm:mb-5">
            <span
              style={{
                fontFamily: 'Sail',
                fontWeight: 400,
                fontSize: 'clamp(1.5rem, 5vw, 2.2rem)',
                background: 'linear-gradient(90deg, #E5B574 0%, #D59C58 43%, #C18037 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block',
                letterSpacing: '1px',
                lineHeight: 1.1,
              }}
            >
              {title}
            </span>
          </div>
          <div className="space-y-1 mb-3">
            <div className="font-bold text-[#08080A]" 
                 style={{
                   fontFamily: 'Montserrat', 
                   letterSpacing: '0.5px',
                   fontSize: 'clamp(1rem, 3vw, 1.125rem)'
                 }}>
              {location.toUpperCase()}
            </div>
            <div className="text-[#08080A]" 
                 style={{
                   fontFamily: 'Montserrat', 
                   fontWeight: 500,
                   fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                   letterSpacing: '0.25px'
                 }}>
              {formatDate(date)}
            </div>
            <div className="text-[#08080A]" 
                 style={{
                   fontFamily: 'Montserrat', 
                   fontWeight: 500,
                   fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                   letterSpacing: '0.25px'
                 }}>
              {formatTime(time)}
            </div>
          </div>
          {details && (
            <div className="text-[#08080A] mb-4" 
                 style={{
                   fontFamily: 'Montserrat', 
                   fontWeight: 400,
                   fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                   lineHeight: 1.5
                 }}>
              {details}
            </div>
          )}
          {mapUrl ? (
            <a 
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-[#E5B574] cursor-pointer hover:text-[#D59C58] transition-colors"
            >
              <MapPin size={16} className="mr-2" />
              <span style={{ 
                fontFamily: 'Montserrat', 
                fontWeight: 500, 
                fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' 
              }}>
                View on Map
              </span>
            </a>
          ) : (
            <div className="flex items-center text-[#E5B574] cursor-pointer hover:text-[#D59C58] transition-colors">
              <MapPin size={16} className="mr-2" />
              <span style={{ 
                fontFamily: 'Montserrat', 
                fontWeight: 500, 
                fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' 
              }}>
                View on Map
              </span>
            </div>
          )}
        </div>
        
        {/* Right: Image */}
        <div className="flex-1 flex items-center justify-center p-4 md:p-6">
          <img
            src="/images/ceremony.png"
            alt="Wedding ceremony"
            className="w-full h-auto max-w-sm object-contain"
            style={{ maxHeight: '300px' }}
          />
        </div>
      </div>
    </CollapsibleSection>
  );
}
