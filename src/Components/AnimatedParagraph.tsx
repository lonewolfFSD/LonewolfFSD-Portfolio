import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import '../../i18n'; // Import i18n configuration



const AnimatedParagraph: React.FC = () => {
  const { t, i18n } = useTranslation();
const paragraph = t('collab_body');

  const words = paragraph.split(' ');
  
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.02,
        delayChildren: 0.6
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  };
  
  return (
    <motion.p 
      className="text-md lg:text-lg 3xl:text-xl -mt-6 3xl:mt-0 text-black leading-relaxed md:max-w-[900px] md:mx-auto"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, index) => (
        <motion.span key={index} variants={item} className="inline-block mr-1">
          {word}
        </motion.span>
      ))}
    </motion.p>
  );
};

export default AnimatedParagraph;