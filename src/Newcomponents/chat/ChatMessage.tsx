import React from 'react';
import { Message } from '../../types/chat';
import { Bot } from 'lucide-react';
import Lyra from '../../mockups/Lyra.jpg';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: Message;
  isLatest: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLatest }) => {
  const isAiMessage = message.sender === 'ai';
  
  return (
    <div
      className={`flex w-full ${isAiMessage ? 'justify-start' : 'justify-end'} animate-fadeIn`}
    >
      {isAiMessage && (
        <div className="flex items-center justify-center w-8 h-8 bg-black text-white rounded-full mr-2 flex-shrink-0">
          <img className='rounded-full pointer-events-none' src={Lyra} />
        </div>
      )}
      
      <div
        className={`relative max-w-[80%] py-3 px-4 mb-4 rounded-xl ${
          isAiMessage
            ? 'bg-gray-100 text-gray-800'
            : 'bg-black text-white ml-2'
        }`}
      >
        <div className="text-sm prose prose-sm max-w-none">
          <ReactMarkdown
            components={{
              a: ({ node, ...props }) => (
                <a {...props} className="font-semibold underline" target="_blank" rel="noopener noreferrer" />
              )
            }}
          >
            {message.text}
          </ReactMarkdown>
        </div>
        
        {isAiMessage && isLatest && message.isTyping && (
          <div className="flex space-x-1 mt-1">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;