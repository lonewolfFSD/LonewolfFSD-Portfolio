import React, { useState, useRef, useEffect, CSSProperties } from 'react';
import { Menu, ArrowRight, Settings, LogOut, Moon, Sun, Server, Database, Shield, Briefcase, Code, Palette, Send, X, Github, Linkedin, Twitter, Instagram, ArrowDown, ArrowDown01, ArrowDownIcon, ChevronDown, Mail, User, Bell, Scale } from 'lucide-react';
import { motion, transform } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { onAuthStateChanged, User as FirebaseUser, signOut } from "firebase/auth";
import { useMediaQuery } from "react-responsive";
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { auth } from '../firebase';
import MaintenanceOverlay from './MaintainanceOverlay';

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

import { ToastContainer } from 'react-toastify';
import { showOfflineToast, dismissOfflineToast } from './toast';
import UserDataPage from './UserData';

import { ChatBubble, ChatInterface } from './Newcomponents/chat';
import NotificationPage from './NotificationPage';
import NotFound from './NotFound';
import Projects from './Projects';

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

  const containerRef = useRef(null);

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

  const skills = [
    {
      name: 'JavaScript',
      icon: 'fa-brands fa-js-square',
      description: 'I leverage JavaScript to develop dynamic and interactive web applications, handling both front-end and back-end logic with frameworks like Node.js and libraries like React.',
      downloadLink: 'https://www.geeksforgeeks.org/javascript/',
      percentage: 97.5,
      category: 'programming'
    },
    {
      name: 'React',
      icon: 'fa-brands fa-react',
      description: 'I build modern single-page applications using React, utilizing hooks, context API, and state management libraries like Redux for scalable and maintainable codebases.',
      downloadLink: 'https://react.dev/learn',
      percentage: 93,
      category: 'frontend'
    },
    {
      name: 'Node.js',
      icon: 'fa-brands fa-node',
      description: 'I create scalable server-side applications and RESTful APIs with Node.js, integrating with databases like MongoDB and utilizing middleware for enhanced functionality.',
      downloadLink: 'https://nodejs.org/en/learn/getting-started/introduction-to-nodejs',
      percentage: 78,
      category: 'backend'
    },
    {
      name: 'HTML',
      icon: 'fa-brands fa-html5',
      description: 'I craft well-structured, semantic, and accessible web pages using HTML, ensuring optimal performance and compatibility across various browsers and devices.',
      downloadLink: 'https://www.w3schools.com/html/',
      percentage: 99.5,
      category: 'frontend'
    },
    {
      name: 'CSS',
      icon: 'fa-brands fa-css3-alt',
      description: 'I design responsive, visually appealing, and cross-browser compatible web interfaces using CSS, incorporating animations and modern layout techniques like Flexbox and Grid.',
      downloadLink: 'https://www.w3schools.com/css/',
      percentage: 97.8,
      category: 'frontend'
    },
    {
      name: 'PHP',
      icon: 'fa-brands fa-php',
      description: 'I utilize PHP for server-side scripting, building dynamic web applications and integrating with databases to create robust backends for content management systems.',
      downloadLink: 'https://www.geeksforgeeks.org/php-tutorial/',
      percentage: 97,
      category: 'backend'
    },
    {
      name: 'MySQL',
      icon: 'fa-solid fa-database',
      description: 'I manage and optimize relational databases with MySQL, designing efficient schemas and writing complex queries to ensure fast data retrieval and storage.',
      downloadLink: 'https://www.w3schools.com/MySQL/default.asp',
      percentage: 96,
      category: 'database'
    },
    {
      name: 'MongoDB',
      icon: 'fa-solid fa-leaf',
      description: 'I work with MongoDB to manage NoSQL databases, designing flexible schemas and leveraging its scalability for handling large datasets in web applications.',
      downloadLink: 'https://www.mongodb.com/docs/',
      percentage: 96,
      category: 'database'
    },
    {
      name: 'Supabase',
      icon: 'fa-solid fa-bolt',
      description: 'I use Supabase as an open-source Firebase alternative, managing authentication, real-time databases, and serverless functions to build scalable and secure applications.',
      downloadLink: 'https://supabase.com/docs',
      percentage: 95,
      category: 'database'
    },
    {
      name: 'Firebase',
      icon: 'fa-solid fa-fire',
      description: 'I utilize Firebase for backend services, including Firestore for NoSQL databases, real-time data syncing, user authentication, and cloud functions for serverless logic.',
      downloadLink: 'https://firebase.google.com/docs',
      percentage: 98,
      category: 'database'
    },    
    {
      name: 'Tailwind CSS',
      icon: 'fa-solid fa-globe',
      description: 'I employ Tailwind CSS to create highly customizable, utility-first designs, enabling rapid development of responsive and aesthetically pleasing web interfaces.',
      downloadLink: 'https://tailwindcss.com/docs/installation/using-vite',
      percentage: 95,
      category: 'tools'
    },
    {
      name: 'Vercel',
      icon: 'fa-solid fa-play',
      description: 'I deploy and manage web applications using Vercel, leveraging its serverless architecture and seamless integration with Next.js for optimized performance.',
      downloadLink: 'https://vercel.com/docs',
      percentage: 95,
      category: 'tools'
    },
    {
      name: 'Vite',
      icon: 'fa-brands fa-vuejs',
      description: 'I use Vite as a modern build tool for fast development, leveraging its hot module replacement and optimized production builds for efficient workflows.',
      downloadLink: 'https://vite.dev/guide/',
      percentage: 80,
      category: 'tools'
    },
    {
      name: 'Bootstrap',
      icon: 'fa-brands fa-bootstrap',
      description: 'I develop responsive, mobile-first websites using Bootstrap, utilizing its pre-built components and grid system to streamline front-end development.',
      downloadLink: 'https://getbootstrap.com/docs/5.3/getting-started/introduction/',
      percentage: 95,
      category: 'tools'
    },
    {
      name: 'Figma',
      icon: 'fa-brands fa-figma',
      description: 'I design intuitive UI/UX prototypes and collaborate with teams using Figma, creating clean, modern, and user-centered designs for web and mobile applications.',
      downloadLink: 'https://help.figma.com/hc/en-us/categories/360002051613-Get-started',
      percentage: 62.8,
      category: 'tools'
    },
    {
      name: 'TypeScript',
      icon: 'fa-solid fa-code',
      description: 'I enhance JavaScript projects with TypeScript, adding static typing to improve code reliability, maintainability, and developer experience in large-scale applications.',
      downloadLink: 'https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html',
      percentage: 96.7,
      category: 'frontend'
    },
    {
      name: 'Next.js',
      icon: 'fa-solid fa-forward',
      description: 'I build server-rendered React applications with Next.js, optimizing for SEO, performance, and scalability using features like static site generation and API routes.',
      downloadLink: 'https://nextjs.org/docs',
      percentage: 70,
      category: 'frontend'
    },
    {
      name: 'Express.js',
      icon: 'fa-brands fa-js',
      description: 'I develop robust server-side applications and APIs with Express.js, integrating middleware and routing to create efficient and scalable backend systems.',
      downloadLink: 'https://expressjs.com/en/starter/installing.html',
      percentage: 96,
      category: 'backend'
    },
    {
      name: 'Git',
      icon: 'fa-brands fa-git-alt',
      description: 'I manage version control with Git, collaborating with teams, resolving conflicts, and maintaining organized project histories for efficient development workflows.',
      downloadLink: 'https://git-scm.com/doc',
      percentage: 85,
      category: 'tools'
    },
    {
      name: 'AWS',
      icon: 'fa-brands fa-aws',
      description: 'I deploy and manage cloud-based applications using AWS, utilizing services like EC2, S3, and Lambda to ensure scalability, security, and reliability.',
      downloadLink: 'https://aws.amazon.com/getting-started/',
      percentage: 85,
      category: 'tools'
    },
    {
    name: 'Python',
    icon: 'fa-brands fa-python',
    description: 'I develop versatile applications with Python, leveraging its simplicity for web development, data analysis, automation, and machine learning projects with frameworks like Django and Flask.',
    downloadLink: 'https://www.python.org/doc/',
    percentage: 90,
    category: 'programming'
  },
  {
    name: 'Django',
    icon: 'fa-brands fa-python',
    description: 'I build secure and scalable web applications using Django, utilizing its robust ORM, authentication systems, and admin interface to streamline backend development.',
    downloadLink: 'https://docs.djangoproject.com/en/stable/',
    percentage: 85,
    category: 'backend'
  },
  {
    name: 'GraphQL',
    icon: 'fa-solid fa-diagram-project',
    description: 'I create efficient and flexible APIs with GraphQL, enabling precise data fetching and reducing over- or under-fetching issues in modern web applications.',
    downloadLink: 'https://graphql.org/learn/',
    percentage: 80,
    category: 'backend'
  },
  {
    name: 'Vue.js',
    icon: 'fa-brands fa-vuejs',
    description: 'I develop lightweight and reactive front-end applications with Vue.js, leveraging its simplicity and composition API for building dynamic user interfaces.',
    downloadLink: 'https://vuejs.org/guide/introduction.html',
    percentage: 75,
    category: 'frontend'
  },
  {
    name: 'Svelte',
    icon: 'fa-solid fa-code',
    description: 'I build performant and intuitive web applications with Svelte, utilizing its compile-time approach to create fast, reactive, and developer-friendly interfaces.',
    downloadLink: 'https://svelte.dev/docs',
    percentage: 70,
    category: 'frontend'
  },
  {
    name: 'PostgreSQL',
    icon: 'fa-solid fa-database',
    description: 'I manage advanced relational databases with PostgreSQL, optimizing complex queries and leveraging its features for geospatial data and full-text search.',
    downloadLink: 'https://www.postgresql.org/docs/',
    percentage: 90,
    category: 'database'
  },
  {
    name: 'Docker',
    icon: 'fa-brands fa-docker',
    description: 'I containerize applications with Docker, ensuring consistent environments across development, testing, and production for seamless deployment workflows.',
    downloadLink: 'https://docs.docker.com/get-started/',
    percentage: 85,
    category: 'tools'
  },
  {
    name: 'Terraform',
    icon: 'fa-solid fa-cloud',
    description: 'I manage infrastructure as code with Terraform, provisioning and scaling cloud resources across providers like AWS and GCP for reliable deployments.',
    downloadLink: 'https://www.terraform.io/docs',
    percentage: 80,
    category: 'tools'
  },
  {
    name: 'Google Cloud Platform',
    icon: 'fa-brands fa-google',
    description: 'I deploy and manage applications on Google Cloud Platform, utilizing services like Compute Engine, Cloud Functions, and BigQuery for scalable solutions.',
    downloadLink: 'https://cloud.google.com/docs',
    percentage: 85,
    category: 'tools'
  },
  {
    name: 'React Native',
    icon: 'fa-brands fa-react',
    description: 'I develop cross-platform mobile applications with React Native, creating native-like experiences for iOS and Android using a single codebase.',
    downloadLink: 'https://reactnative.dev/docs/getting-started',
    percentage: 70,
    category: 'mobile'
  },
  {
    name: 'Flutter',
    icon: 'fa-solid fa-mobile',
    description: 'I build high-performance mobile and web applications with Flutter, leveraging Dart and its widget-based architecture for visually rich experiences.',
    downloadLink: 'https://docs.flutter.dev/get-started/install',
    percentage: 65,
    category: 'mobile'
  },
  {
    name: 'TensorFlow',
    icon: 'fa-solid fa-brain',
    description: 'I implement machine learning models with TensorFlow, training and deploying neural networks for tasks like image recognition and natural language processing.',
    downloadLink: 'https://www.tensorflow.org/learn',
    percentage: 70,
    category: 'ai-ml'
  },
  {
    name: 'Go',
    icon: 'fa-solid fa-code',
    description: 'I develop high-performance backend services with Go, leveraging its concurrency model and simplicity for building scalable microservices and APIs.',
    downloadLink: 'https://go.dev/doc/',
    percentage: 75,
    category: 'programming'
  },
  {
    name: 'Rust',
    icon: 'fa-solid fa-gears',
    description: 'I write safe and performant systems-level code with Rust, utilizing its memory safety features for building reliable backend services and tools.',
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
    { label: 'Profile', icon: User, action: () => navigate('/profile') },
    { label: 'Admin Panel', icon: Settings, action: () => navigate('/admin'), adminOnly: true },
    { label: 'Log Out', icon: LogOut, action: () => signOut(auth).then(() => navigate('/')) },
  ];

  const isMobile = useMediaQuery({ query: "(max-width: 640px)" });


  useEffect(() => {
    // Delay the first toast by 1 second
    setTimeout(() => {
      if (!navigator.onLine) showOfflineToast("Failed to connect.", {
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
  

  return (
      <Routes>
      <Route path="/blogs" element={<BlogPage />} />
      <Route path="/auth" element={<AuthPage isDark={isDark} />} />
      <Route path="/check-email" element={<CheckYourEmail isDark={isDark} />} />
      <Route path="/forgot-password" element={<ForgotPassword isDark={isDark} />} /> {/* New route */}
      <Route path="/blogs/lyralabs/lyra-ai" element={<LyraBlog />} /> {/* New route */}
      <Route path="/user-data" element={<UserDataPage />} />
      <Route path="/blogs/will-ai-take-our-jobs" element={<AIBlog />} /> {/* New route */}
      <Route path="/blogs/best-lang-to-learn-in-2025" element={<Lang />} /> {/* New route */}
      <Route path="/lets-collaborate" element={<HeroSection />} /> {/* New route */}
      <Route path="/about-me" element={<About />} /> {/* New route */}
      <Route path="/profile" element={<Profile isDark={isDark} />} />
      <Route path="/notifications" element={<NotificationPage />} />
      <Route path="/not-found" element={<NotFound />} />
      <Route path="/admin" element={<AdminPanel isDark={isDark} user={user} />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
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
          <a href=""><img src="https://pbs.twimg.com/profile_images/1905319445851246592/KKJ22pIP_400x400.jpg" className='cursor-custom-pointer rounded-full' style={{
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
                                className={`absolute top-full right-20 md:right-60 md:w-52 md:w-60 border border-black/20 mt-[-20px] rounded-2xl shadow-lg z-10 overflow-hidden ${
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
          <a href="https://form.jotform.com/251094777041054">
          <motion.button
            className={`px-6 hover:px-8 hidden md:block cursor-custom-pointer transition-all py-2 rounded-full font-semibold ${isDark ? 'bg-white text-black hover:bg-gray-100' : 'bg-black text-white hover:bg-gray-900'} flex items-center gap-2`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            Let's Connect
          </motion.button>
          </a>
          <motion.button
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
            className={`absolute top-full  right-6 w-64 mt-[-20px] border border-black/20 rounded-2xl shadow-lg z-10 overflow-hidden transition-all transform origin-top-right ${isDark ? 'bg-gray-800' : 'bg-white'}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0, duration: 0.4 }}
          >
            <nav className="p-3">
              {[
                { label: 'About Me', href: '/about-me' },
                { label: 'LonewolfFSD Blogs', href: '/blogs' },
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
                <a href="https://github.com/lonewolffsd" target="_blank" className="opacity-60 cursor-custom-pointer hover:opacity-100 transition-opacity">
                  <Github className="w-5 h-5" />
                </a>
                <a href="https://instagram.com/lonewolffsd" target="_blank" className="opacity-60 cursor-custom-pointer hover:opacity-100 transition-opacity">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="https://x.com/lonewolffsd" target="_blank" className="opacity-60 cursor-custom-pointer hover:opacity-100 transition-opacity">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-6 mt-10 lg:mt-20 z-50">
        <Spline scene="https://prod.spline.design/pb7UhbKVN30j962d/scene.splinecode" className="hidden lg:block" />
        <div className="max-w-4xl lg:mt-[-45%] xl:mt-[-49%]">
          {/* Animated Paragraph */}
          <motion.p
            className="text-lg lg:text-xl mb-4 opacity-60 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Hello! I&apos;m LonewolfFSD
          </motion.p>

          {/* Animated Heading */}
          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-extrabold lg:font-bold leading-tight mb-8 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Building digital experiences with focus on{' '}
            <span className="opacity-50">innovation</span>
          </motion.h1>

          {/* Animated Button and Paragraph */}
          <motion.div
            className="flex flex-col md:flex-row md:justify-between md:items-start gap-8 "
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
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
            View Projects <ArrowRight className="w-5 h-5 transition-all duration-500 group-hover:ml-1" />
          </motion.button>


            <motion.p
              className="opacity-60 ml-28 max-w-xs sm:ml-auto text-right pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              A full-stack developer crafting innovative solutions through clean code and intuitive design
            </motion.p>
          </motion.div>
        </div>

        {/* Skills Section */}
        <section className="mt-32 lg:mt-60" id="skills" style={{ fontFamily: 'Poppins' }}>
    <h2 className="text-3xl font-bold mb-12">Programming Skills</h2>

    {/* Dropdown Menu */}
    <div className="relative w-52 md:w-64 mb-8">
      <select
        className={`${isDark ? 'bg-gray-800 hover:bg-gray-750' : 'bg-gray-100 hover:bg-gray-200'} 
          w-full cursor-custom-pointer px-8 py-3 rounded-xl text-left cursor-pointer shadow-md outline-none transition duration-200 appearance-none`}
        value={selectedCategory}
        onChange={(e) => {
          setSelectedCategory(e.target.value);
          setShowMore(false);
        }}
      >
        <option value="all" className='hover:bg-black p-2'>All Prog Skills</option>
        <option value="programming" className='hover:bg-black p-2'>Basic Prog</option>
        <option value="frontend" className='hover:bg-black p-2'>Frontend Prog</option>
        <option value="backend" className='hover:bg-black p-2'>Backend Prog</option>
        <option value="database" className='hover:bg-black p-2'>Database</option>
        <option value="tools" className='hover:bg-black p-2'>Tools</option>
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
            isDark ? "bg-gray-800 hover:bg-gray-750" : "bg-gray-100 hover:bg-gray-200"
          } rounded-2xl shadow-lg p-8 w-full xl:w-[390px]`}
          {...(!isMobile && {
            whileHover: { scale: 1.02, rotate: randomRotate },
            variants: skillVariants,
          })}
        >
          <div className="flex items-center space-x-4 mb-4">
            <i className={`${skill.icon} text-3xl`} />
            <h3 className="text-xl font-semibold" style={{ fontFamily: "Poppins, serif" }}>
              {skill.name}
            </h3>
          </div>
          <p
            className="text-sm sm:text-[ Preparation: 15px] opacity-60"
            style={{ fontFamily: "Rubik, sans-serif" }}
          >
            {skill.description}
          </p>
        </motion.div>
      ))}
    </motion.div>

    {/* Show More Button */}
    <button
      onClick={() => setShowMore(!showMore)}
      className="mt-14 cursor-custom-pointer  p-1 font-medium mx-auto block border-b border-b-4"
      style={{ fontWeight: '500' }}
    >
      {showMore ? 'Show Less' : 'Show More'}
    </button>
  </section>
          <span id='projects' />
          <h2 
            className="text-3xl font-bold -mb-4 mt-36" 
            title="Stuff I built with my own two hands... and maybe a bit of crying. Okay fine, they're just projects. Happy now?"
          >
            A Beautiful Mess of Projects
          </h2>

          <Projects />

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
          <a href=""><img src="https://pbs.twimg.com/profile_images/1905319445851246592/KKJ22pIP_400x400.jpg" className='mb-5 cursor-custom-pointer md:mb-0 md:mt-[-10px] w-[56px] md:w-[46px]' style={{
             height: 'auto'
          }}/></a>

          {/* Center: All Rights Reserved */}
          <p className="opacity-60 text-left md:absolute left-1/2 transform md:-translate-x-1/2 md:static sm:mb-4 mb-6 md:mb-0">
            © {new Date().getFullYear()} LonewolfFSD.  All rights reserved.
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
            Cookie Policy
          </Link>
          
          <Link
            to="/privacy-policy"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="hover:underline cursor-custom-pointer mb-0 md:mb-0"
          >
            Privacy Policy
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
