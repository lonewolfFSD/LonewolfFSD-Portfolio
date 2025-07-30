import { useState, useEffect } from 'react';
import { Github, Instagram, Twitter, Moon, Sun, X, Menu, User, Settings, LogOut, Sparkle, Sparkles, Bell, Wallet, Inbox } from 'lucide-react';
import { Calendar, Clock, ChevronRight } from 'lucide-react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';
import { onAuthStateChanged, User as FirebaseUser, signOut } from "firebase/auth";
import { Link } from 'react-router-dom';
import { useAvatar } from '../AvatarContext';
import { auth } from '../../firebase';

import { useTranslation } from 'react-i18next';

import { db } from '../../firebase';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';

import Helmet from 'react-helmet';

import GradientText from '../GradientText';

import Lyra from '../mockups/Lyra.jpg';

import { ChatBubble } from '../Newcomponents/chat';
import { ChatInterface } from '../Newcomponents/chat';
import { t } from 'i18next';

// Mock data for blog posts
const featuredPost = {
  title: t('article_3_title'),
  excerpt: t('article_3_desc'),
  date: t('article_3_date'),
  readTime: t('article_3_time'),
  image: 'https://i.ibb.co/B57dMgSR/Pics-Art-07-30-07-00-12.jpg'
};

const blogPosts = [
    {
    title: t('article_3_title'),
    excerpt: t('article_3_desc'),
    date: t('article_3_date'),
    readTime: t('article_3_time'),
    link: "/blogs/meauli"
  },
  {
    title: t('spotlight_heading'),
    excerpt: t('spotlight_description'),
    date: t('spotlight_date'),
    readTime: t('spotlight_read_time'),
    link: "lyralabs/lyra-ai"
  },
  {
    title: t('article_1_title'),
    excerpt: t('article_1_desc'),
    date: t('article_1_date'),
    readTime: t('article_1_time'),
    link: "/blogs/best-lang-to-learn-in-2025"
  },
  {
    title: t('article_2_title'),
    excerpt: t('article_2_desc'),
    date: t('article_2_date'),
    readTime: t('article_2_time'),
    link: "/blogs/will-ai-take-our-jobs"
  },
];

// Animation variants for reusability
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const flags = {
  en: (
    <img
      src="https://flagcdn.com/w40/gb.png"
      alt="English"
      className="w-7 h-5 shrink-0 object-cover rounded-sm"
    />
  ),
  es: (
    <img
      src="https://flagcdn.com/w40/es.png"
      alt="Spanish"
      className="w-7 h-1.3 shrink-0 object-cover rounded-sm"
    />
  ),
  fr: (
    <img
      src="https://flagcdn.com/w40/fr.png"
      alt="French"
      className="w-7 h-1.3 shrink-0 object-cover rounded-sm"
    />
  ),
  it: (
    <img
      src="https://flagcdn.com/w40/it.png"
      alt="Italian"
      className="w-7 h-1.3 shrink-0 object-cover rounded-sm"
    />
  ),
  pt: (
    <img
      src="https://flagcdn.com/w40/pt.png"
      alt="Portuguese"
      className="w-7 h-1.3 shrink-0 object-cover rounded-sm"
    />
  ),
  ja: (
    <img
      src="https://flagcdn.com/w40/jp.png"
      alt="Japanese"
      className="w-7 h-1.3 shrink-0 object-cover rounded-sm"
    />
  ),
  zh: (
    <img
      src="https://flagcdn.com/w40/cn.png"
      alt="Chinese"
      className="w-7 h-1.3 shrink-0 object-cover rounded-sm"
    />
  ),
  ko: (
    <img
      src="https://flagcdn.com/w40/kr.png"
      alt="Korean"
      className="w-7 h-1.3 shrink-0 object-cover rounded-sm"
    />
  ),
};



const languages = [
  { code: 'en', label: 'English', flag: flags.en },
  { code: 'es', label: 'Español', flag: flags.es },
  { code: 'fr', label: 'Français', flag: flags.fr },
  { code: 'it', label: 'Italiano', flag: flags.it },
  { code: 'pt', label: 'Português', flag: flags.pt },
  { code: 'ja', label: '日本語', flag: flags.ja },
  { code: 'zh', label: '中文', flag: flags.zh },
  { code: 'ko', label: '한국어', flag: flags.ko },
];




function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState<boolean>(false); // New state for profile dropdown
  const [user, setUser] = useState<FirebaseUser | null>(null); // State for Firebase user
  const { avatarURL } = useAvatar();
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false); // Minimal state for dropdown
  const navigate = useNavigate();

    const { t, i18n } = useTranslation();
      const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
    
      // Sync language with localStorage and i18next on change
      // Sync language with localStorage and i18next on change
      const handleLanguageChange = (lang) => {
        setSelectedLanguage(lang);
        i18n.changeLanguage(lang);
        localStorage.setItem('i18nextLng', lang);
        setIsLangDropdownOpen(false); // Close dropdown after selection
        setIsMenuOpen(false); // Close menu after selection

        window.location.reload();
      };

        // Ensure language is loaded from localStorage on mount
      useEffect(() => {
        const savedLanguage = localStorage.getItem('i18nextLng');
        const defaultLanguage = 'en'; // Default to English
      
        if (savedLanguage && languages.some(lang => lang.code === savedLanguage)) {
          // Use saved language if it exists and is valid
          if (savedLanguage !== i18n.language) {
            i18n.changeLanguage(savedLanguage);
            setSelectedLanguage(savedLanguage);
          }
        } else {
          // Set default to English only if no valid language is found
          i18n.changeLanguage(defaultLanguage);
          setSelectedLanguage(defaultLanguage);
          localStorage.setItem('i18nextLng', defaultLanguage);
        }
      }, [i18n]);

  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        setUser({
          ...currentUser,
          role: userDoc.exists() ? userDoc.data().role : 'user',
        });
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

const [userRole, setUserRole] = useState<string | null>(null);

  // Profile dropdown options
  const profileOptions = [
    { label: t('Profile'), icon: User, action: () => navigate('/profile') },
    { label: t('Admin Panel'), icon: Settings, action: () => navigate("/gmpXRP05issfL14jWssIcxKOREJUNYwMwaS7mbQv69DAZ78N29"), adminOnly: true },
    { label: t('Purchase History'), icon: Wallet, action: () => navigate("/purchase-history") },
    { label: t("Enquiry Listing"), icon: Inbox, action: () => navigate("/enquiries"), adminOnly: true },
    { label: t('Log Out'), icon: LogOut, action: () => signOut(auth).then(() => navigate('/')) },
  ];


    // Listen for auth state changes
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
      });
      return () => unsubscribe();
    }, []);

    useEffect(() => {
    if (!user) return;

      const q = query(
        collection(db, 'notifications'),
        where('recipient', '==', user.uid)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const notifs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Notification[];
        setNotifications(notifs);
      });

      return () => unsubscribe();
    }, [user]);

    const currentLanguage = languages.find((lang) => lang.code === selectedLanguage) || languages.find((lang) => lang.code === 'en');

  return (
    <motion.div
      className="min-h-screen bg-white"
      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <Helmet>
        <title>LonewolfFSD Blogs</title>
        <link rel="canonical" href="https://lonewolffsd.in/blogs" />

      </Helmet>
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
                <a href=""><img alt="logo" src="https://pbs.twimg.com/profile_images/1905319445851246592/KKJ22pIP_400x400.jpg" className='cursor-custom-pointer rounded-full' style={{
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
                {user && (
        <Link to="/notifications">
          <motion.button
            aria-label="notifications"
            className={`p-2 rounded-full relative cursor-custom-pointer ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'} transition-colors`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.9 }}
          >
            <Bell fill='currentColor' className="w-5 h-5 opacity-80" />
            {notifications.filter(n => !n.read).length > 0 && (
              <span
                className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center transform translate-x-2 -translate-y-1"
                style={{ minWidth: '1rem' }}
              >
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </motion.button>
        </Link>
      )}
      
      <motion.button
        onClick={() => {
          if (user) {
            setIsProfileDropdownOpen(!isProfileDropdownOpen); // Toggle dropdown for logged-in users
          } else {
            navigate("/auth"); // Navigate to auth for guests
          }
        }}
        aria-label="profile"
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
      
                        {/* Dropdown for logged-in users */}
                        {user && isProfileDropdownOpen && (
                                    <motion.div
                                      className={`absolute top-full right-20 z-50 md:right-60 w-60 md:w-60 border border-black/20 mt-[-20px] rounded-2xl shadow-lg z-10 overflow-hidden ${
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
                                        {profileOptions
                                          .filter((option) => !option.adminOnly || (option.adminOnly && user?.role === 'admin'))
                                          .map((option, index) => (
                                            <button
                                              key={index}
                                              onClick={() => {
                                                option.action();
                                                setIsProfileDropdownOpen(false);
                                              }}
                                              className={`w-full cursor-custom-pointer text-left text-[14.3px] px-1.5 hover:px-3 group hover:font-semibold transition-all py-[7px] rounded-lg flex items-center gap-2.5 ${isDark ? 'hover:bg-gray-750' : 'hover:bg-gray-100'}`}
                                            >
                                              <option.icon className="w-4 h-4 opacity-60 bg-white text-gray-950 [stroke-width:2] group-hover:[stroke-width:3]" />
                                              {option.label}
                                            </button>
                                          ))}
                                      </div>
                                    </motion.div>
                                  )}
                <a href="/contact">
                <motion.button
                  aria-label="contact"
                  className={`px-6 hover:px-8 hidden md:block cursor-custom-pointer transition-all py-2 rounded-full font-semibold ${isDark ? 'bg-white text-black hover:bg-gray-100' : 'bg-black text-white hover:bg-gray-900'} flex items-center gap-2`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  {t("Let's Connect")}
                </motion.button>
                </a>
                <motion.button
                  aria-label="Open menu"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={`p-2 cursor-custom-pointer rounded-full border ${isDark ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-100'} transition-colors relative z-10`}
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
                             className={`absolute top-full right-6 w-64 mt-[-20px] border border-black/20 rounded-2xl shadow-lg z-50 transition-all transform origin-top-right ${
                               isDark ? 'bg-gray-800' : 'bg-white'
                             }`}
                             initial={{ opacity: 0, y: -15, scale: 0.95 }}
                             animate={{ opacity: 1, y: 0, scale: 1 }}
                             transition={{ duration: 0.25, ease: 'easeOut' }}
                           >
                             <nav className="p-3">
                               {[
                                 { label: t('About Me'), href: '/about-me' },
                                 { label: t('LonewolfFSD Blogs'), href: '/blogs' },
                                 { label: t('The RepoHub'), href: 'https://github.com/lonewolfFSD?tab=repositories' },
                                 { label: t('FSD DevSync'), href: '/dev-sync' },
                                 { label: t('Wanna Collaborate?'), href: '/lets-collaborate' },
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
                               <div className="px-4 py-3 relative">
                                 <button
                                   className={`w-full px-3 py-2.5 text-[15px] font-semibold rounded-md border border-black/20 text-left flex items-center ${
                                     isDark ? 'bg-gray-700 text-white' : 'bg-white text-black'
                                   }`}
                                   onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                                 >
                                   <span className="border border-gray-300 rounded-md mr-2">{currentLanguage.flag}</span>
                                   {currentLanguage.label}
                                 </button>
                                 {isLangDropdownOpen && (
                                   <motion.ul
                                     className={`absolute top-full left-4 z-10 w-full border border-black/40 rounded-lg shadow-lg ${
                                       isDark ? 'bg-gray-800' : 'bg-white'
                                     }`}
                                     initial={{ opacity: 0, y: -10 }}
                                     animate={{ opacity: 1, y: 0 }}
                                     transition={{ duration: 0.2 }}
                                   >
                                     {languages.map((lang) => (
                                       <li
                                         key={lang.code}
                                         className="px-3 py-2.5 border-b text-[15px] font-semibold cursor-pointer hover:bg-gray-100 flex items-center"
                                         onClick={() => handleLanguageChange(lang.code)}
                                       >
                                         <span className='border border-gray-300 rounded-md mr-2'>{lang.flag}</span>
                                         {lang.label}
                                       </li>
                                     ))}
                                   </motion.ul>
                                 )}
                               </div>
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
            </motion.header>

        
      {/* Featured Post Hero Section */}
      <motion.div
        className="sm:max-w-2xl md:max-w-3xl lg:max-w-7xl mx-auto -mt-10 md:mt-0  px-5 sm:px-6 lg:px-8 py-16"
        variants={fadeIn}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <motion.h2
          className="text-3xl font-bold mb-6"
          variants={fadeIn}
          transition={{ duration: 0.5 }}
        >
        <GradientText
          className="font-bold text-left text-3xl lg:text-4xl"
          colors={["#a855f7", "#ec4899", "#f97316", "#CA1551"]}
          animationSpeed={6}
          showBorder={false}
        >
        {t('spotlight_title')}
        </GradientText>
                </motion.h2>

                <motion.div
          className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 bg-gray-50 rounded-2xl p-6 lg:p-14"
          variants={staggerContainer}
        >
          {/* Pseudo-element for gradient border */}
          <div className="absolute inset-0 rounded-2xl p-[3px] bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500">
            <div className="w-full h-full bg-gray-50 rounded-2xl"></div>
          </div>

          <motion.div className="flex items-center relative z-10" variants={fadeIn}>
            <div>
              <div className='mb-4'>
              <GradientText
                className="font-semibold text-left text-2xl"
                colors={["#a855f7", "#ec4899", "#f97316", "#CA1551"]}
                animationSpeed={6}
                showBorder={false}
              >
              {featuredPost.title}
              </GradientText>
              </div>
              <p className="text-sm mb-6 text-gray-600">{featuredPost.excerpt}</p>
              <div className="flex items-center space-x-6 text-gray-600">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span className="text-xs">{featuredPost.date}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  <span className="text-xs">{featuredPost.readTime}</span>
                </div>
              </div>
              <Link to="/blogs/meauli">
                <button
                  className="mt-6 cursor-custom-pointer group flex items-center justify-center w-full md:w-auto font-semibold text-black border-2 border-black px-14 py-3 rounded-lg hover:bg-black hover:text-white transition-all"
                >
                  <span className='mr-2 group-hover:mr-2.5 duration-300 mt-0.5' style={{
                    fontFamily: 'Poppins'
                  }}>{t('read_more')}</span>
                  <ChevronRight size={17} strokeWidth={3} className=" " />
                </button>
              </Link>
            </div>
          </motion.div>
          <motion.div
            className="order-first lg:order-last flex justify-center relative"
            variants={fadeIn}
          >
            <img
              src={featuredPost.image}
              alt="Featured post"
              style={{
                filter: 'brightness(1.05) contrast(1.1)'
              }}
              className="w-full pointer-events-none max-w-xl border border-black h-[180px] md:h-[300px] lg:h-[320px] object-cover rounded-2xl z-10"
            />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Blog Posts List Section */}
      <motion.div
        className="sm:max-w-2xl md:max-w-3xl lg:max-w-7xl mx-auto mt-10 px-4 sm:px-6 lg:px-8 pb-16"
        variants={fadeIn}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <motion.h2
          className="text-3xl font-bold mb-10"
          style={{ fontFamily: 'Poppins' }}
          variants={fadeIn}
          transition={{ duration: 0.5 }}
        >
          {t('other_articles')}
        </motion.h2>
        <motion.div
          className="grid gap-12"
          variants={staggerContainer}
        >
          {blogPosts.map((post, index) => (
            <motion.article
              key={index}
              className="border-b border-gray-200 pb-12 last:border-b-0"
              variants={fadeIn}
              transition={{ duration: 0.5 }}
            >
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{post.date}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
                <Link to={post.link} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <h3 className="text-2xl  font-bold hover:text-gray-600 cursor-custom-pointer">
                  {post.title}
                </h3>
                </Link>
                <p className="text-gray-600 text-sm">{post.excerpt}</p>
                <Link to={post.link} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <button className="flex cursor-custom-pointer group items-center text-black text-sm hover:underline transition-all duration-300 w-fit">
                  {t('read_more')}
                  <ChevronRight className="ml-2 w-4 h-4 transition-all duration-300 group-hover:ml-3" />
                </button>


                </Link>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </motion.div>

      < ChatBubble />
      < ChatInterface />
    </motion.div>
  );
}

export default App;
