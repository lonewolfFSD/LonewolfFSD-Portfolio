import { useState } from 'react';
import { Github, Instagram, Twitter, Moon, Sun, X, Menu, User } from 'lucide-react';
import { Calendar, Clock, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';



function App() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);
    
    {/* Header */}
    <motion.header
    className="container mx-auto px-6 py-8 flex justify-between items-center relative"
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
      <a href="/">
        <img
          src="https://pbs.twimg.com/profile_images/1905319445851246592/KKJ22pIP_400x400.jpg"
          className="rounded-full"
          style={{ width: '60px', height: 'auto', marginBottom: '-5px' }}
          alt="Logo"
        />
      </a>
    </motion.div>



    {/* Animated Action Buttons */}
    <motion.div
      className="flex items-center gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.5 }}
    >
      <motion.button
        className={`px-6 hover:px-8 transition-all py-2 rounded-full font-semibold ${isDark ? 'bg-white text-black hover:bg-gray-100' : 'bg-black text-white hover:bg-gray-900'} flex items-center gap-2`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        Let's Connect
      </motion.button>
      <motion.button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={`p-2 rounded-full border ${isDark ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-100'} transition-colors relative z-50`}
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
        className={`absolute top-full right-6 w-64 mt-2 rounded-2xl shadow-lg z-10 overflow-hidden transition-all transform origin-top-right ${isDark ? 'bg-gray-800' : 'bg-white'}`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0, duration: 0.4 }}
      >
        <nav className="p-3">
          {[
            { label: 'About Me', href: '#about' },
            { label: 'My Blogs', href: '/blogs' },
            { label: 'Insights', href: '#insights' },
            { label: 'Wanna Collaborate?', href: '#collab' },
          ].map((item, index) => (
            <Link
              key={index}
              to={item.href}
              className={`block px-6 py-3 rounded-lg transition-all duration-300 ease-in-out hover:ml-1 hover:font-semibold ${
                isDark ? 'hover:bg-gray-750' : 'hover:bg-gray-100'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="border-t mx-6 my-2 opacity-10" />
          <div className="px-6 py-3 flex gap-4">
            <a href="https://github.com/lonewolffsd" target="_blank" className="opacity-60 hover:opacity-100 transition-opacity">
              <Github className="w-5 h-5" />
            </a>
            <a href="https://instagram.com/lonewolffsd" target="_blank" className="opacity-60 hover:opacity-100 transition-opacity">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="https://x.com/lonewolffsd" target="_blank" className="opacity-60 hover:opacity-100 transition-opacity">
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </nav>
      </motion.div>
    )}
  </motion.header>
}

export default App;