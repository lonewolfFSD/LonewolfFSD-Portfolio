import React, { useState } from 'react';
import FAQItem from './FAQItem';
import { FAQItem as FAQItemType } from '../types/faq';
import { useTranslation } from 'react-i18next';

interface FAQSectionProps {
  title: string; // Translation key (e.g., "Frequently Asked Questions")
  subtitle?: string; // Translation key (e.g., "In a creative workplace...")
  items: FAQItemType[];
  contactLink?: string; // Translation key (e.g., "Contact support")
}

const FAQSection: React.FC<FAQSectionProps> = ({
  title,
  subtitle,
  items,
  contactLink,
}) => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="min-h-screen flex items-center justify-center mt-20 lg:-mt-8" style={{
      fontFamily: 'Inter, sans-serif'
    }}>
      <div className="w-full max-w-7xl mx-auto px-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          <div className="md:col-span-5 space-y-3">
            <h2 className="text-3xl font-semibold text-gray-900" style={{
              fontFamily: 'Poppins'
            }}>{t(title)}</h2>
            {subtitle && <p className="text-gray-600 leading-relaxed">{t(subtitle)}</p>}
            {contactLink && (
              <div className="pt-2">
                <a 
                  href="https://support.lonewolffsd.in" 
                  className="inline-block cursor-custom-pointer text-black font-semibold border-b border-black pb-0.5 transition-colors"
                >
                  {t(contactLink)}
                </a>
              </div>
            )}
          </div>
          <div className="md:col-span-7 lg:-mt-4 -mt-8">
            <div className="divide-y divide-gray-200">
              {items.map((item, index) => (
                <FAQItem
                  key={index}
                  question={item.question}
                  answer={item.answer}
                  isOpen={openIndex === index}
                  onClick={() => handleToggle(index)}
                  showCloseButton={index === 0}
                  onClose={() => setOpenIndex(null)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;