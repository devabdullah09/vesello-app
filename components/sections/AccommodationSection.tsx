import React from 'react';
import CollapsibleSection from '../CollapsibleSection';

interface Hotel {
  id: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  description?: string;
  priceRange?: string;
}

interface AccommodationSectionProps {
  title?: string;
  description?: string;
  hotels?: Hotel[];
}

export default function AccommodationSection({ 
  title = 'Accommodation',
  description = 'Here are some hotel options for out-of-town guests.',
  hotels = []
}: AccommodationSectionProps) {
  return (
    <CollapsibleSection title={title}>
      {/* Description */}
      {description && (
        <div className="text-center mb-6">
          <p className="text-gray-700" 
             style={{ 
               fontFamily: 'Montserrat',
               fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
               lineHeight: 1.5
             }}>
            {description}
          </p>
        </div>
      )}
      
      {/* Hotels */}
      <div className="flex flex-col items-center justify-center mt-8 mb-2" style={{ fontFamily: 'Montserrat' }}>
        {hotels.length > 0 ? (
          <div className="text-center mb-10 max-w-4xl mx-auto">
            {hotels.map((hotel) => (
              <div key={hotel.id} className="mb-8 p-6 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold mb-2" 
                     style={{ fontSize: 'clamp(1.125rem, 3vw, 1.25rem)' }}>
                  {hotel.name}
                </div>
                <div className="text-base mb-2" 
                     style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1rem)' }}>
                  {hotel.address}
                </div>
                {hotel.description && (
                  <div className="text-base mb-2" 
                       style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1rem)' }}>
                    {hotel.description}
                  </div>
                )}
                {hotel.priceRange && (
                  <div className="text-base mb-2 font-semibold text-[#E5B574]" 
                       style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1rem)' }}>
                    {hotel.priceRange}
                  </div>
                )}
                <div className="space-y-1">
                  {hotel.phone && (
                    <div className="text-base" 
                         style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1rem)' }}>
                      Phone: {hotel.phone}
                    </div>
                  )}
                  {hotel.website && (
                    <div className="text-base" 
                         style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1rem)' }}>
                      <a href={hotel.website} target="_blank" rel="noopener noreferrer" 
                         className="text-[#E5B574] hover:text-[#D59C58] transition-colors">
                        Website: {hotel.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500" 
               style={{ 
                 fontFamily: 'Montserrat',
                 fontSize: 'clamp(0.875rem, 2.5vw, 1rem)'
               }}>
              No accommodation information available yet.
            </p>
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
}
