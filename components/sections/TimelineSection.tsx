import React from 'react';
import CollapsibleSection from '../CollapsibleSection';

export default function WeddingTimeline() {
  const events = [
    { time: '11:00 AM', icon: '/images/toast.png', label: 'WELCOME TOAST' },
    { time: '12:00 AM', icon: '/images/ceremony.png', label: 'CEREMONY' },
    { time: '01:00 PM', icon: '/images/lunch.png', label: 'WEDDING LUNCH' },
    { time: '03:00 PM', icon: '/images/cake.png', label: 'CAKE CUTTING' },
    { time: '04:00 PM', icon: '/images/dance.png', label: 'FIRST DANCE' },
    { time: '05:00 PM', icon: '/images/cocktail.png', label: 'COCKTAIL HOUR' },
    { time: '08:00 PM', icon: '/images/dinner.png', label: 'BUFFET DINNER' },
    { time: '11:30 PM', icon: '/images/fireworks.png', label: 'FIREWORKS' },
  ];

  return (
    <CollapsibleSection title="Wedding Day Timeline">
      {/* Elegant gold line at top */}
      <div className="flex justify-center" style={{ marginTop: '-8px', marginBottom: '8px' }}>
        <img
          src="/images/Elegent line-01 1.png"
          alt="Divider"
          className="img-responsive"
          style={{
            maxWidth: '1500px', 
            minHeight: 'clamp(30px, 8vw, 54px)', 
            maxHeight: 'clamp(54px, 12vw, 90px)'
          }}
        />
      </div>
      {/* Header inside card */}
      <div className="flex flex-col items-center justify-center mb-2 relative z-9" style={{ marginTop: '-8px', marginBottom: '8px' }}>
        <span
          style={{
            fontFamily: 'Sail',
            fontWeight: 500,
            fontSize: 'clamp(2rem, 8vw, 3rem)',
            background: 'linear-gradient(90deg, #E5B574 0%, #D59C58 43%, #C18037 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block',
            letterSpacing: '1px',
            marginTop: '-8px',
            marginBottom: '0',
          }}
        >
          Wedding Day
        </span>
      </div>
      {/* Timeline Content */}
      <div className="flex flex-col justify-center items-center">
        <div className="relative w-full flex flex-col justify-center items-center overflow-visible px-4 sm:px-6" 
             style={{ 
               minHeight: 'clamp(400px, 60vh, 600px)', 
               maxWidth: '500px'
             }}>
          {/* Timeline vertical line (absolute, spans all events) */}
          <div className="absolute" style={{ 
            left: '50%', 
            top: 0, // span full height
            bottom: 0, // span full height
            width: '3px', 
            background: '#E5B574', 
            transform: 'translateX(-50%)', 
            borderRadius: '2px', 
            zIndex: 1 
          }} />
          {/* Timeline events */}
          {events.map((event, idx, arr) => (
            <div key={event.time} className="flex flex-row items-center w-full relative" 
                 style={{ 
                   minHeight: '56px', // fixed height for all rows
                   marginBottom: idx !== arr.length - 1 ? 'clamp(15px, 3vh, 20px)' : 0 
                 }}>
              {/* Left side - Time */}
              <div className="flex justify-end items-center" style={{ flex: '1', paddingRight: 'clamp(15px, 4vw, 30px)' }}>
                <span style={{ 
                  fontFamily: 'Montserrat', 
                  fontWeight: 600, 
                  fontSize: 'clamp(0.875rem, 3vw, 1.25rem)', 
                  color: '#08080A', 
                  letterSpacing: '0.01em', 
                  whiteSpace: 'nowrap', 
                  lineHeight: 1, 
                  textAlign: 'right' 
                }}>
                  {event.time}
                </span>
              </div>
              {/* Center - Dot and horizontal line */}
              <div className="flex items-center justify-center relative" style={{ width: '48px', minWidth: '48px', maxWidth: '48px', height: '56px', zIndex: 2 }}>
                {/* Dot */}
                <div style={{ 
                  width: '16px', 
                  height: '16px', 
                  background: '#E5B574', 
                  border: '2px solid #C18037', 
                  borderRadius: '50%', 
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 3,
                  boxShadow: '0 0 0 2px #fff'
                }} />
                {/* Horizontal line */}
                <div style={{ 
                  width: '48px', 
                  height: '2px', 
                  background: '#E5B574', 
                  position: 'absolute',
                  left: '0',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 1
                }} />
              </div>
              {/* Right side - Icon and label */}
              <div className="flex flex-row items-center" style={{ flex: '1', paddingLeft: 'clamp(15px, 4vw, 30px)' }}>
                <img 
                  src={event.icon} 
                  alt={event.label} 
                  style={{ 
                    width: 'clamp(50px, 12vw, 70px)', 
                    height: 'clamp(50px, 12vw, 70px)', 
                    objectFit: 'contain', 
                    marginRight: 'clamp(8px, 2vw, 12px)', 
                    flexShrink: 0 
                  }} 
                />
                <span style={{ 
                  fontFamily: 'Montserrat', 
                  fontWeight: 600, 
                  fontSize: 'clamp(0.75rem, 2.5vw, 1rem)', 
                  color: '#08080A', 
                  letterSpacing: '0.01em', 
                  lineHeight: 1.2,
                  textAlign: 'left'
                }}>
                  {event.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Gold leaves at bottom corners, inside the border and not overlapping */}
      <img
        src="/images/Vector (2).png"
        className="absolute z-10 pointer-events-none decoration-responsive"
        alt="Decoration left"
        style={{ bottom: '1px', left: '1px' }}
      />
      <img
        src="/images/Vector.png"
        className="absolute z-10 pointer-events-none decoration-responsive-sm"
        alt="Decoration right"
        style={{ bottom: '1px', right: '1px' }}
      />
    </CollapsibleSection>
  );
}