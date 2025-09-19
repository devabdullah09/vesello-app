import React from 'react';
import Image from 'next/image';
import CollapsibleSection from '../CollapsibleSection';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  photo?: string;
  bio?: string;
}

interface DynamicTeamSectionProps {
  title: string;
  description?: string;
  members: TeamMember[];
}

export default function DynamicTeamSection({ 
  title, 
  description, 
  members 
}: DynamicTeamSectionProps) {
  // Default members if none provided
  const defaultMembers = [
    { id: '1', role: 'Entertainment Company', name: 'David Harris', photo: '/images/team-placeholder.jpeg' },
    { id: '2', role: 'Culinary & Service Team', name: 'Jessica Palmer', photo: '/images/team-placeholder.jpeg' },
    { id: '3', role: 'Band/DJ', name: 'Kevin Grant', photo: '/images/team-placeholder.jpeg' },
    { id: '4', role: 'Decorator', name: 'Sarah Collins', photo: '/images/team-placeholder.jpeg' },
    { id: '5', role: 'Videographer', name: 'Mark Jensen', photo: '/images/team-placeholder.jpeg' },
    { id: '6', role: 'Photographer', name: 'Eric Moore', photo: '/images/team-placeholder.jpeg' }
  ];

  const displayMembers = members.length > 0 ? members : defaultMembers;

  return (
    <CollapsibleSection title="Wedding Team">
      <div className="flex flex-col items-center justify-center px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="text-black" 
               style={{ 
                 fontFamily: 'Montserrat',
                 fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)'
               }}>
            Our Wedding
          </div>
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
              fontSize: 'clamp(3rem, 12vw, 5.25rem)',
            }}
          >
            {title}
          </div>
          {description && (
            <div className="text-black max-w-2xl mx-auto" 
                 style={{ 
                   fontFamily: 'Montserrat',
                   fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                   lineHeight: 1.5
                 }}>
              {description}
            </div>
          )}
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full max-w-6xl mx-auto">
          {displayMembers.map((member) => (
            <div key={member.id} className="flex flex-col items-center text-center group">
              {/* Member Photo */}
              <div className="relative mb-4 overflow-hidden rounded-full">
                <Image
                  src={member.photo || '/images/team-placeholder.jpeg'}
                  alt={member.name}
                  width={120}
                  height={120}
                  className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              
              {/* Member Info */}
              <div className="space-y-1">
                <h3 className="font-bold text-[#08080A]" 
                    style={{ 
                      fontFamily: 'Montserrat', 
                      fontSize: 'clamp(1rem, 3vw, 1.125rem)',
                      letterSpacing: '0.5px'
                    }}>
                  {member.name}
                </h3>
                <p className="text-[#E5B574]" 
                   style={{ 
                     fontFamily: 'Montserrat', 
                     fontWeight: 500,
                     fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                     letterSpacing: '0.25px'
                   }}>
                  {member.role}
                </p>
                {member.bio && (
                  <p className="text-gray-600 text-sm mt-2 max-w-xs mx-auto">
                    {member.bio}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </CollapsibleSection>
  );
}
