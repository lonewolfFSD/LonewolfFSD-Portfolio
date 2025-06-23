import React from 'react';
import { motion } from 'framer-motion';

const TailwindSpinner: React.FC = () => {
  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: {
        repeat: Infinity,
        duration: 1,
        ease: 'linear',
      },
    },
  };

  return (
    <div className="flex justify-center items-center py-6">
      <motion.div
        variants={spinnerVariants}
        animate="animate"
        className="w-12 h-12 border-4 border-t-black border-gray-200 rounded-full"
      />
    </div>
  );
};

export default TailwindSpinner;