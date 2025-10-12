import React from 'react';
import Image from 'next/image';
import CollapsibleSection from '../CollapsibleSection';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  photo?: string;
  bio?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    website?: string;
  };
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
  const defaultMembers: TeamMember[] = [
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

                {/* Social Links */}
                {member.socialLinks && (
                  <div className="flex justify-center space-x-2 mt-2">
                    {member.socialLinks.facebook && (
                      <a 
                        href={member.socialLinks.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                      >
                        <svg width="12" height="12" fill="white" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </a>
                    )}
                    {member.socialLinks.instagram && (
                      <a 
                        href={member.socialLinks.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-6 h-6 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center hover:from-purple-700 hover:to-pink-700 transition-colors"
                      >
                        <svg width="12" height="12" fill="white" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </a>
                    )}
                    {member.socialLinks.twitter && (
                      <a 
                        href={member.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors"
                      >
                        <svg width="12" height="12" fill="white" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                        </svg>
                      </a>
                    )}
                    {member.socialLinks.tiktok && (
                      <a 
                        href={member.socialLinks.tiktok}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-6 h-6 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                      >
                        <svg width="12" height="12" fill="white" viewBox="0 0 24 24">
                          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                        </svg>
                      </a>
                    )}
                    {member.socialLinks.website && (
                      <a 
                        href={member.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                      >
                        <svg width="12" height="12" fill="white" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                )}

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
