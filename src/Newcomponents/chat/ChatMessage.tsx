import React, { useState, useEffect } from 'react';
import { Message } from '../../types/chat';
import { Copy, Check, Volume2 } from 'lucide-react';
import Lyra from '../../mockups/Lyra.jpg';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from 'react-i18next';

// Utility function to clean text for TTS
const cleanTextForTTS = (text: string): string => {
  // Remove Markdown syntax, code blocks, links, and emojis
  let cleaned = text
    // Remove code blocks (```...``` and `...`)
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    // Remove links ([text](url) and raw URLs)
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/https?:\/\/[^\s]+/g, '')
    // Remove Markdown headers (#, ##, etc.)
    .replace(/#{1,6}\s*/g, '')
    // Remove bold/italic (*, **, _, __)
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // Remove lists (-, *, 1., etc.)
    .replace(/^\s*[-*+]\s/gm, '')
    .replace(/^\s*\d+\.\s/gm, '')
    // Remove blockquotes (>)
    .replace(/^\s*>\s*/gm, '')
    // Remove emojis (Unicode ranges and shortcodes)
    .replace(/[\u{1F600}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .replace(/:[a-zA-Z0-9_]+:/g, '')
    // Remove excessive punctuation (e.g., !, #, //)
    .replace(/[#!*]+/g, '')
    .replace(/\/\/+/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned || 'No text to read.';
};

interface ChatMessageProps {
  message: Message;
  isLatest: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLatest }) => {
  const isAiMessage = message.sender === 'ai';
  const [isCopied, setIsCopied] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const { i18n } = useTranslation();

  // Load voices with retry mechanism
  useEffect(() => {
    let voiceLoadTimeout: NodeJS.Timeout;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      console.log('Available voices:', availableVoices.map(v => ({ name: v.name, lang: v.lang })));
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        clearTimeout(voiceLoadTimeout);
      } else {
        voiceLoadTimeout = setTimeout(loadVoices, 500);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      clearTimeout(voiceLoadTimeout);
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Handle text-to-speech
  const handleSpeak = () => {
    if (!window.speechSynthesis) {
      console.error('Text-to-speech is not supported in this browser.');
      alert('Text-to-speech is not supported in your browser.');
      return;
    }

    window.speechSynthesis.cancel();

    const cleanedText = cleanTextForTTS(message.text);
    console.log('Cleaned text for TTS:', cleanedText);

    const utterance = new SpeechSynthesisUtterance(cleanedText);

    const languageMap: { [key: string]: string } = {
      en: 'en-US',
      es: 'es-ES',
      fr: 'fr-FR',
      pt: 'pt-BR',
      it: 'it-IT',
      zh: 'zh-CN',
      ja: 'ja-JP',
      ko: 'ko-KR',
    };

    const language = languageMap[i18n.language] || 'en-US';
    console.log('Selected language:', language);
    utterance.lang = language;

    // Female voice name patterns (common female names or identifiers)
    const femaleVoicePatterns = [
      'samantha',
      'victoria',
      'alexa',
      'carmen',
      'sofia',
      'isabella',
      'emma',
      'olivia',
      'ava',
      'female',
      'mujer',
      'femenina',
    ];

    // Filter voices for the selected language and female-sounding names
    const matchingVoices = voices.filter(voice => 
      voice.lang === language && 
      femaleVoicePatterns.some(pattern => 
        voice.name.toLowerCase().includes(pattern)
      )
    );

    // Fallback to any voice for the language if no female voice is found
    const selectedVoice = matchingVoices.length > 0 
      ? matchingVoices[0]
      : voices.find(voice => voice.lang === language);

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log('Selected voice:', selectedVoice.name);
    } else {
      console.warn(`No voice found for language: ${language}. Using default voice.`);
    }

    utterance.volume = 1;
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
    };

    utterance.onstart = () => {
      console.log('Speech started');
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error initiating speech:', error);
    }
  };

  return (
    <div
      className={`flex w-full ${isAiMessage ? 'justify-start' : 'justify-end'} animate-fadeIn`}
    >
      {isAiMessage && (
        <div className="flex items-center justify-center w-8 h-8 bg-black text-white rounded-full mr-2 flex-shrink-0">
          <img className="rounded-full pointer-events-none" src={Lyra} alt="Lyra" />
        </div>
      )}
      
      <div className="flex flex-col max-w-[80%]">
        <div
          className={`relative py-3 px-4 mb-2 rounded-xl ${
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
        
        {isAiMessage && (
          <div className="flex gap-1.5 mb-4">
            <button
              onClick={handleCopy}
              className="p-1 text-gray-500 hover:bg-gray-200 rounded-md hover:text-gray-800 transition-colors duration-200"
              title="Copy message"
            >
              {isCopied ? <Check size={14} /> : <Copy size={14} />}
            </button>
            <button
              onClick={handleSpeak}
              className="p-1 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md transition-colors duration-200"
              title="Read aloud"
            >
              <Volume2 size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;