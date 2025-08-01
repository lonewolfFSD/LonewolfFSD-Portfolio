import React, { useState, useEffect } from 'react';
import Spline from '@splinetool/react-spline';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Github } from 'lucide-react';
import Lyra from '../mockups/Lyra.png';

const LyraModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  useEffect(() => {
    const hasSeenModal = localStorage.getItem('hasSeenLyraModal');
    if (!hasSeenModal) {
      setIsOpen(true);
      localStorage.setItem('hasSeenLyraModal', 'true');
    }
  }, []);

  const handleTryLyra = () => {
    window.location.href = 'https://lyralabs.lonewolffsd.in';
  };

  const handleViewSource = () => {
    window.open('https://github.com/xai-org', '_blank');
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 pointer-events-none backdrop-blur-sm flex flex-col items-center sm:justify-end bg-gradient-to-br from-rose-500/20 via-purple-600/20 to-rose-500/20 z-50 p-4"
          style={{
            boxShadow: '0 0 20px rgba(255, 105, 180, 0.5), 0 0 40px rgba(147, 51, 234, 0.3)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Spline Background */}
          <div className="absolute inset-0 pointer-events-none select-none opacity-80">
            <Spline
              scene="https://prod.spline.design/cUjAOs-k31DqGOKT/scene.splinecode"
              style={{
                width: '100%',
                height: '100%',
                transform: 'scale(1.5)',
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            />
          </div>

          {/* Bottom Gradient Overlay */}
          <div className="absolute bottom-0 left-0 right-0 z-10 h-1/3 bg-gradient-to-t from-[rgba(255,116,185,0.8)] to-transparent pointer-events-none" />

          {/* Falling Petal Effect */}
          <div className="absolute inset-0 pointer-events-none z-5">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-pink-400/70 rounded-full"
                style={{
                  width: `${Math.random() * 16 + 12}px`,
                  height: `${Math.random() * 10 + 8}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${-Math.random() * 20}%`,
                  animation: `fall-petal ${Math.random() * 6 + 4}s linear infinite`,
                  animationDelay: `${Math.random() * 5}s`,
                  opacity: Math.random() * 0.4 + 0.4,
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            ))}
          </div>

          {/* Close Button */}
          <motion.button
            onClick={handleClose}
            className="absolute top-4 right-4 bg-black/10 border-white text-white border-2 rounded-full p-3 transition-all duration-100 z-20 group pointer-events-auto"
            aria-label="Close modal"
            whileHover={{ scale: 1.03, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <X strokeWidth={3} className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
          </motion.button>

          {/* Content */}
          <motion.div
            className="relative z-10 text-center mt-10 sm:mb-10 pointer-events-auto"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {/* Heading */}
            <img className='w-[400px] md:w-[450px] mr-6 mx-auto -mb-2' src='https://i.postimg.cc/t4NK0V9N/Pics-Art-07-31-09-54-26.png' />

            {/* Description */}
            {/* <motion.p
              className="text-white/90 text-base leading-relaxed max-w-2xl mx-auto mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Experience the next generation of AI interaction. Explore Lyra's capabilities or dive into the source code.
            </motion.p> */}

            {/* Buttons */}
            <motion.div
              className="flex flex-row gap-2.5 justify-center -mb-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <motion.button
                onClick={handleTryLyra}
                className="bg-white border border-black text-black px-10 py-3 rounded-full font-semibold text-base hover:bg-rose-100 transition-all duration-100"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Visit LyraLabs AI
              </motion.button>
              <motion.button
                onClick={handleViewSource}
                className="bg-black/40 backdrop-blur-lg border-2 border-white/50 text-white py-3 px-3.5 rounded-full font-medium text-base hover:border-white/80 transition-all duration-100 flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                <Github size={22} />
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Big Lyra Logo */}
          <motion.div
            className="absolute bottom-10 text-center pointer-events-none"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <img className="w-full max-w-2xl sm:max-w-xl md:max-w-[650px] 3xl:max-w-[800px] -mb-10" src={Lyra} alt="Lyra Logo" />
          </motion.div>

          {/* Decorative Elements */}
          <div className="absolute top-10 left-10 w-24 h-24 bg-rose-300/10 rounded-full blur-xl animate-float pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-20 h-20 bg-purple-600/10 rounded-full blur-xl animate-float pointer-events-none" style={{ animationDelay: '1s' }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LyraModal;