import React from 'react';
import CollapsibleSection from '../CollapsibleSection';

export default function TransportationSection() {
  return (
    <CollapsibleSection title="Transportation">
      {/* Content */}
      <div className="flex flex-col items-center justify-center mt-8 mb-2" style={{ fontFamily: 'Montserrat' }}>
        <div className="text-center text-base max-w-2xl mx-auto">
          Shuttle Service Will Be Provided Between The Ceremony And Reception Venues. For Guests Staying At<br />
          The Grand Palace Hotel, No Transportation Is Needed.
        </div>
      </div>
    </CollapsibleSection>
  );
}
