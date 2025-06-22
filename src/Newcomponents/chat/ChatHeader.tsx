import React from 'react';
import { X } from 'lucide-react';
import Lyra from '../../mockups/Lyra.jpg';
import { useChat } from '../../hooks/useChat'; // Import useChat
import { useTranslation } from 'react-i18next';

interface ChatHeaderProps {
  name: string;
  role: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = () => {
  const { toggleChat } = useChat(); // Access toggleChat
  const { t } = useTranslation();


  return (
    <div className="flex items-center justify-between p-4  border-b border-b-gray-200">
      <div className="flex items-center ">
        <div className="flex items-center justify-center w-10 h-10 bg-black text-white rounded-full mr-3 overflow-hidden">
          <img className="w-full h-full object-cover pointer-events-none" src={Lyra} alt="Lyra" />
        </div>
        <div className="flex flex-col">
          <h3 className="font-medium text-gray-900 text-[14px]">{t('Lyra Mini')}</h3>
          <p className="text-xs text-gray-500">{t('Virtual AI Assistant')}</p>
        </div>
      </div>

      <button 
        onClick={toggleChat} 
        className="text-gray-500 hover:text-gray-700 md:hidden transition-colors p-1 rounded-full"
        aria-label="Close chat"
      >
        <X className="w-5 h-5 cursor-custom-pointer " />
      </button>
    </div>
  );
};

export default ChatHeader;
