import React, { useState } from 'react';
import { Plus, Minus, X } from 'lucide-react';

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
  onClose?: () => void;
  showCloseButton?: boolean;
}

const FAQItem: React.FC<FAQItemProps> = ({
  question,
  answer,
  isOpen,
  onClick,
  onClose,
  showCloseButton = false,
}) => {
  return (
    <div className="border-b border-gray-200">
      <button
        className="flex cursor-custom-pointer items-center justify-between w-full py-5 text-left focus:outline-none"
        onClick={onClick}
        aria-expanded={isOpen}
      >
        <h3 className="md:text-md font-medium text-gray-900">{question}</h3>
        <div className="flex items-center">
          {showCloseButton && isOpen ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose?.();
              }}
              className="mr-4 text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="Close"
            >
              <X size={0} />
            </button>
          ) : null}
          <span className="flex items-center justify-center w-6 h-6 text-black">
            {isOpen ? <Minus size={20} /> : <Plus size={20} />}
          </span>
        </div>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100 pb-6' : 'max-h-0 opacity-0'
        }`}
      >
        <p className="text-[15px] text-gray-700 leading-relaxed">{answer}</p>
      </div>
    </div>
  );
};

export default FAQItem;