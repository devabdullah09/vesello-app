import React from 'react';
import CollapsibleSection from '../CollapsibleSection';
import { useLanguage } from '@/components/language-context';

export default function AdditionalInfoSection() {
  const { t } = useLanguage();
  return (
    <CollapsibleSection title={t.additionalInfo.title}>
      {/* Content */}
      <div className="flex flex-col items-start justify-center mt-8 mb-12" style={{ fontFamily: 'Montserrat' }}>
        <ul className="list-disc pl-6 text-base text-black">
          <li className="mb-2">Please Let Us Know Of Any Dietary Restrictions By August 15th.</li>
          <li className="mb-2">The Dress Code Is Formal.</li>
          <li>The Wedding Will Be Held Rain Or Shine, But The Ceremony Will Be Moved Indoors In Case Of Bad Weather.</li>
        </ul>
      </div>
    </CollapsibleSection>
  );
}
