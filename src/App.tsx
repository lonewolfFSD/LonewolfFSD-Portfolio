import React, { useState, useRef, useEffect, CSSProperties } from 'react';
import { Menu, ArrowRight, Settings, LogOut, Moon, Sun, Server, Database, Shield, Briefcase, Code, Palette, Send, X, Github, Linkedin, Twitter, Instagram, ArrowDown, ArrowDown01, ArrowDownIcon, ChevronDown, Mail, User, Bell, Scale, Contact, Wallet, Inbox } from 'lucide-react';
import { motion, transform } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { onAuthStateChanged, User as FirebaseUser, signOut } from "firebase/auth";
import { useMediaQuery } from "react-responsive";
import ContactUs from './ContactUs';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { auth } from '../firebase';
import MaintenanceOverlay from './MaintainanceOverlay';
import 'flag-icons/css/flag-icons.min.css';

import Spline from '@splinetool/react-spline';
import TestimonialCarousel from './Components/TestimonialCarousel';
import About from './About';
import ClickSpark from './ClickSpark';
import CircularGallery from './CircularGallery';
import ScrollVelocity from './ScrollVelocity';
import FAQSection from './FAQ/FAQSection';
import { faqData } from './FAQ/data/faqData';

import CookieConsent from './CookieConesent';

import PrivacyPolicy from './Policies/PrivacyPolicy';

import Crosshair from './Crosshair';

import { DotPatternWithGlowEffectDemo } from './DotPattern';

import { ScaleLoader } from "react-spinners";

import LyraBlog from './Blogs/pages/LyraBlog';
import { useTranslation } from 'react-i18next';
import '../i18n'; // Import i18n configuration

import BlogPage from './Blogs/BlogPage';
import AuthPage from './Auth';
import CheckYourEmail from './CheckYourEmail';
import ForgotPassword from './ForgotPassword';
import Profile from './Profile';
import { useAvatar } from './AvatarContext';
import AIBlog from './Blogs/pages/AIBlog';
import Lang from './Blogs/pages/Lang';
import HeroSection from './Components/HeroSection';
import AdminPanel from './AdminPanel';
import MaintainancePricing from './MaintainacePricing';

import { ToastContainer } from 'react-toastify';
import { showOfflineToast, dismissOfflineToast } from './toast';
import UserDataPage from './UserData';

import { ChatBubble, ChatInterface } from './Newcomponents/chat';
import NotificationPage from './NotificationPage';
import NotFound from './NotFound';
import Projects from './Projects';
import ModernCalendar from './ModernCalendar';
import Callback from './Callback';
import PurchaseHistory from './PurchaseHistory';
import Enquiries from './Enquiries';
import Testimonials from './Testimonials';
import ClientReview from './ClientReview';

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "black",
  
};

function App() {
  const [isDark, setIsDark] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState<boolean>(false); // New state for profile dropdown
  const [user, setUser] = useState<FirebaseUser | null>(null); // State for Firebase user
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { avatarURL } = useAvatar();
  const navigate = useNavigate();
    const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false); // Minimal state for dropdown

  const containerRef = useRef(null);

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

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000); // fake 2 sec load
    return () => clearTimeout(timer);
  }, []);

  let [loading, setLoading] = useState(true);
  let [color, setColor] = useState("#ffffff");

  useEffect(() => {
    const handleOffline = () => showOfflineToast();
    const handleOnline = () => dismissOfflineToast();

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    // Show toast immediately if already offline on load
    if (!navigator.onLine) showOfflineToast();

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  // Listen for auth state changes
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

const skills = [
  {
    name: 'skill.JavaScript.name',
    description: 'skill.JavaScript.description',
    icon: 'fa-brands fa-js-square',
    downloadLink: 'https://www.geeksforgeeks.org/javascript/',
    percentage: 97.5,
    category: 'programming'
  },
  {
    name: 'skill.React.name',
    description: 'skill.React.description',
    icon: 'fa-brands fa-react',
    downloadLink: 'https://react.dev/learn',
    percentage: 93,
    category: 'frontend'
  },
  {
    name: 'skill.Node.js.name',
    description: 'skill.Node.js.description',
    icon: 'fa-brands fa-node',
    downloadLink: 'https://nodejs.org/en/learn/getting-started/introduction-to-nodejs',
    percentage: 78,
    category: 'backend'
  },
  {
    name: 'skill.HTML.name',
    description: 'skill.HTML.description',
    icon: 'fa-brands fa-html5',
    downloadLink: 'https://www.w3schools.com/html/',
    percentage: 99.5,
    category: 'frontend'
  },
  {
    name: 'skill.CSS.name',
    description: 'skill.CSS.description',
    icon: 'fa-brands fa-css3-alt',
    downloadLink: 'https://www.w3schools.com/css/',
    percentage: 97.8,
    category: 'frontend'
  },
  {
    name: 'skill.PHP.name',
    description: 'skill.PHP.description',
    icon: 'fa-brands fa-php',
    downloadLink: 'https://www.geeksforgeeks.org/php-tutorial/',
    percentage: 97,
    category: 'backend'
  },
  {
    name: 'skill.MySQL.name',
    description: 'skill.MySQL.description',
    icon: 'fa-solid fa-database',
    downloadLink: 'https://www.w3schools.com/MySQL/default.asp',
    percentage: 96,
    category: 'database'
  },
  {
    name: 'skill.MongoDB.name',
    description: 'skill.MongoDB.description',
    icon: 'fa-solid fa-leaf',
    downloadLink: 'https://www.mongodb.com/docs/',
    percentage: 96,
    category: 'database'
  },
  {
    name: 'skill.Supabase.name',
    description: 'skill.Supabase.description',
    icon: 'fa-solid fa-bolt',
    downloadLink: 'https://supabase.com/docs',
    percentage: 95,
    category: 'database'
  },
  {
    name: 'skill.Firebase.name',
    description: 'skill.Firebase.description',
    icon: 'fa-solid fa-fire',
    downloadLink: 'https://firebase.google.com/docs',
    percentage: 98,
    category: 'database'
  },
  {
    name: 'skill.Tailwind CSS.name',
    description: 'skill.Tailwind CSS.description',
    icon: 'fa-solid fa-globe',
    downloadLink: 'https://tailwindcss.com/docs/installation/using-vite',
    percentage: 95,
    category: 'tools'
  },
  {
    name: 'skill.Vercel.name',
    description: 'skill.Vercel.description',
    icon: 'fa-solid fa-play',
    downloadLink: 'https://vercel.com/docs',
    percentage: 95,
    category: 'tools'
  },
  {
    name: 'skill.Vite.name',
    description: 'skill.Vite.description',
    icon: 'fa-brands fa-vuejs',
    downloadLink: 'https://vite.dev/guide/',
    percentage: 80,
    category: 'tools'
  },
  {
    name: 'skill.Bootstrap.name',
    description: 'skill.Bootstrap.description',
    icon: 'fa-brands fa-bootstrap',
    downloadLink: 'https://getbootstrap.com/docs/5.3/getting-started/introduction/',
    percentage: 95,
    category: 'tools'
  },
  {
    name: 'skill.Figma.name',
    description: 'skill.Figma.description',
    icon: 'fa-brands fa-figma',
    downloadLink: 'https://help.figma.com/hc/en-us/categories/360002051613-Get-started',
    percentage: 62.8,
    category: 'tools'
  },
  {
    name: 'skill.TypeScript.name',
    description: 'skill.TypeScript.description',
    icon: 'fa-solid fa-code',
    downloadLink: 'https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html',
    percentage: 96.7,
    category: 'frontend'
  },
  {
    name: 'skill.Next.js.name',
    description: 'skill.Next.js.description',
    icon: 'fa-solid fa-forward',
    downloadLink: 'https://nextjs.org/docs',
    percentage: 70,
    category: 'frontend'
  },
  {
    name: 'skill.Express.js.name',
    description: 'skill.Express.js.description',
    icon: 'fa-brands fa-js',
    downloadLink: 'https://expressjs.com/en/starter/installing.html',
    percentage: 96,
    category: 'backend'
  },
  {
    name: 'skill.Git.name',
    description: 'skill.Git.description',
    icon: 'fa-brands fa-git-alt',
    downloadLink: 'https://git-scm.com/doc',
    percentage: 85,
    category: 'tools'
  },
  {
    name: 'skill.AWS.name',
    description: 'skill.AWS.description',
    icon: 'fa-brands fa-aws',
    downloadLink: 'https://aws.amazon.com/getting-started/',
    percentage: 85,
    category: 'tools'
  },
  {
    name: 'skill.Python.name',
    description: 'skill.Python.description',
    icon: 'fa-brands fa-python',
    downloadLink: 'https://www.python.org/doc/',
    percentage: 90,
    category: 'programming'
  },
  {
    name: 'skill.Django.name',
    description: 'skill.Django.description',
    icon: 'fa-brands fa-python',
    downloadLink: 'https://docs.djangoproject.com/en/stable/',
    percentage: 85,
    category: 'backend'
  },
  {
    name: 'skill.GraphQL.name',
    description: 'skill.GraphQL.description',
    icon: 'fa-solid fa-diagram-project',
    downloadLink: 'https://graphql.org/learn/',
    percentage: 80,
    category: 'backend'
  },
  {
    name: 'skill.Vue.js.name',
    description: 'skill.Vue.js.description',
    icon: 'fa-brands fa-vuejs',
    downloadLink: 'https://vuejs.org/guide/introduction.html',
    percentage: 75,
    category: 'frontend'
  },
  {
    name: 'skill.Svelte.name',
    description: 'skill.Svelte.description',
    icon: 'fa-solid fa-code',
    downloadLink: 'https://svelte.dev/docs',
    percentage: 70,
    category: 'frontend'
  },
  {
    name: 'skill.PostgreSQL.name',
    description: 'skill.PostgreSQL.description',
    icon: 'fa-solid fa-database',
    downloadLink: 'https://www.postgresql.org/docs/',
    percentage: 90,
    category: 'database'
  },
  {
    name: 'skill.Docker.name',
    description: 'skill.Docker.description',
    icon: 'fa-brands fa-docker',
    downloadLink: 'https://docs.docker.com/get-started/',
    percentage: 85,
    category: 'tools'
  },
  {
    name: 'skill.Terraform.name',
    description: 'skill.Terraform.description',
    icon: 'fa-solid fa-cloud',
    downloadLink: 'https://www.terraform.io/docs',
    percentage: 80,
    category: 'tools'
  },
  {
    name: 'skill.Google Cloud Platform.name',
    description: 'skill.Google Cloud Platform.description',
    icon: 'fa-brands fa-google',
    downloadLink: 'https://cloud.google.com/docs',
    percentage: 85,
    category: 'tools'
  },
  {
    name: 'skill.React Native.name',
    description: 'skill.React Native.description',
    icon: 'fa-brands fa-react',
    downloadLink: 'https://reactnative.dev/docs/getting-started',
    percentage: 70,
    category: 'mobile'
  },
  {
    name: 'skill.Flutter.name',
    description: 'skill.Flutter.description',
    icon: 'fa-solid fa-mobile',
    downloadLink: 'https://docs.flutter.dev/get-started/install',
    percentage: 65,
    category: 'mobile'
  },
  {
    name: 'skill.TensorFlow.name',
    description: 'skill.TensorFlow.description',
    icon: 'fa-solid fa-brain',
    downloadLink: 'https://www.tensorflow.org/learn',
    percentage: 70,
    category: 'ai-ml'
  },
  {
    name: 'skill.Go.name',
    description: 'skill.Go.description',
    icon: 'fa-solid fa-code',
    downloadLink: 'https://go.dev/doc/',
    percentage: 75,
    category: 'programming'
  },
  {
    name: 'skill.Rust.name',
    description: 'skill.Rust.description',
    icon: 'fa-solid fa-gears',
    downloadLink: 'https://www.rust-lang.org/learn',
    percentage: 70,
    category: 'programming'
  },
];

  const skillVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };
  
  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }, // Delays each child animation
    },
  };

  

  const filteredSkills = selectedCategory === 'all'
    ? skills
    : skills.filter(skill => skill.category === selectedCategory);
    
  const visibleSkills = showMore ? filteredSkills : filteredSkills.slice(0, 6);

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Profile dropdown options
  const profileOptions = [
    { label: t('Profile'), icon: User, action: () => navigate('/profile') },
    { label: t('Admin Panel'), icon: Settings, action: () => navigate("/gmpXRP05issfL14jWssIcxKOREJUNYwMwaS7mbQv69DAZ78N29"), adminOnly: true },
    { label: t('Purchase History'), icon: Wallet, action: () => navigate("/purchase-history") },
    { label: t("Enquiry Listing"), icon: Inbox, action: () => navigate("/enquiries"), adminOnly: true },
    { label: t('Log Out'), icon: LogOut, action: () => signOut(auth).then(() => navigate('/')) },
  ];

  const isMobile = useMediaQuery({ query: "(max-width: 640px)" });


  useEffect(() => {
    // Delay the first toast by 1 second
    setTimeout(() => {
      if (!navigator.onLine) showOfflineToast("No connection found", {
        position: "bottom-left",
        toastId: "toast-1",
      });
    }, 1000);
  
    // Second toast after 2 seconds (1s + 1s)
    setTimeout(() => {
      if (!navigator.onLine) showOfflineToast("No connection found", {
        position: "bottom-left",
        toastId: "toast-2",
      });
    }, 1500);
  }, []);

  const randomRotate = Math.floor(Math.random() * 5) - 2; // random from -2 to 2
  const currentLanguage = languages.find((lang) => lang.code === selectedLanguage) || languages.find((lang) => lang.code === 'en');
  

  return (
      <Routes>
      <Route path="/blogs" element={<BlogPage />} />
      <Route path="/maintainance-pricing" element={<MaintainancePricing />} />
      <Route path="/auth" element={<AuthPage isDark={isDark} />} />
      <Route path="/check-email" element={<CheckYourEmail isDark={isDark} />} />
      <Route path="/forgot-password" element={<ForgotPassword isDark={isDark} />} /> {/* New route */}
      <Route path="/blogs/lyralabs/lyra-ai" element={<LyraBlog />} /> {/* New route */}
      <Route path="/client-portal" element={<UserDataPage />} />
      <Route path="/blogs/will-ai-take-our-jobs" element={<AIBlog />} /> {/* New route */}
      <Route path="/blogs/best-lang-to-learn-in-2025" element={<Lang />} /> {/* New route */}
      <Route path="/lets-collaborate" element={<HeroSection />} /> {/* New route */}
      <Route path="/about-me" element={<About />} /> {/* New route */}
      <Route path="/profile" element={<Profile isDark={isDark} />} />
      <Route path="/dev-sync" element={<ModernCalendar />} />
      <Route path="/callback" element={<Callback />} />
      <Route path="/enquiries" element={<Enquiries />} />
      <Route path="/notifications" element={<NotificationPage />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/profile/:uid" element={<Profile isDark={false} />} />
      <Route path="/profile" element={<Profile isDark={false} />} />
      <Route path="*" element={<NotFound />} />
      
      <Route path="/purchase-history" element={<PurchaseHistory />} />
      <Route path="/gmpXRP05issfL14jWssIcxKOREJUNYwMwaS7mbQv69DAZ78N29" element={<AdminPanel isDark={isDark} user={user} />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/client-review" element={<ClientReview />} />
        <Route
          path="/"
          
          element={
            <>
    <div ref={containerRef} className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
    {loading ? (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
          <ScaleLoader color="#000000" />
        </div>
      ) : (

        
        
        <ClickSpark
      sparkColor='#000'
      sparkSize={10}
      sparkRadius={15}
      sparkCount={8}
      duration={400}
      >
      <MaintenanceOverlay />

      <CookieConsent />

      {/* Particles Background */}
      <div className="absolute inset-0 z-50 pointer-events-none">
  <div className="relative h-[800px] w-full overflow-hidden ">
    <DotPatternWithGlowEffectDemo />
  </div>
  <div className="z-[9999] pointer-events-none hidden md:block">
  <Crosshair containerRef={containerRef} color="#000000" />
</div>

</div>

      
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
                                                    className={`absolute top-full right-20 md:right-60 w-60 md:w-60 border border-black/20 mt-[-20px] rounded-2xl shadow-lg z-50 overflow-hidden ${
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

      {/* Main Content */}
      <main className="container mx-auto px-6 mt-6 lg:mt-16 z-50">
        <Spline scene="https://prod.spline.design/pb7UhbKVN30j962d/scene.splinecode" className="hidden lg:block" />
        <div className="max-w-4xl lg:mt-[-45%] xl:mt-[-49%]">
          {/* Animated Paragraph */}
          <motion.p
            className="text-lg lg:text-xl mb-4 opacity-60 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {t("Hello! I'm LonewolfFSD")}
          </motion.p>

          {/* Animated Heading */}
          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-extrabold lg:font-bold leading-tight mb-8 pointer-events-none"
            style={{ fontFamily: 'Poppins' }} // default (mobile)
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <span
              className="" // override font for md and up
            >
              {t("Building digital experiences with focus on")}
            </span>{' '}
            <span className="opacity-50">{t('innovation')}</span>
          </motion.h1>

          {/* Animated Button and Paragraph */}
          <motion.div
            className="flex flex-col md:flex-row md:justify-between md:items-start gap-8 md:gap-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            <Link to="/contact">
            <motion.button
            className={`px-8 py-4 hover:px-10 md:hidden duration-300 cursor-custom-pointer w-60 lg:w-auto text-sm rounded-full transition-all z-10 bg-black text-white hover:bg-white hover:text-black border-2 border-black group hover:border-black ${isDark ? 'bg-white text-black hover:bg-gray-100' : ''} flex items-center gap-2`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            style={{
              fontFamily: 'Poppins, sans-serif'
            }}
            
          >
            {t("Let's Connect")} <ArrowRight className="w-5 h-5 transition-all duration-500 group-hover:ml-1" />
          </motion.button>
              </Link>
{/** Wrapper div handles visibility, not motion.button itself */}
<div className="hidden md:block">
  <motion.button
    className={`px-8 py-4 hover:px-10 duration-300 cursor-custom-pointer w-60 lg:w-auto text-sm rounded-full transition-all z-10 bg-black text-white hover:bg-white hover:text-black border-2 border-black group hover:border-black ${isDark ? 'bg-white text-black hover:bg-gray-100' : ''} flex items-center gap-2`}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.6, duration: 0.8 }}
    style={{
      fontFamily: 'Poppins, sans-serif'
    }}
    onClick={() => window.location.href = '#projects'}
  >
    <span className="leading-none">{t('View Projects')}</span>
    <ArrowRight className="w-5 h-5 transition-all duration-500 group-hover:ml-1 align-middle" />
  </motion.button>
</div>




            <motion.p
              className="opacity-60 ml-28 max-w-xs sm:ml-auto text-right pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              {t('A full-stack developer crafting innovative solutions through clean code and intuitive design')}
            </motion.p>
          </motion.div>
        </div>

        {/* Skills Section */}
        <section className="mt-32 lg:mt-60" id="skills" style={{ fontFamily: 'Poppins' }}>
<h2 className="text-3xl font-semibold mb-12">{t('Programming Skills')}</h2>

      {/* Dropdown Menu */}
      <div className="relative w-52 md:w-64 mb-8">
        <select
          aria-label={t('Choose a skill topic')}
          className={`${isDark ? 'bg-gray-800 hover:bg-gray-750' : 'bg-gray-100 hover:bg-gray-200'} 
            w-full cursor-custom-pointer px-8 py-3 rounded-xl text-left cursor-pointer shadow-md outline-none transition duration-200 appearance-none`}
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setShowMore(false);
          }}
        >
          <option value="all" className="hover:bg-black p-2">{t('All Prog Skills')}</option>
          <option value="programming" className="hover:bg-black p-2">{t('Basic Prog')}</option>
          <option value="frontend" className="hover:bg-black p-2">{t('Frontend Prog')}</option>
          <option value="backend" className="hover:bg-black p-2">{t('Backend Prog')}</option>
          <option value="database" className="hover:bg-black p-2">{t('Database')}</option>
          <option value="tools" className="hover:bg-black p-2">{t('Tools')}</option>
          <option value="mobile" className="hover:bg-black p-2">{t('Mobile')}</option>
          <option value="ai-ml" className="hover:bg-black p-2">{t('AI-ML')}</option>
        </select>

        {/* Custom Dropdown Arrow */}
        <div className={`${isDark ? 'text-gray-200' : 'text-gray-800'} absolute inset-y-0 right-4 flex items-center pointer-events-none`}>
          <ChevronDown />
        </div>
      </div>

      <motion.div
        className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
        {...(!isMobile && {
          variants: containerVariants,
          initial: "hidden",
          whileInView: "visible",
          viewport: { once: false, amount: 0.2 },
        })}
        key={visibleSkills.length}
      >
        {visibleSkills.map((skill, index) => (
          <motion.div
            key={index}
            className={`${
              isDark ? 'bg-gray-800 hover:bg-gray-750' : 'bg-gray-100 hover:bg-gray-200'
            } rounded-2xl shadow-lg p-8 w-full xl:w-[390px]`}
            {...(!isMobile && {
              whileHover: { scale: 1.02, rotate: randomRotate },
              variants: skillVariants,
            })}
          >
            <div className="flex items-center space-x-4 mb-4">
              <i className={`${skill.icon} text-3xl`} />
              <h3 className="text-xl font-semibold" style={{ fontFamily: 'Poppins, serif' }}>
                {t(skill.name)}
              </h3>
            </div>
            <p
              className="text-sm sm:text-[15px] opacity-60"
              style={{ fontFamily: 'Rubik, sans-serif' }}
            >
              {t(skill.description)}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Show More Button */}
      <button
        onClick={() => setShowMore(!showMore)}
        className="mt-14 cursor-custom-pointer p-1 font-medium mx-auto block border-b border-b-4"
        style={{ fontWeight: '500' }}
      >
        {t(showMore ? 'Show Less' : 'Show More')}
      </button>
          
  </section>
          <span id='projects' />
          <h2 
            className="text-3xl font-semibold -mb-4 mt-36" 
            style={{
              fontFamily: 'Poppins'
            }}
            title="Stuff I built with my own two hands... and maybe a bit of crying. Okay fine, they're just projects. Happy now?"
          >
            {t("A Beautiful Mess of Projects")}
          </h2>

          <Projects />

          <section className='mt-12 md:mt-32'>
            <h2 className="text-3xl font-semibold mb-12" style={{
              fontFamily: 'Poppins'
            }}>{t ("Here's What Others Say")}</h2>
            <Testimonials />
          </section>

          <div className='z-10'>
          <FAQSection 
            title="Frequently Asked Questions" 
            subtitle="In a creative workplace, employees with responsibly try different solutions" 
            items={faqData}
            contactLink="Contact support"
          />
          </div>
        <footer className="p-8 mt-28 lg:mt-0 border-t flex flex-col md:flex-row items-center justify-between text-sm">
          {/* Left: Brand Name */}
          <a href=""><img alt="logo" src="https://pbs.twimg.com/profile_images/1905319445851246592/KKJ22pIP_400x400.jpg" className='mb-5 cursor-custom-pointer md:mb-0 md:mt-[-10px] w-[56px] md:w-[46px]' style={{
             height: 'auto'
          }}/></a>

          {/* Center: All Rights Reserved */}
          <p className="opacity-60 text-left md:absolute left-1/2 transform md:-translate-x-1/2 md:static sm:mb-4 mb-6 md:mb-0">
            {t("© 2025 LonewolfFSD. All rights reserved.")}
          </p>

          {/* Right: Policies */}
          <div className="flex md:flex-row text-black gap-3 opacity-60 font-medium text-xs text-center md:text-right" style={{
            fontFamily: 'Poppins'
          }}>
          <Link
            to="/privacy-policy"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="hover:underline cursor-custom-pointer mb-0 md:mb-0 mr-3"
          >
            {t("Cookie Policy")}
          </Link>
          
          <Link
            to="/privacy-policy"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="hover:underline cursor-custom-pointer mb-0 md:mb-0"
          >
            {t("Privacy Policy")}
          </Link>
          
          </div>
        </footer>
      </main>

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
      </ClickSpark>
      )}
    </div>
    </>
          }
        />
      </Routes>
  );
}

export default App;
