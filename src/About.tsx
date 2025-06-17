import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Github, Inbox, Instagram, LogOut, Menu, Settings, Twitter, User, Wallet, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useAvatar } from './AvatarContext';
import { Link } from 'react-router-dom';
import { DotPatternWithGlowEffectDemo } from './DotPattern';

import Helmet from 'react-helmet';

const WordReveal = ({
  text,
  start,
  onComplete,
}: {
  text: string;
  start: boolean;
  onComplete: () => void;
}) => {
  const words = text.split(' ');
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (start && !hasAnimated) {
      const totalDelay = words.length * 30 + 400;
      const timeout = setTimeout(() => {
        onComplete();
        setHasAnimated(true);
      }, totalDelay);
      return () => clearTimeout(timeout);
    }
  }, [start, hasAnimated]);

  const shouldAnimate = start || hasAnimated;

  return (
    <div className="flex flex-wrap text-left">
      {words.map((word, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={shouldAnimate ? { opacity: 1, y: 0 } : {}}
          transition={{
            delay: shouldAnimate ? index * 0.03 : 0,
            duration: 0.4,
          }}
          className="mr-2"
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
};

const About: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isDark, setIsDark] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState<boolean>(false);
  const [user, setUser] = useState(null);
  const { avatarURL } = useAvatar();
  const navigate = useNavigate();

  // Profile dropdown options
    const profileOptions = [
    { label: 'Profile', icon: User, action: () => navigate('/profile') },
    { label: 'Admin Panel', icon: Settings, action: () => navigate("/gmpXRP05issfL14jWssIcxKOREJUNYwMwaS7mbQv69DAZ78N29"), adminOnly: true },
    { label: "Purchase History", icon: Wallet, action: () => navigate("/purchase-history") },
    { label: "Enquiry Listing", icon: Inbox, action: () => navigate("/enquiries"), adminOnly: true },
    { label: 'Log Out', icon: LogOut, action: () => signOut(auth).then(() => navigate('/')) },
  ];

  const paragraphs = [
    "I'm a versatile full-stack developer with a passion for building clean, efficient, and purposeful digital tools. With a refined sense for both frontend elegance and backend robustness, I work across the stack to deliver well-rounded, reliable applications.",
    "I thrive on solving real-world problems with practical code, blending functionality with user-centered design. Whether it's building responsive dashboards, crafting intuitive APIs, or automating complex workflows — I focus on clarity, simplicity, and maintainability.",
    "Over time, I've expanded my work into AI and machine learning integrations, exploring intelligent systems that not only automate but also adapt. That curiosity drives me to create digital experiences that evolve, personalize, and empower.",
    "When I'm not coding, I often experiment with micro-interactions, performance optimization, or just reflect on how small design decisions impact a user's entire journey. I value silence, depth, and precision — both in code and in thought.",
  ]; 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="min-h-screen bg-white text-black relative"
    ><Helmet>
      <title>About LonewolfFSD</title>
      <link rel="canonical" href="https://lonewolffsd.in/about" />
    </Helmet>
      <div className="absolute inset-0 z-50 pointer-events-none">
        <div className="relative h-[800px] w-full overflow-hidden">
          <DotPatternWithGlowEffectDemo />
        </div>
      </div>
      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <motion.header
          className="container mx-auto px-6 py-8 flex justify-between items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="text-xl font-medium flex"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <a href="">
              <img
                src="https://pbs.twimg.com/profile_images/1905319445851246592/KKJ22pIP_400x400.jpg"
                className="rounded-full cursor-custom-pointer"
                style={{ width: '60px', height: 'auto', marginBottom: '-5px' }}
                alt="Logo"
              />
            </a>
          </motion.div>

          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {/* Profile Button and Dropdown */}
            <div className="relative ">
<motion.button
  onClick={() => {
    if (user) {
      setIsProfileDropdownOpen(!isProfileDropdownOpen); // Toggle dropdown for logged-in users
    } else {
      navigate("/auth"); // Navigate to auth for guests
    }
  }}
  className={`${
    avatarURL || auth.currentUser?.photoURL ? "p-1.5" : "p-2"
  } md:p-2 rounded-full -mr-4 md:mr-0 cursor-custom-pointer ${
    isDark ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-600"
  } transition-colors`}
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 0.6, duration: 0.5 }}
>
  {avatarURL || auth.currentUser?.photoURL ? (
    <img
      src={avatarURL || auth.currentUser?.photoURL}
      alt="Profile"
      className="w-9 h-9 rounded-full object-cover cursor-custom-pointer"
    />
  ) : (
    <User className="w-5 h-5 cursor-custom-pointer" />
  )}
</motion.button>

              {user && isProfileDropdownOpen && (
                <motion.div
                  className={`absolute top-full right-0 mt-5 w-60 border border-black/20 rounded-2xl shadow-lg z-20 overflow-hidden ${
                    isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                  }`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="p-4">
                    <div className="ml-1 flex">
                      {avatarURL || auth.currentUser?.photoURL ? (
                        <img
                          src={avatarURL || auth.currentUser?.photoURL}
                          alt="Profile"
                          className="w-10 h-10 rounded-full object-cover bg-gray-200 p-1"
                        />
                      ) : (
                        <User className="w-5 h-5" />
                      )}
                      <div className="flex flex-col mb-3.5">
                        <p className="text-sm font-semibold ml-2">{user.displayName}</p>
                        <p className="text-xs text-gray-500 font-semibold ml-2">{user.email}</p>
                      </div>
                    </div>
                    {profileOptions.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          option.action();
                          setIsProfileDropdownOpen(false);
                        }}
                        className={`w-full cursor-custom-pointer text-left text-[14.3px] px-1.5 hover:px-3 group hover:font-semibold transition-all py-[7px] rounded-lg flex items-center gap-2.5 ${
                          isDark ? 'hover:bg-gray-750' : 'hover:bg-gray-100'
                        }`}
                      >
                        <option.icon className="w-4 h-4 opacity-60 bg-white text-gray-950 [stroke-width:2] group-hover:[stroke-width:3]" />
                        {option.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            <a href="https://form.jotform.com/251094777041054">
              <motion.button
                className={`px-6 cursor-custom-pointer hidden md:block hover:px-8 transition-all py-2 rounded-full font-semibold ${
                  isDark ? 'bg-white text-black hover:bg-gray-100' : 'bg-black text-white hover:bg-gray-900'
                } flex items-center gap-2`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                Let's Connect
              </motion.button>
            </a>

            {/* Menu Button and Navigation Menu */}
            <div className="relative">
              <motion.button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-2 cursor-custom-pointer rounded-full border ${
                  isDark ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-100'
                } transition-colors relative z-50`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </motion.button>

              {isMenuOpen && (
        <motion.div
          className={`absolute top-full right-0 mt-4 w-64 border border-black/10 rounded-xl shadow-2xl z-20 overflow-hidden backdrop-blur-sm ${
            isDark ? 'bg-gray-900/95' : 'bg-white/95'
          }`}
          initial={{ opacity: 0, y: -15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <nav className="p-3">
            {[
              { label: 'About Me', href: '/about-me' },
              { label: 'LonewolfFSD Blogs', href: '/blogs' },
              { label: 'The RepoHub', href: 'https://github.com/lonewolfFSD?tab=repositories' },
              { label: 'FSD DevSync', href: '/dev-sync' },
              { label: 'Wanna Collaborate?', href: '/lets-collaborate' },
            ].map((item, index) => (
              <Link
                key={index}
                to={item.href}
                className="block cursor-pointer px-4 py-2.5 text-[15px] font-semibold rounded-lg transition-all duration-200 hover:bg-gray-100 hover:pl-5"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="border-t border-black/10 mx-4 my-2" />
            <div className="px-4 py-3 flex gap-4">
              <a href="https://github.com/lonewolffsd" target="_blank" className="opacity-60 hover:opacity-100 transition-all">
                <Github className="w-5 h-5 cursor-pointer" />
              </a>
              <a href="https://instagram.com/lonewolffsd" target="_blank" className="opacity-60 hover:opacity-100 transition-all">
                <Instagram className="w-5 h-5 cursor-pointer" />
              </a>
              <a href="https://x.com/lonewolffsd" target="_blank" className="opacity-60 hover:opacity-100 transition-all">
                <Twitter className="w-5 h-5 cursor-pointer" />
              </a>
            </div>
          </nav>
        </motion.div>
      )}
            </div>
          </motion.div>
        </motion.header>

        <div className="px-6 md:px-20 py-14 lg:py-24 flex items-center justify-center">
          <div className="max-w-5xl w-full flex flex-col items-start space-y-6">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl mb-4 font-bold"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              About LonewolfFSD
            </motion.h1>

            <div
              className="text-lg leading-relaxed space-y-6 text-left"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {paragraphs.map((text, index) => (
                <WordReveal
                  key={index}
                  text={text}
                  start={currentStep === index}
                  onComplete={() => setCurrentStep((prev) => prev + 1)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default About;