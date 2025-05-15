import React from 'react';
import { useState } from 'react';
import { MessageCircle, MessageSquare, Sparkles, X } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import Lyra from '../../mockups/Lyra.jpg';

const ChatBubble: React.FC = () => {
  const { isOpen, toggleChat } = useChat();

  const [hidePrompt, setHidePrompt] = useState(
    typeof window !== 'undefined' ? localStorage.getItem('lyraPromptHidden') === 'true' : false
  );

  const closePrompt = () => {
    localStorage.setItem('lyraPromptHidden', 'true');
    setHidePrompt(true);
  };

  return (
    <div className="fixed bottom-6 right-6 z-10 flex flex-col items-end space-y-2">
      {!isOpen && !hidePrompt && (
        <div className="bg-gray-200 border border-black gap-3 flex items-start text-black text-sm px-4 py-3 rounded-xl shadow-lg animate-fade-in relative max-w-xs">
          <img className="w-10 h-10 mt-[4px] border border-black rounded-full mt-0.5" src={Lyra} alt="Lyra Avatar" />
          <span className="mt-[0px] leading-snug text-[12px]">Hey there! I’m Lyra, crafted by LonewolfFSD. Anything I can guide you through?</span>
          <button
            onClick={closePrompt}
            className="absolute -top-2 -right-2 cursor-custom-pointer bg-black text-gray-200 hover:text-whit3.5 hover:bg-black/90 rounded-full p-1 shadow"
            aria-label="Dismiss message"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <button
        className={`cursor-custom-pointer flex items-center justify-center w-14 h-14 rounded-full bg-black text-white shadow-lg transition-all duration-300 ease-in-out ${
          isOpen ? 'rotate-90 scale-110' : 'hover:scale-110'
        }`}
        onClick={() => {toggleChat();
          closePrompt();
        }}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <X className="w-6 h-6 transition-all duration-300" />
        ) : (
          <MessageCircle className="w-6 h-6 transition-all duration-300" />
        )}
      </button>
    </div>
  );
};

export default ChatBubble;