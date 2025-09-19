import React from 'react';
import CollapsibleSection from '../CollapsibleSection';

interface InfoItem {
  id: string;
  title: string;
  description: string;
}

interface DynamicAdditionalInfoSectionProps {
  title: string;
  content: string;
  items: InfoItem[];
}

export default function DynamicAdditionalInfoSection({ 
  title, 
  content, 
  items 
}: DynamicAdditionalInfoSectionProps) {
  return (
    <CollapsibleSection title="Additional Information">
      <div className="flex flex-col items-center justify-center px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div
            className="font-normal mb-4"
            style={{
              fontFamily: 'Sail',
              background: 'linear-gradient(90deg, #E5B574 0%, #C18037 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block',
              letterSpacing: '2px',
              lineHeight: 1.1,
              fontSize: 'clamp(2.5rem, 10vw, 4rem)',
            }}
          >
            {title}
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full max-w-4xl mx-auto">
          {content && (
            <div className="text-center mb-8">
              <div className="text-black leading-relaxed" 
                   style={{ 
                     fontFamily: 'Montserrat',
                     fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                     lineHeight: 1.6
                   }}>
                {content}
              </div>
            </div>
          )}

          {/* Additional Items */}
          {items.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {items.map((item) => (
                <div key={item.id} className="bg-white/50 rounded-lg p-6 border border-gray-200">
                  <h3 className="font-bold text-[#08080A] mb-3" 
                      style={{ 
                        fontFamily: 'Montserrat', 
                        fontSize: 'clamp(1rem, 3vw, 1.125rem)',
                        letterSpacing: '0.5px'
                      }}>
                    {item.title}
                  </h3>
                  <p className="text-gray-700" 
                     style={{ 
                       fontFamily: 'Montserrat', 
                       fontWeight: 400,
                       fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                       lineHeight: 1.5
                     }}>
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </CollapsibleSection>
  );
}
