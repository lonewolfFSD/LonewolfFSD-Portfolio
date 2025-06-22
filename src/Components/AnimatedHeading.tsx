import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import '../../i18n'; // Import i18n configuration

const AnimatedHeading: React.FC = () => {
  const { t, i18n } = useTranslation();

  return (
    <div className="overflow-visible relative flex flex-col items-center" style={{
      fontFamily: 'Poppins'
    }}>
      <motion.h2 
        className="text-[80px] md:text-7xl lg:text-[103px] font-bold tracking-tight text-transparent leading-none"
        style={{ WebkitTextStroke: '2px black' }}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          duration: 0.8,
          ease: [0.25, 0.1, 0.25, 1]
        }}
      >
        {t('collab_title')}
      </motion.h2>
      
      <motion.h1 
        className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight text-black leading-none -mt-1 md:mt-[-20px]"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          duration: 0.8, 
          delay: 0.2,
          ease: [0.25, 0.1, 0.25, 1]
        }}
      >
        {t('collab_subtitle')}
      </motion.h1>
    </div>
  );
};

export default AnimatedHeading;