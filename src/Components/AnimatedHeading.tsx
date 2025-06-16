import React from 'react';
import { motion } from 'framer-motion';

const AnimatedHeading: React.FC = () => {
  return (
    <div className="overflow-visible relative flex flex-col items-center" style={{
      fontFamily: 'Poppins'
    }}>
      <motion.h2 
        className="text-[98px] md:text-7xl lg:text-[103px] font-bold tracking-tight text-transparent leading-none"
        style={{ WebkitTextStroke: '2px black' }}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          duration: 0.8,
          ease: [0.25, 0.1, 0.25, 1]
        }}
      >
        WANNA
      </motion.h2>
      
      <motion.h1 
        className="text-5xl md:text-8xl lg:text-9xl font-bold tracking-tight text-black leading-none -mt-1 md:mt-[-20px]"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          duration: 0.8, 
          delay: 0.2,
          ease: [0.25, 0.1, 0.25, 1]
        }}
      >
        COLLABORATE?
      </motion.h1>
    </div>
  );
};

export default AnimatedHeading;