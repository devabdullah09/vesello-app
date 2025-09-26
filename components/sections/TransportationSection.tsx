import React from 'react';
import CollapsibleSection from '../CollapsibleSection';

interface TransportationOption {
  id: string;
  type: string;
  description: string;
  details?: string;
}

interface TransportationSectionProps {
  title?: string;
  description?: string;
  options?: TransportationOption[];
}

export default function TransportationSection({ 
  title = 'Transportation',
  description = 'Information about getting to and from the venue.',
  options = []
}: TransportationSectionProps) {
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
      
      {/* Transportation Options */}
      <div className="flex flex-col items-center justify-center mt-8 mb-2" style={{ fontFamily: 'Montserrat' }}>
        {options.length > 0 ? (
          <div className="text-center max-w-4xl mx-auto">
            {options.map((option) => (
              <div key={option.id} className="mb-6 p-6 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold mb-2" 
                     style={{ fontSize: 'clamp(1.125rem, 3vw, 1.25rem)' }}>
                  {option.type}
                </div>
                <div className="text-base mb-2" 
                     style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1rem)' }}>
                  {option.description}
                </div>
                {option.details && (
                  <div className="text-base text-gray-600" 
                       style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1rem)' }}>
                    {option.details}
                  </div>
                )}
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
              No transportation information available yet.
            </p>
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
}
