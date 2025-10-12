'use client';

import CollapsibleSection from '../CollapsibleSection';


interface WishesAndGiftsSectionProps {
  title?: string;
  description?: string;
  wishesMessage?: string;
  place?: string;
  when?: string;
  giftSuggestions?: string;
}

export default function WishesAndGiftsSection({ 
  title = 'Wishes And Gifts',
  description = 'Your presence is the greatest gift, but if you wish to honor us with a gift, here are some suggestions.',
  wishesMessage = 'We are so grateful for your love and support!',
  place = 'At the church',
  when = 'After ceremony next to church',
  giftSuggestions = 'flowers, bottle of wine, lottery coupon'
}: WishesAndGiftsSectionProps) {
  return (
    <CollapsibleSection title={title}>
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8 md:mb-10 mt-2">
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
          {title}
        </span>
      </div>
      
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

      {/* Polish Wedding Information */}
      <div className="flex flex-col items-center gap-6 sm:gap-8 md:gap-10 mb-8 sm:mb-12 md:mb-16 w-full max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Place Information */}
        <div className="w-full text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="flex-1 h-px bg-black opacity-20"></div>
            <span className="px-4 font-bold text-black uppercase" 
                  style={{ 
                    fontFamily: 'Montserrat',
                    fontSize: 'clamp(1rem, 3vw, 1.25rem)'
                  }}>
              Place
            </span>
            <div className="flex-1 h-px bg-black opacity-20"></div>
          </div>
          <div className="text-black" 
               style={{ 
                 fontFamily: 'Montserrat',
                 fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                 lineHeight: 1.5
               }}>
            {place}
          </div>
        </div>

        {/* When Information */}
        <div className="w-full text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="flex-1 h-px bg-black opacity-20"></div>
            <span className="px-4 font-bold text-black uppercase" 
                  style={{ 
                    fontFamily: 'Montserrat',
                    fontSize: 'clamp(1rem, 3vw, 1.25rem)'
                  }}>
              When
            </span>
            <div className="flex-1 h-px bg-black opacity-20"></div>
          </div>
          <div className="text-black" 
               style={{ 
                 fontFamily: 'Montserrat',
                 fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                 lineHeight: 1.5
               }}>
            {when}
          </div>
        </div>

        {/* Gift Suggestions */}
        {giftSuggestions && (
          <div className="w-full text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="flex-1 h-px bg-black opacity-20"></div>
              <span className="px-4 font-bold text-black uppercase" 
                    style={{ 
                      fontFamily: 'Montserrat',
                      fontSize: 'clamp(1rem, 3vw, 1.25rem)'
                    }}>
                Gifts preferences
              </span>
              <div className="flex-1 h-px bg-black opacity-20"></div>
            </div>
            <div className="text-black" 
                 style={{ 
                   fontFamily: 'Montserrat',
                   fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                   lineHeight: 1.5
                 }}>
              {giftSuggestions}
            </div>
          </div>
        )}
      </div>

      {/* Wishes Message */}
      {wishesMessage && (
        <div className="text-center mt-6 sm:mt-8 md:mt-10">
          <div className="font-bold mb-2" 
               style={{ 
                 fontFamily: 'Montserrat', 
                 color: '#E5B574',
                 fontSize: 'clamp(1.25rem, 4vw, 1.5rem)'
               }}>
            Wishes
          </div>
          <div className="text-black" 
               style={{ 
                 fontFamily: 'Montserrat',
                 fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                 lineHeight: 1.5
               }}>
            {wishesMessage}
          </div>
        </div>
      )}
    </CollapsibleSection>
  );
}
