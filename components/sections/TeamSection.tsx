import React from 'react';
import Image from 'next/image';
import CollapsibleSection from '../CollapsibleSection';

const socialIconKeys = ['facebook', 'instagram', 'twitter'] as const;
type SocialKey = typeof socialIconKeys[number];

const teamMembers: {
  id: number;
  role: string;
  name: string;
  image: string;
  socials: SocialKey[];
}[] = [
  {
    id: 1,
    role: 'Entertainment Company',
    name: 'David Harris',
    image: '/images/team-placeholder.jpeg',
    socials: ['facebook', 'instagram', 'twitter'],
  },
  {
    id: 2,
    role: 'Culinary & Service Team',
    name: 'Jessica Palmer',
    image: '/images/team-placeholder.jpeg',
    socials: ['facebook', 'instagram', 'twitter'],
  },
  {
    id: 3,
    role: 'Band/DJ',
    name: 'Kevin Grant',
    image: '/images/team-placeholder.jpeg',
    socials: ['facebook', 'instagram', 'twitter'],
  },
  {
    id: 4,
    role: 'Decorator',
    name: 'Sarah Collins',
    image: '/images/team-placeholder.jpeg',
    socials: ['facebook', 'instagram', 'twitter'],
  },
  {
    id: 5,
    role: 'Videographer',
    name: 'Mark Jensen',
    image: '/images/team-placeholder.jpeg',
    socials: ['facebook', 'instagram', 'twitter'],
  },
  {
    id: 6,
    role: 'Photographer',
    name: 'Eric Moore',
    image: '/images/team-placeholder.jpeg',
    socials: ['facebook', 'instagram', 'twitter'],
  },
  {
    id: 7,
    role: 'Drivers',
    name: 'Mark Harris',
    image: '/images/team-placeholder.jpeg',
    socials: ['facebook', 'instagram', 'twitter'],
  },
];

const socialIcons: Record<SocialKey, React.ReactNode> = {
  facebook: (
    <svg width="18" height="18" fill="#E5B574" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/></svg>
  ),
  instagram: (
    <svg width="18" height="18" fill="#E5B574" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.069 1.646.069 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.069-4.85.069s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.974 2.241-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.771.131 4.659.425 3.678 1.406c-.98.98-1.274 2.092-1.333 3.374C2.013 8.332 2 8.741 2 12c0 3.259.013 3.668.072 4.948.059 1.282.353 2.394 1.333 3.374.98.98 2.092 1.274 3.374 1.333C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.282-.059 2.394-.353 3.374-1.333.98-.98 1.274-2.092 1.333-3.374.059-1.28.072-1.689.072-4.948s-.013-3.668-.072-4.948c-.059-1.282-.353-2.394-1.333-3.374-.98-.98-2.092-1.274-3.374-1.333C15.668.013 15.259 0 12 0zm0 5.838A6.162 6.162 0 0 0 5.838 12 6.162 6.162 0 0 0 12 18.162 6.162 6.162 0 0 0 18.162 12 6.162 6.162 0 0 0 12 5.838zm0 10.162A3.999 3.999 0 1 1 12 8a3.999 3.999 0 0 1 0 7.999zm6.406-11.845a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z"/></svg>
  ),
  twitter: (
    <svg width="18" height="18" fill="#E5B574" viewBox="0 0 24 24"><path d="M24 4.557a9.83 9.83 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195a4.916 4.916 0 0 0-8.38 4.482C7.691 8.095 4.066 6.13 1.64 3.161c-.542.929-.856 2.01-.857 3.17 0 2.188 1.115 4.117 2.823 5.247a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 21.543a13.94 13.94 0 0 0 7.548 2.209c9.058 0 14.009-7.514 14.009-14.009 0-.213-.005-.425-.014-.636A10.012 10.012 0 0 0 24 4.557z"/></svg>
  ),
};

export default function TeamSection() {
  // Split team members into two rows
  const firstRow = teamMembers.slice(0, 4);
  const secondRow = teamMembers.slice(4, 7);

  return (
    <CollapsibleSection title="Our Wedding Team">
      {/* Main Title */}
      <div className="text-center mb-4 sm:mb-6 mt-2">
        <span
          className="block font-normal mb-2"
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
          Wedding Team
        </span>
      </div>
      {/* Mission Text */}
      <div className="text-center mb-6 sm:mb-8 md:mb-10 max-w-2xl mx-auto px-4 sm:px-6" 
           style={{ 
             fontFamily: 'Montserrat', 
             color: '#222',
             fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)'
           }}>
        <div className="mb-2">Dear Guests - We Have An Important Mission For You:</div>
        <div className="mb-2 font-bold text-black">Like, Follow, And Tag The Amazing Team Behind Today's Magic.</div>
        <div className="mb-2">Every Click Is A Like A Loud 'Thank You!' To Them!</div>
        <div className="mb-2">
          Our Goal: <span className="font-bold text-black">50 New Followers!</span><br />
          Because Good Energy Always Comes Back!
        </div>
      </div>
      {/* Team Grid: First Row (4 members) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-4 sm:gap-x-6 md:gap-x-8 gap-y-8 sm:gap-y-10 md:gap-y-12 max-w-5xl mx-auto mt-4 mb-6 sm:mb-8 px-4 sm:px-6">
        {firstRow.map((member) => (
          <div key={member.id} className="flex flex-col items-center">
            {/* Custom image mask: top-left and bottom-right rounded */}
            <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 mb-3 sm:mb-4 overflow-hidden" 
                 style={{
                   borderBottomRightRadius: 'clamp(100px, 25vw, 200px)', 
                   borderTopRightRadius: 0, 
                   borderBottomLeftRadius: 0 
                 }}>
              <Image
                src={member.image}
                alt={member.name}
                width={192}
                height={192}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="font-semibold text-black text-center" 
                 style={{ 
                   fontFamily: 'Montserrat',
                   fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)'
                 }}>
              {member.role}
            </div>
            <div className="text-black text-center mb-2" 
                 style={{ 
                   fontFamily: 'Montserrat',
                   fontSize: 'clamp(0.875rem, 2.5vw, 1rem)'
                 }}>
              {member.name}
            </div>
            <div className="flex gap-2 mt-1">
              {member.socials.map((icon, idx) => (
                <span key={idx}>{socialIcons[icon]}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* Team Grid: Second Row (3 members) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 sm:gap-x-6 md:gap-x-8 gap-y-8 sm:gap-y-10 md:gap-y-12 max-w-3xl mx-auto px-4 sm:px-6">
        {secondRow.map((member) => (
          <div key={member.id} className="flex flex-col items-center">
            {/* Custom image mask: top-left and bottom-right rounded */}
            <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 mb-3 sm:mb-4 overflow-hidden" 
                 style={{ 
                   borderBottomRightRadius: 'clamp(100px, 25vw, 200px)', 
                   borderTopRightRadius: 0, 
                   borderBottomLeftRadius: 0 
                 }}>
              <Image
                src={member.image}
                alt={member.name}
                width={192}
                height={192}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="font-semibold text-black text-center" 
                 style={{ 
                   fontFamily: 'Montserrat',
                   fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)'
                 }}>
              {member.role}
            </div>
            <div className="text-black text-center mb-2" 
                 style={{ 
                   fontFamily: 'Montserrat',
                   fontSize: 'clamp(0.875rem, 2.5vw, 1rem)'
                 }}>
              {member.name}
            </div>
            <div className="flex gap-2 mt-1">
              {member.socials.map((icon, idx) => (
                <span key={idx}>{socialIcons[icon]}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </CollapsibleSection>
  );
}
