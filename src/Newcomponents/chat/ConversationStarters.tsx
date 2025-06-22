import React, { useMemo } from 'react';
import { useChat } from '../../hooks/useChat';
import { useTranslation } from 'react-i18next';

// Define 20 unique starter questions related to LonewolfFSD and the portfolio
const starters = [
  "Who is LonewolfFSD and what’s their story?",
  "Can you tell me about this portfolio and what it showcases?",
  "What kind of projects are featured in LonewolfFSD’s portfolio?",
  "What tech stack is used in the projects showcased here?",
  "Show me a recent project from LonewolfFSD’s portfolio.",
  "How does LonewolfFSD integrate AI into the projects listed in the portfolio?",
  "Is LonewolfFSD available for freelance work through this portfolio?",
  "What makes LonewolfFSD’s portfolio unique compared to others?",
  "What websites has LonewolfFSD developed, and can I see them here?",
  "Does LonewolfFSD work solo on these projects or with a team?",
  "What tools or libraries are preferred in the projects on this portfolio?",
  "Where can I view the source code or GitHub links for these projects?",
  "Can I contact LonewolfFSD through this portfolio website?",
  "Are there any upcoming projects in LonewolfFSD’s portfolio?",
  "What skills does LonewolfFSD showcase in their portfolio?",
  "Tell me more about the Lyra AI system featured in the portfolio.",
  "Where can I learn more about LonewolfFSD’s journey and projects?"
];

// Function to randomly select 4 questions
const getRandomStarters = (starters: string[]): string[] => {
  const shuffled = [...starters].sort(() => Math.random() - 0.5); // Shuffle array
  return shuffled.slice(0, 4); // Return first 4
};

const ConversationStarters: React.FC = () => {
  const { sendMessage } = useChat();
  const { t } = useTranslation();

  // Use useMemo to memoize the random selection and translate the starters
  const randomStarters = useMemo(() => {
    const selectedStarters = getRandomStarters(starters);
    return selectedStarters.map(starter => ({
      original: starter,
      translated: t(starter)
    }));
  }, [t]); // Re-run if translation function changes (e.g., language switch)

  return (
    <div className="py-4 px-0 animate-fadeIn z-50">
      <p className="text-xs text-gray-500 mb-2">{t('Suggestions: ')}</p>
      <div className="flex flex-wrap gap-2 text-left">
        {randomStarters.map((starter, index) => (
          <button
            key={index}
            className="px-3 py-1.5 text-xs text-left bg-gray-100 border hover:border-black hover:bg-gray-200 rounded-lg transition-colors duration-200"
            onClick={() => sendMessage(starter.translated)} // Send translated text
          >
            {starter.translated} {/* Display translated text */}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ConversationStarters;