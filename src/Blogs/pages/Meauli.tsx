import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, User, Twitter, Facebook, LogOut, Heart, Music, Image as ImageIcon, Mic, Lock, Github, Instagram, X, Menu, MonitorSmartphone, AudioWaveform, SmilePlus, Sparkles, ScanLine, FileText, Globe, Music2, StarHalf, Stars, Settings, Wallet, Inbox, Bell, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../../../firebase";
import { onAuthStateChanged, User as FirebaseUser, signOut } from "firebase/auth";
import { useAvatar } from "../../AvatarContext";
import { doc, getDoc } from 'firebase/firestore';
import AdBanner from "../../AdBanner";
import { db } from '../../../firebase';
import { useTranslation } from 'react-i18next';
import { t } from 'i18next';
import Helmet from 'react-helmet';

function App() {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState<boolean>(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const { avatarURL } = useAvatar();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
    setIsLangDropdownOpen(false);
    setIsMenuOpen(false);
    window.location.reload();
  };

  useEffect(() => {
    const savedLanguage = localStorage.getItem('i18nextLng');
    const defaultLanguage = 'en';
    if (savedLanguage && languages.some(lang => lang.code === savedLanguage)) {
      if (savedLanguage !== i18n.language) {
        i18n.changeLanguage(savedLanguage);
        setSelectedLanguage(savedLanguage);
      }
    } else {
      i18n.changeLanguage(defaultLanguage);
      setSelectedLanguage(defaultLanguage);
      localStorage.setItem('i18nextLng', defaultLanguage);
    }
  }, [i18n]);

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const profileOptions = [
    { label: t('Profile'), icon: User, action: () => navigate('/profile') },
    { label: t('Admin Panel'), icon: Settings, action: () => navigate("/gmpXRP05issfL14jWssIcxKOREJUNYwMwaS7mbQv69DAZ78N29"), adminOnly: true },
    { label: t('Purchase History'), icon: Wallet, action: () => navigate("/purchase-history") },
    { label: t("Enquiry Listing"), icon: Inbox, action: () => navigate("/enquiries"), adminOnly: true },
    { label: t('Log Out'), icon: LogOut, action: () => signOut(auth).then(() => navigate('/')) },
  ];

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

  const currentLanguage = languages.find((lang) => lang.code === selectedLanguage) || languages.find((lang) => lang.code === 'en');

  return (
    <div className="min-h-screen">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
          body {
            fontFamily: Inter, system-ui, sans-serif;
          }
        `}
      </style>

      <Helmet>
        <meta property="og:title" content="Creation of Meauli: A Pet Accessories E-Commerce Site" />
        <meta property="og:description" content="Discover Meauli, the pet accessories e-commerce platform built for pet parents. Fast, intuitive, and packed with quality products." />
        <meta property="og:image" content="https://meauli.vercel.app/assets/meauli-preview.png" />
        <meta property="og:url" content="https://meauli.vercel.app" />
        <meta name="twitter:card" content="summary_large_image" />
        <title>Creation of Meauli: A Pet Accessories E-Commerce Site</title>
      </Helmet>

      <motion.header
        className="container mx-auto px-6 py-8 flex justify-between items-center relative"
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
              alt="logo"
              src="https://pbs.twimg.com/profile_images/1905319445851246592/KKJ22pIP_400x400.jpg"
              className="cursor-custom-pointer rounded-full"
              style={{ width: '60px', height: 'auto', marginBottom: '-5px' }}
            />
          </a>
        </motion.div>

        <motion.div
          className="flex items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <motion.button
            onClick={() => {
              if (user) {
                setIsProfileDropdownOpen(!isProfileDropdownOpen);
              } else {
                navigate("/auth");
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

      <motion.article
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 md:pb-16 md:pt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <header className="mb-16 mt-10">
          <motion.h1
            className="text-3xl md:text-4xl sm:text-4xl font-semibold text-gray-900 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Creation of Meauli: A Pet Accessories E-Commerce Site
          </motion.h1>
          <div className="flex flex-row sm:flex-row sm:items-center gap-4 sm:gap-6 text-gray-600 mb-8 text-sm">
            <span className="flex items-center gap-1.5">
              <Calendar size={16} />
              July 30, 2025
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={16} />
              12 min read
            </span>
            <span className="flex items-center gap-1.5">
              <User size={16} />
              LonewolfFSD
            </span>
          </div>
          <motion.img
            src="https://i.ibb.co/bM29vprh/Screenshot-2025-07-30-205529.png"
            alt="Meauli homepage showcasing pet accessories"
            className="w-full h-[200px] sm:h-[400px] object-cover rounded-xl shadow-md"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          />
        </header>

        <motion.div
          className="prose prose-lg max-w-none text-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <p className="text-xl leading-relaxed mb-8">
            Meauli isn’t just another e-commerce site—it’s a haven for pet parents, designed to make shopping for pet accessories as joyful as playing with your furry friend. Built by LonewolfFSD, Meauli leverages cutting-edge web technologies to deliver a fast, intuitive, and delightful shopping experience. From cozy pet beds to interactive toys, Meauli is your one-stop shop for pampering your pets.
          </p>
          <p className="leading-relaxed mb-8">
            Unlike typical online stores that prioritize transactions over experience, Meauli is built with pet lovers in mind. It’s not just about selling products—it’s about celebrating the bond between pets and their owners. Whether you’re searching for a durable chew toy for your energetic pup or a stylish collar for your cat, Meauli’s curated catalog and seamless interface make it easy to find exactly what you need.
          </p>

          <h2 className="text-2xl font-medium mt-12 mb-4 text-gray-900">A Store That Understands Pet Parents</h2>
          <motion.img
            src="https://i.ibb.co/cX8qBqWf/Screenshot-2025-07-30-205741.png"
            alt="Meauli product catalog with pet accessories"
            className="w-full h-full object-cover rounded-xl shadow-md mb-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          />
          <p className="leading-relaxed mb-6">
            Meauli’s core mission is to simplify the shopping experience for pet owners. The platform offers a carefully curated selection of pet accessories—think plush beds, grooming tools, and eco-friendly toys—sourced from top brands and vetted for quality. Every product is chosen with the well-being of pets in mind, ensuring durability, safety, and fun.
          </p>
          <p className="leading-relaxed mb-6">
            The user experience is where Meauli shines. The site’s responsive design adapts effortlessly to mobile, tablet, or desktop, so you can shop on the go or from the comfort of home. Filters for price, category, and customer ratings make browsing a breeze, while high-quality product images and detailed descriptions help you make informed choices. It’s like walking into a pet store designed just for you and your pet.
          </p>
          <p className="leading-relaxed mb-8">
            For example, if you’re looking for a calming bed for an anxious dog, Meauli’s filters let you narrow down options by size, material, and customer reviews. The platform might even suggest complementary products, like a soothing lavender-scented toy, based on your browsing history. It’s a thoughtful touch that feels personal, not pushy.
          </p>

          <AdBanner />

          <h2 className="text-2xl font-medium mt-12 mb-4 text-gray-900">The Tech Behind Meauli</h2>
          <motion.img
            src="https://i.ibb.co/bMCZpwN5/Screenshot-2025-07-30-205924.png"
            alt="Meauli checkout interface"
            className="w-full h-full object-cover rounded-xl shadow-md mb-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          />
          <p className="leading-relaxed mb-6">
            Meauli is powered by modern web technologies, including a robust frontend framework for performance and a reliable hosting solution for fast load times and global scalability. The backend uses a composable e-commerce engine, providing flexibility to customize the storefront while maintaining robust functionality. Razorpay integration ensures secure, seamless checkouts, tailored for a smooth payment experience.
          </p>
          <p className="leading-relaxed mb-6">
            The tech stack is designed for speed and reliability. Server-side rendering and static site generation ensure pages load instantly, even during peak traffic. A global content delivery network and automatic HTTPS enhance security and performance, so pet parents can shop with confidence. The sleek, pet-friendly aesthetic, with soft colors and playful animations, reflects the joy of pet ownership.
          </p>
          <p className="leading-relaxed mb-8">
            Meauli also incorporates smart features like personalized product recommendations. By analyzing your browsing and purchase history, the platform suggests items tailored to your pet’s needs—say, a high-protein treat for an active dog or a scratching post for a curious cat. These recommendations are powered by lightweight algorithms, ensuring a snappy experience without compromising depth.
          </p>

          <AdBanner />

          <h2 className="text-2xl font-medium mt-12 mb-4 text-gray-900">Beyond Shopping: Smart Features for Pet Parents</h2>
          <motion.img
            src="https://i.ibb.co/cXS2Ljtp/Screenshot-2025-07-30-210339.png"
            alt="Meauli search and filter interface"
            className="w-full h-full object-cover rounded-xl shadow-md mb-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          />
          <p className="leading-relaxed mb-6">
            Meauli goes beyond a traditional e-commerce platform with features designed to delight pet owners:
          </p>
          <ul className="list-disc list-inside space-y-4 mb-8">
            <li className="flex items-start gap-2">
              <Search size={20} className="mt-1 text-gray-500" />
              <span>
                <strong className="font-medium">Advanced Search</strong>: Meauli’s search offers typeahead suggestions and dynamic filtering, letting you find products by keyword, category, or even pet type in seconds.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Wallet size={20} className="mt-1 text-gray-500" />
              <span>
                <strong className="font-medium">Seamless Checkout</strong>: Razorpay’s secure payment system supports multiple methods, with a streamlined checkout process that saves your cart and shipping details for faster purchases.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Bell size={20} className="mt-1 text-gray-500" />
              <span>
                <strong className="font-medium">Pet Care Blog</strong>: Meauli’s blog offers tips on grooming, training, and nutrition, written by pet experts to help you care for your furry friend.
              </span>
            </li>
          </ul>
          <p className="leading-relaxed mb-8">
            These features make Meauli a companion for pet parents. Imagine searching for “durable dog toy” and instantly seeing top-rated options, complete with reviews and care tips. Or, after adding a pet bed to your cart, Meauli suggests a matching blanket based on your pet’s size and preferences. It’s shopping that feels thoughtful and tailored.
          </p>

          <h2 className="text-2xl font-medium mt-12 mb-4 text-gray-900">The Journey to Meauli</h2>
          <p className="leading-relaxed mb-6">
            Meauli started as a passion project by LonewolfFSD, inspired by the love for pets and a desire to create a better online shopping experience. Early versions were simple—a basic product list with clunky navigation. But through iterations, LonewolfFSD transformed Meauli into a modern e-commerce platform, blending cutting-edge technology with a pet-centric vision.
          </p>
          <p className="leading-relaxed mb-6">
            Building Meauli wasn’t easy. The team faced challenges like optimizing search for diverse pet products, ensuring mobile responsiveness, and integrating secure payments with Razorpay. Beta testers played a key role, providing feedback on everything from UI flow to product categorization. Their input shaped Meauli’s intuitive filters and playful design, making it a store pet parents love to explore.
          </p>
          <p className="leading-relaxed mb-8">
            Today, Meauli stands as a testament to innovation. It’s not perfect—sometimes search suggestions miss niche products, or checkout can feel too minimalist—but every update brings it closer to the goal of being the go-to pet store online. The team’s now working on Meauli 2.0, with plans for subscription boxes and AI-driven recommendations.
          </p>

          <AdBanner />

          <h2 className="text-2xl font-medium mt-12 mb-4 text-gray-900">Privacy and Security First</h2>
          <motion.img
            src="https://i.ibb.co/ksMC12KG/Screenshot-2025-07-30-210725.png"
            alt="Padlock symbolizing Meauli’s secure shopping"
            className="w-full h-full object-cover rounded-xl shadow-md mb-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          />
          <p className="leading-relaxed mb-6">
            Trust is at the heart of Meauli. All transactions are encrypted end-to-end using Razorpay’s secure infrastructure, ensuring your payment details are safe. User data, like shipping addresses and purchase history, is stored on secure servers, accessible only to Meauli’s algorithms. No human eyes pry into your shopping habits—ever.
          </p>
          <p className="leading-relaxed mb-6">
            Meauli complies with global privacy standards, with regular audits to maintain security. You can opt out of data collection for personalization in your account settings, giving you full control. If you delete your account, all data is wiped clean—no backups, no exceptions.
          </p>
          <p className="leading-relaxed mb-8">
            Transparency is key. If Meauli encounters an issue, like a delayed shipment or out-of-stock item, you’ll get clear communication and solutions, like refunds or alternatives. It’s all part of creating a shopping experience you can rely on.
          </p>

          <AdBanner />

          <h2 className="text-2xl font-bold mt-12 mb-4 text-gray-900">Meauli in Your Pet’s World</h2>
          <p className="leading-relaxed mb-6">
            Meauli isn’t just for shopping—it’s a lifestyle platform for pet parents. Beyond products, the blog offers practical advice, like how to choose the right collar or keep your pet active. Community features let you share photos of your pet sporting Meauli gear, fostering a sense of connection among pet lovers.
          </p>
          <p className="leading-relaxed mb-6">
            For small businesses, Meauli offers bulk purchasing options for pet stores or groomers, with discounts and fast shipping. Pet influencers can join the affiliate program, earning commissions by showcasing Meauli products on social media. The platform’s API (in development) will let developers integrate Meauli into pet care apps, like trackers for feeding schedules.
          </p>
          <p className="leading-relaxed mb-8">
            Meauli’s also exploring partnerships with pet shelters, offering discounts to adopters and donating a portion of profits to animal welfare. It’s a platform that celebrates pets while giving back to the community.
          </p>

          <hr className="py-4 mt-16" />

          <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900">What’s Next for Meauli?</h2>
          <p className="leading-relaxed mb-6">
            Meauli’s just the beginning. The roadmap for 2025–2026 is packed with exciting updates:
          </p>
          <ul className="list-disc list-inside space-y-4 mb-8">
            <li className="flex items-start gap-2">
              <Heart size={20} className="mt-1 text-gray-500" />
              <span>
                <strong className="font-medium">Subscription Boxes</strong>: Monthly curated boxes of pet toys, treats, and accessories tailored to your pet’s needs.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Sparkles size={20} className="mt-1 text-gray-500" />
              <span>
                <strong className="font-medium">AI Recommendations</strong>: Personalized product suggestions powered by AI, learning from your pet’s preferences and your shopping habits.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <MonitorSmartphone size={20} className="mt-1 text-gray-500" />
              <span>
                <strong className="font-medium">Mobile App</strong>: A dedicated Meauli app for iOS and Android, with push notifications for deals and order updates.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Globe size={20} className="mt-1 text-gray-500" />
              <span>
                <strong className="font-medium">Global Expansion</strong>: Bringing Meauli to pet parents worldwide with localized catalogs and shipping.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Inbox size={20} className="mt-1 text-gray-500" />
              <span>
                <strong className="font-medium">Community Forums</strong>: A space for pet parents to share tips, reviews, and photos, building a vibrant Meauli community.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Lock size={20} className="mt-1 text-gray-500" />
              <span>
                <strong className="font-medium">Enhanced Privacy</strong>: Offline browsing mode and advanced encryption for even greater data security.
              </span>
            </li>
          </ul>
          <p className="leading-relaxed mb-8">
            Meauli’s team is also exploring integrations with pet care apps, like fitness trackers for dogs or feeding reminders, to make Meauli a central hub for pet parenting. The goal is to create a platform that’s as essential to pet owners as a leash is to a walk.
          </p>

          <AdBanner />

          <h2 className="text-2xl font-bold mt-12 mb-4 text-gray-900">Join the Meauli Community</h2>
          <motion.img
            src="https://i.ibb.co/Xxnvw1bt/Screenshot-2025-07-30-210921.png"
            alt="Pet parents sharing Meauli purchases"
            className="w-full h-[200px] sm:h-[300px] object-cover rounded-xl shadow-md mb-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          />
          <p className="leading-relaxed mb-6">
            Meauli’s more than a store—it’s a community of pet lovers. Early access is open now, letting you explore the platform and provide feedback to shape its future. Join pet parents on Discord and Instagram, sharing photos of your pets with Meauli products or swapping care tips in weekly challenges.
          </p>
          <p className="leading-relaxed mb-8">
            Signing up is easy. Visit Meauli’s homepage, create an account, and start shopping. You’ll get exclusive deals, early access to new products, and a chance to connect with LonewolfFSD. Your feedback will help make Meauli the ultimate pet store online.
          </p>

          <blockquote className="border-l-4 border-gray-300 pl-6 my-10 italic text-gray-600">
            “Meauli’s not just a store—it’s a love letter to pets and the people who adore them.” – Lonewolf
          </blockquote>

          <p className="leading-relaxed mb-8">
            Ready to pamper your pet? Meauli’s waiting to help you find the perfect accessories, share your pet’s story, and join a community that celebrates the joy of pet parenthood. Start shopping today.
          </p>

          <a
            href="https://meauli.vercel.app"
            className="inline-block bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="flex gap-2"><Stars size={21} className="mt-0.5" /> Shop Meauli Now</span>
          </a>
        </motion.div>

        <motion.div
          className="border-t border-gray-200 mt-16 pt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h3 className="text-lg font-medium mb-4 text-gray-900">Share Meauli’s Story</h3>
          <div className="flex gap-1">
            <motion.a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                "Discover Meauli – the ultimate pet accessories store. Fast, fun, and built for pet parents! #Meauli #PetLovers"
              )}&url=${encodeURIComponent("https://meauli.vercel.app")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Share on Twitter"
            >
              <Twitter size={20} className="text-gray-600" />
            </motion.a>

            <motion.a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                "https://meauli.vercel.app"
              )}&quote=${encodeURIComponent(
                "Shop Meauli for the best pet accessories – quality and love in every product!"
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Share on Facebook"
            >
              <Facebook size={20} className="text-gray-600" />
            </motion.a>

            <motion.a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Share on Instagram"
              onClick={() => {
                navigator.clipboard.writeText(
                  "Check out Meauli, the pet accessories store made for pet lovers! 🐾 #Meauli https://meauli.vercel.app"
                );
                alert("Link and message copied! Paste it in your Instagram app to share.");
              }}
            >
              <Instagram size={20} className="text-gray-600" />
            </motion.a>
          </div>
        </motion.div>
      </motion.article>
    </div>
  );
}

export default App;