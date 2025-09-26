import Image from 'next/image';
import CollapsibleSection from '../CollapsibleSection';

interface Table {
  id: string;
  tableNumber: string;
  guests: string[];
  specialNotes?: string;
}

interface SeatingChartSectionProps {
  title?: string;
  description?: string;
  tables?: Table[];
}

export default function SeatingChartSection({ 
  title = 'Guest Seating Chart', 
  description = 'Find your seat for the reception.',
  tables = []
}: SeatingChartSectionProps) {
  return (
    <CollapsibleSection title={title}>
      {/* Welcome Image (centered, wide, gold) */}
      <div className="flex justify-center my-2">
        <Image
          src="/images/welcome.png"
          alt="Welcome"
          width={900}
          height={120}
          className="h-auto w-full max-w-3xl object-contain img-responsive"
          priority
        />
      </div>

      {/* Description */}
      {description && (
        <div className="text-center mb-6">
          <p className="text-gray-700" 
             style={{ 
               fontFamily: 'Montserrat',
               fontSize: 'clamp(0.875rem, 2.5vw, 1rem)'
             }}>
            {description}
          </p>
        </div>
      )}

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 sm:gap-x-8 md:gap-x-12 gap-y-6 sm:gap-y-8 md:gap-y-10 mt-6 sm:mt-8 md:mt-10 max-w-5xl mx-auto px-4 sm:px-6">
        {tables.length > 0 ? tables.map((table) => (
          <div
            key={table.id}
            className="p-4 sm:p-6 text-center"
          >
            <h3 className="font-bold text-black mb-2" 
                style={{ 
                  fontFamily: 'Montserrat',
                  fontSize: 'clamp(1rem, 3vw, 1.25rem)'
                }}>
              {table.tableNumber}
            </h3>
            <div className="space-y-1">
              {table.guests.map((guest, index) => (
                <p key={index} className="text-gray-700" 
                   style={{ 
                     fontFamily: 'Montserrat',
                     fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)'
                   }}>
                  {guest}
                </p>
              ))}
            </div>
            {table.specialNotes && (
              <div className="mt-2 text-xs text-gray-500 italic">
                {table.specialNotes}
              </div>
            )}
          </div>
        )) : (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500" 
               style={{ 
                 fontFamily: 'Montserrat',
                 fontSize: 'clamp(0.875rem, 2.5vw, 1rem)'
               }}>
              No seating chart available yet.
            </p>
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
}
