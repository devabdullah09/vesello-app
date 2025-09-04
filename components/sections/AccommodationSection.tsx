import React from 'react';
import CollapsibleSection from '../CollapsibleSection';

export default function AccommodationSection() {
  return (
    <CollapsibleSection title="Accommodation">
      {/* Content */}
      <div className="flex flex-col items-center justify-center mt-8 mb-2" style={{ fontFamily: 'Montserrat' }}>
        <div className="text-center mb-10">
          <div className="text-lg font-bold mb-1">Grand Palace Hotel</div>
          <div className="text-base mb-1">The Wedding Venue. Special Rates Available For Wedding Guests.</div>
          <div className="text-base mb-4">Contact: Reservations@Grandpalace.Com</div>
          <div className="text-lg font-bold mb-1 mt-6">City Center Hotel</div>
          <div className="text-base mb-1">Budget-Friendly Option, 10 Minutes Drive From The Venue.</div>
          <div className="text-base">Contact: Info@Citycenterhotel.Com</div>
        </div>
      </div>
    </CollapsibleSection>
  );
}
