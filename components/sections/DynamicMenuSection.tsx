import Image from 'next/image';
import CollapsibleSection from '../CollapsibleSection';

interface MenuItem {
  name: string;
  description?: string;
  allergens?: string[];
}

interface MenuCourse {
  id: string;
  courseName: string;
  items: MenuItem[];
}

interface DynamicMenuSectionProps {
  title: string;
  description?: string;
  courses: MenuCourse[];
}

export default function DynamicMenuSection({ 
  title, 
  description, 
  courses 
}: DynamicMenuSectionProps) {
  // Default courses if none provided
  const defaultCourses = [
    {
      id: 'starter',
      courseName: 'STARTER',
      items: [
        { name: 'Bruschetta', description: 'Fresh tomatoes and basil' },
        { name: 'Caesar Salad', description: 'Crisp romaine lettuce' }
      ]
    },
    {
      id: 'main',
      courseName: 'MAIN COURSE',
      items: [
        { name: 'Grilled Salmon', description: 'With lemon herb sauce' },
        { name: 'Beef Tenderloin', description: 'With roasted vegetables' }
      ]
    },
    {
      id: 'dessert',
      courseName: 'DESSERT',
      items: [
        { name: 'Wedding Cake', description: 'Three-tier vanilla cake' },
        { name: 'Fresh Fruit', description: 'Seasonal selection' }
      ]
    }
  ];

  const displayCourses = courses.length > 0 ? courses : defaultCourses;

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
              {title}
            </div>
            {description && (
              <div className="text-black" 
                   style={{ 
                     fontFamily: 'Montserrat',
                     fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                     lineHeight: 1.5
                   }}>
                {description}
              </div>
            )}
          </div>
          {/* Menu Sections */}
          <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-8 sm:gap-12">
            {displayCourses.map((course) => (
              <div key={course.id} className="w-full text-center">
                <div className="text-black tracking-wide mb-1" 
                     style={{ 
                       fontFamily: 'Montserrat', 
                       letterSpacing: '1px',
                       fontSize: 'clamp(1.25rem, 4vw, 1.5rem)'
                     }}>
                  {course.courseName}
                </div>
                <div className="w-16 h-[2px] bg-black mx-auto mb-3" />
                {course.items.map((item, index) => (
                  <div key={index} className="mb-2">
                    <div className="text-black mb-1" 
                         style={{ 
                           fontFamily: 'Montserrat', 
                           fontWeight: 500,
                           fontSize: 'clamp(1rem, 3vw, 1.125rem)'
                         }}>
                      {item.name}
                    </div>
                    {item.description && (
                      <div className="text-gray-600" 
                           style={{ 
                             fontFamily: 'Montserrat', 
                             fontWeight: 400,
                             fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                             lineHeight: 1.4
                           }}>
                        {item.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        {/* Right Side Border */}
        <div className="hidden md:flex flex-col justify-center">
          <Image
            src="/images/Elgent Shape-01 1.png"
            alt="Elegant Side Border"
            width={60}
            height={600}
            className="h-full min-h-[500px] w-auto object-contain transform scale-x-[-1]"
          />
        </div>
      </div>
    </CollapsibleSection>
  );
}
