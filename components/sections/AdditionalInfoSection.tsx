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
          <li className="mb-2">{t.additionalInfo.dietaryRestrictions}</li>
          <li className="mb-2">{t.additionalInfo.dressCode}</li>
          <li>{t.additionalInfo.weatherPolicy}</li>
        </ul>
      </div>
    </CollapsibleSection>
  );
}
