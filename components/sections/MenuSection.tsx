import Image from 'next/image';
import CollapsibleSection from '../CollapsibleSection';

export default function MenuSection() {
  return (
    <CollapsibleSection title="Wedding Food Menu">
      {/* Side Borders */}
      <div className="relative flex justify-center items-stretch">
        {/* Left Side Border */}
        <div className="hidden md:flex flex-col justify-center">
          <Image
            src="/images/Elgent Shape-01 1.png"
            alt="Elegant Side Border"
            width={60}
            height={600}
            className="h-full min-h-[500px] w-auto object-contain"
          />
        </div>
        {/* Menu Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-2 sm:px-6 md:px-12 py-4">
          {/* Title */}
          <div className="text-center mb-6 sm:mb-8 mt-2">
            <div className="text-black ml-6" 
                 style={{ 
                   fontFamily: 'Montserrat',
                   fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)'
                 }}>
              Our Wedding
            </div>
            <div
              className="font-normal mb-2"
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
              Menu
            </div>
          </div>
          {/* Menu Sections */}
          <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-8 sm:gap-12">
            {/* STARTER */}
            <div className="w-full text-center">
              <div className="text-black tracking-wide mb-1" 
                   style={{ 
                     fontFamily: 'Montserrat', 
                     letterSpacing: '1px',
                     fontSize: 'clamp(1.25rem, 4vw, 1.5rem)'
                   }}>
                STARTER
              </div>
              <div className="w-16 h-[2px] bg-black mx-auto mb-3" />
              <div className="text-black mb-1" 
                   style={{ 
                     fontFamily: 'Montserrat',
                     fontSize: 'clamp(0.875rem, 2.5vw, 1rem)'
                   }}>
                15:00 Pm
              </div>
              <div className="text-black" 
                   style={{ 
                     fontFamily: 'Montserrat',
                     fontSize: 'clamp(1rem, 3vw, 1.125rem)'
                   }}>
                Chilled Avacado And Cucumber Soup,<br />
                Prosciutto - Wrapped Melon
              </div>
            </div>
            {/* MAIN */}
            <div className="w-full text-center">
              <div className="text-black tracking-wide mb-1" 
                   style={{ 
                     fontFamily: 'Montserrat', 
                     letterSpacing: '1px',
                     fontSize: 'clamp(1.25rem, 4vw, 1.5rem)'
                   }}>
                MAIN
              </div>
              <div className="w-16 h-[2px] bg-black mx-auto mb-3" />
              <div className="text-black mb-1" 
                   style={{ 
                     fontFamily: 'Montserrat',
                     fontSize: 'clamp(0.875rem, 2.5vw, 1rem)'
                   }}>
                15:30 Pm
              </div>
              <div className="text-black" 
                   style={{ 
                     fontFamily: 'Montserrat',
                     fontSize: 'clamp(1rem, 3vw, 1.125rem)'
                   }}>
                Herb - Crusted Rack Of Lamb, Pan-Seared<br />
                Salmon With Lemon Butter Sauce
              </div>
            </div>
            {/* DESSERT */}
            <div className="w-full text-center">
              <div className="text-black tracking-wide mb-1" 
                   style={{ 
                     fontFamily: 'Montserrat', 
                     letterSpacing: '1px',
                     fontSize: 'clamp(1.25rem, 4vw, 1.5rem)'
                   }}>
                DESSERT
              </div>
              <div className="w-16 h-[2px] bg-black mx-auto mb-3" />
              <div className="text-black mb-1" 
                   style={{ 
                     fontFamily: 'Montserrat',
                     fontSize: 'clamp(0.875rem, 2.5vw, 1rem)'
                   }}>
                16:00 Pm
              </div>
              <div className="text-black" 
                   style={{ 
                     fontFamily: 'Montserrat',
                     fontSize: 'clamp(1rem, 3vw, 1.125rem)'
                   }}>
                Classic Tiramisu, Lemon Sorbet With<br />
                Fresh Berries
              </div>
            </div>
          </div>
        </div>
        {/* Right Side Border */}
        <div className="hidden md:flex flex-col justify-center">
          <Image
            src="/images/Elgent Shape-01 1.png"
            alt="Elegant Side Border"
            width={60}
            height={600}
            className="h-full min-h-[500px] w-auto object-contain"
          />
        </div>
      </div>
    </CollapsibleSection>
  );
}
