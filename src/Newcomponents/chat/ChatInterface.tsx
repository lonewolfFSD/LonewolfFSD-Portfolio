import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import ChatHeader from './ChatHeader';
import ChatMessage from './ChatMessage';
import ConversationStarters from './ConversationStarters';

const ChatInterface: React.FC = () => {
  const { isOpen, messages, showStarters, sendMessage } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    
    if (isOpen && inputRef.current && messages.length > 0) {
      inputRef.current.focus();
    }
  }, [isOpen, messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  if (!isOpen) return null;

  // Define the initial message
  const initialMessage = {
    text: "Hello! I'm your AI Assistant. How can I help you today?",
    isUser: false,
  };

  console.log('ChatInterface state:', { isOpen, showStarters, messages }); // Debug

  return (
    <div 
  className="fixed bottom-24 right-6 w-96 h-[600px] sm:bottom-24 sm:right-6 sm:w-96 sm:h-[600px] 
             bg-white rounded-3xl border border-black shadow-lg flex flex-col overflow-hidden z-50 animate-slideIn
             max-sm:bottom-0 max-sm:right-0 max-sm:w-full max-sm:h-full max-sm:rounded-none"
  style={{ opacity: 0, animation: 'slideIn 0.3s forwards' }}
>

      <ChatHeader name="AI Assistant" role="Virtual Helper" />
      
      <div className="flex-1 overflow-y-auto p-4 pt-5 space-y-1">
        {/* Always show the initial message when no user messages exist */}
        {messages.length === 0 ? (
          <>
            <ChatMessage 
              key="initial"
              message={initialMessage}
              isLatest={true}
            />
            {/* Show ConversationStarters if showStarters is true */}
            <span className='cursor-custom-pointer'>
            {showStarters && <ConversationStarters />}
            </span>
          </>
        ) : (
          <>
            {/* Render all messages */}
            {messages.map((message, index) => (
              <ChatMessage 
                key={index} 
                message={message} 
                isLatest={index === messages.length - 1} 
              />
            ))}
            {/* Optionally show ConversationStarters below messages */}

            {showStarters && <ConversationStarters />}

          </>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="border-t border-gray-200 p-3 flex">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{
            fontFamily: 'Poppins'
          }}
          placeholder="How can Lyra help?"
          className="flex-1 py-3 px-3 rounded-b-lg outline-none text-[13px]"
        />
        <button
          type="submit"
          className={`ml-2 rounded-full w-10 h-10 mt-0.5 flex ${!input.trim() ? 'cursor-not-allowed opacity-50' : ''} items-center justify-center bg-black text-white`}
          disabled={!input.trim()}
        >
          <ArrowUp strokeWidth={4} className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;