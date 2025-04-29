import React from 'react';
import { MessageCircle, MessageSquare, Sparkles, X } from 'lucide-react';
import { useChat } from '../../hooks/useChat';

const ChatBubble: React.FC = () => {
  const { isOpen, toggleChat } = useChat();

  return (
    <button
      className={`fixed cursor-custom-pointer bottom-6 right-6 z-10 flex items-center justify-center w-14 h-14 rounded-full bg-black text-white shadow-lg transition-all duration-300 ease-in-out ${
        isOpen ? 'rotate-90 scale-110' : 'hover:scale-110'
      }`}
      onClick={toggleChat}
      aria-label={isOpen ? 'Close chat' : 'Open chat'}
    >
      {isOpen ? (
        <X className="w-6 h-6 transition-all duration-300" />
      ) : (
        <Sparkles className="w-6 h-6 transition-all duration-300" />
      )}
    
    </button>
  );
};

export default ChatBubble;