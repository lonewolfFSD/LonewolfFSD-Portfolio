import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AnimatedHeading from './AnimatedHeading';
import AnimatedParagraph from './AnimatedParagraph';
import AnimatedButton from './AnimatedButton';
import { useAvatar } from '../AvatarContext';
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { onAuthStateChanged, User as FirebaseUser, signOut } from "firebase/auth";
import logo from '../mockups/logo.png';

import { ToastContainer } from 'react-toastify';
import { showOfflineToast, dismissOfflineToast } from './toast';

import Helmet from 'react-helmet';

import { ChatBubble } from '../Newcomponents/chat';
import { ChatInterface } from '../Newcomponents/chat';
import { Link } from 'react-router-dom';

import Project from '../Projects';
import { auth } from '../../firebase';
import { Github, Instagram, LogOut, Menu, Twitter, User, X } from 'lucide-react';

const HeroSection: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState<boolean>(false); // New state for profile dropdown
    const [user, setUser] = useState<FirebaseUser | null>(null); // State for Firebase user
    const { avatarURL } = useAvatar();
    const navigate = useNavigate();
      const [isDark, setIsDark] = useState(false);

        // Listen for auth state changes
        useEffect(() => {
          const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
          });
          return () => unsubscribe();
        }, []);

        // Profile dropdown options
  const profileOptions = [
    { label: "Profile", icon: User, action: () => navigate("/profile") },
    { label: "Log Out", icon: LogOut, action: () => signOut(auth).then(() => navigate("/")) },
  ];
  return (
    <div className="min-h-screen ">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0 blur-sm"
        src="https://static.vecteezy.com/system/resources/previews/001/807/379/mp4/grey-plexus-background-free-video.mp4"
      />


      <Helmet>
        <title>
          Wanna Collaborate?
        </title>
        <link rel="canonical" href="https://lonewolffsd.in/lets-collaborate" />
        
      </Helmet>
      
      <div className="absolute top-0 left-0 w-full h-full bg-gray-100/10 z-10" /> {/* Optional overlay for better text visibility */}
      {/* Header */}
      <motion.header
        className="container mx-auto px-6 py-8 flex justify-between items-center relative z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Animated Logo */}
        <motion.div
          className="text-xl font-medium flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <a href=""><img src={logo} className='rounded-full cursor-custom-pointer pointer-events-none' style={{
            width: '60px', height: 'auto', marginBottom: '-5px'
          }}/></a>
        </motion.div>

        {/* Animated Action Buttons */}
        <motion.div
          className="flex items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
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
    isDark ? "bg-gray-800 text-gray-300" : "bg-transparent border border-black text-gray-600"
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

                  {/* Dropdown for logged-in users */}
                  {user && isProfileDropdownOpen && (
                              <motion.div
                                className={`absolute top-full right-60 w-52 md:w-60 border border-black/20 mt-[-20px] rounded-2xl shadow-lg z-10 overflow-hidden ${
                                  isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"
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
                                        isDark ? "hover:bg-gray-750" : "hover:bg-gray-100"
                                      }`}
                                    >
                                      <option.icon className="w-4 h-4 opacity-60 bg-white text-gray-950 [stroke-width:2] group-hover:[stroke-width:3]" />
                                      {option.label}
                                    </button>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                                      <Link to="/contact">
                    <motion.button
                      className={`px-6 hidden md:block hover:px-8 transition-all py-2 rounded-full font-semibold ${isDark ? 'bg-white text-black hover:bg-gray-100' : 'bg-black text-white hover:bg-gray-900'} flex items-center gap-2`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8, duration: 0.5 }}
                    >
                      Let's Connect
                    </motion.button>
                    </Link>
          <motion.button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`p-2 cursor-custom-pointer rounded-full border ${isDark ? 'border-black hover:bg-gray-800' : 'border-black hover:bg-gray-100'} transition-colors relative z-50`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </motion.button>
        </motion.div>

        {/* Animated Dropdown Menu */}
        {isMenuOpen && (
          <motion.div
            className={`absolute top-full right-6 w-64 mt-[-20px] border border-black/20 rounded-2xl shadow-lg z-10 overflow-hidden transition-all transform origin-top-right ${isDark ? 'bg-gray-800' : 'bg-white'}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0, duration: 0.4 }}
          >
            <nav className="p-3">
              {[
                              { label: 'About Me', href: '/about-me' },
                              { label: 'My Blogs', href: '/blogs' },
                              { label: 'The RepoHub', href: 'https://github.com/lonewolfFSD?tab=repositories' },
                              { label: 'Wanna Collaborate?', href: '/lets-collaborate' },
                            ].map((item, index) => (
                              <Link
                                key={index}
                                to={item.href}
                                className={`block px-6 py-2.5 md:py-3 text-[16px] md:text-[15.5px] font-medium cursor-custom-pointer rounded-lg transition-all duration-300 ease-in-out hover:ml-1 hover:font-semibold ${
                                  isDark ? 'hover:bg-gray-750' : 'hover:bg-gray-100'
                                }`}
                                onClick={() => setIsMenuOpen(false)}
                              >
                                {item.label}
                              </Link>
                            ))}

              <div className="border-t mx-6 my-1.5 opacity-10" />

              <div className="px-6 py-3 flex gap-4">
                <a href="https://github.com/lonewolffsd" target="_blank" className="opacity-60 hover:opacity-100 transition-opacity">
                  <Github className="w-5 h-5 cursor-custom-pointer" />
                </a>
                <a href="https://instagram.com/lonewolffsd" target="_blank" className="opacity-60 hover:opacity-100 transition-opacity">
                  <Instagram className="w-5 h-5 cursor-custom-pointer" />
                </a>
                <a href="https://x.com/lonewolffsd" target="_blank" className="opacity-60 hover:opacity-100 transition-opacity">
                  <Twitter className="w-5 h-5 cursor-custom-pointer" />
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </motion.header>
      <motion.div 
        className="text-center -mt-10 md:mt-0 max-w-3xl mx-auto relative z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className='mt-16 relative flex flex-col items-center justify-center px-4 md:px-8 py-16'>
        <AnimatedHeading />
        
        <div className="mt-12 mb-8">
          <AnimatedParagraph />
        </div>
        
        <div className="mt-10">
          <AnimatedButton />
        </div>
        </div>

        <div>
          <p className='text-sm px-10 md:px-0 -mt-4'>Wanna hire LonewolFSD? You are in the wrong place mate! <span className='font-bold underline '><Link to="/contact" className='cursor-custom-pointer'>Click here</Link></span></p>
        </div>
      </motion.div>

      <ToastContainer />
      <>
      {isOnline ? (
        <>
          <ChatInterface />
          <ChatBubble />
        </>
      ) : (
        <span />
      )}
    </>
    </div>
  );
};

export default HeroSection;
