import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Helmet from 'react-helmet';
import { useTranslation } from 'react-i18next';
import '../../i18n'; // Import i18n configuration

const AnimatedButton: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio('https://audio.jukehost.co.uk/IHOcZzqFq02IgQFzkWPOa8OpQQj7pn8Y');
    audioRef.current.volume = 0.5;
    audioRef.current.loop = true;

    // Wait for Typeform embed to load
    const interval = setInterval(() => {
      if ((window as any).typeformEmbed) {
        const { open } = (window as any).typeformEmbed;
        // Listen to events
        window.addEventListener("message", (event) => {
          if (event.data?.type === "form-close") {
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
            }
          }
        });
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const handleOverlayClick = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => console.warn("Audio failed to play", err));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1.2 }}
      className="relative flex justify-center group"
    >

      {/* Visible button */}
      <a href="https://form.jotform.com/251094738388065">
      <motion.button
        className="relative cursor-custom-pointer -mt-8 md:mt-0 z-10 flex whitespace-nowrap items-center justify-center space-x-2 bg-black text-white px-32 py-3 md:py-4 rounded-full text-lg font-medium transition-all duration-300 group-hover:bg-transparent group-hover:backdrop-blur-md group-hover:text-black border border-2 border-black"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
      >
        <span>{t('collab_button')}</span>
        <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
      </motion.button>
      </a>
    </motion.div>
  );
};

export default AnimatedButton;
