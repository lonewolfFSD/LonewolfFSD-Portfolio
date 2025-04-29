import React from 'react';
import { motion } from 'framer-motion';

const paragraph = "LonewolfFSD is looking to collaborate with forward-thinking individuals to create meaningful digital experiences that push boundaries and inspire change. My approach ensures your vision stays at the forefront while I leverage my expertise to bring it to life.";

const AnimatedParagraph: React.FC = () => {
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
      className="text-md md:text-xl -mt-6 md:mt-0 text-black leading-relaxed md:max-w-[900px] md:mx-auto"
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