import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function CollapsibleSection({ title, children, className = '' }: CollapsibleSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <section className={`relative w-full flex flex-col items-center justify-center bg-white px-2 sm:px-4 pt-0 pb-0 ${className}`}>
      <div className="w-full max-w-6xl bg-white mx-auto relative overflow-hidden" 
           style={{ 
             border: '1px solid #000000',
             borderRadius: '0px'
           }}>
        
        {/* Header with title and arrow */}
        <div 
          className="flex justify-between items-center w-full px-4 sm:px-6 py-3 sm:py-4 cursor-pointer bg-white hover:bg-gray-50 transition-colors"
          onClick={toggleCollapse}
        >
          <h2 className="text-black font-medium" 
              style={{ 
                fontFamily: 'Montserrat',
                fontSize: 'clamp(1.125rem, 4vw, 1.5rem)'
              }}>
            {title}
          </h2>
          <div className="flex items-center">
            {isCollapsed ? (
              <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-[#E5B574]" />
            ) : (
              <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6 text-[#E5B574]" />
            )}
          </div>
        </div>

        {/* Collapsible content */}
        <div 
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[2000px] opacity-100'
          }`}
        >
          <div className="px-4 sm:px-6 pb-4 sm:pb-6">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
} 