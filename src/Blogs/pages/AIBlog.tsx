import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, User, Twitter, Facebook, Instagram, Menu, X, Heart, LogOut, Briefcase, Brain, Rocket, Shield, Zap, Code, Globe, Star, School, Book, DollarSign, Palette, Leaf, Github, Truck, Scale, Settings, Wallet, Inbox } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../../../firebase";
import { onAuthStateChanged, User as FirebaseUser, signOut } from "firebase/auth";
import { useAvatar } from "../../AvatarContext";
import Helmet from 'react-helmet';

import AIJobs from './pics/ai_jobs.png';
import TechBehind from './pics/tech_behind_ai.png';

const Blog: React.FC = () => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState<boolean>(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const { avatarURL } = useAvatar();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Profile dropdown options
    const profileOptions = [
    { label: 'Profile', icon: User, action: () => navigate('/profile') },
    { label: 'Admin Panel', icon: Settings, action: () => navigate("/gmpXRP05issfL14jWssIcxKOREJUNYwMwaS7mbQv69DAZ78N29"), adminOnly: true },
    { label: "Purchase History", icon: Wallet, action: () => navigate("/purchase-history") },
    { label: "Enquiry Listing", icon: Inbox, action: () => navigate("/enquiries"), adminOnly: true },
    { label: 'Log Out', icon: LogOut, action: () => signOut(auth).then(() => navigate('/')) },
  ];

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const stagger = {
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
          body {
            font-family: Inter, system-ui, sans-serif;
          }
        `}
      </style>

      <Helmet>
        <meta property="og:title" content="Will AI Take Our Jobs? Or Just Make New Ones?" />
        <meta property="og:description" content="Explore the impact of AI on the job market. Will it replace jobs or create new opportunities? Dive into the future of work." />
        <meta property="og:image" content="https://images.unsplash.com/photo-1620712943542-24033b3b3c94" />
        <meta property="og:url" content="https://example.com/ai-jobs-blog" />
        <meta name="twitter:card" content="summary_large_image" />
        <title>Will AI Take Our Jobs? Or Just Make New Ones?</title>
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
  .filter((option) => !option.adminOnly || (option.adminOnly && userRole === 'admin'))
  .map((option, index) => (
    <button
      key={index}
      onClick={() => {
        option.action();
        setIsProfileDropdownOpen(false);
      }}
      className={`w-full text-left text-[14.3px] px-1.5 hover:px-3 group hover:font-semibold transition-all py-[7px] rounded-lg flex items-center gap-2.5 ${
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
                  className={`absolute top-full -mt-5 right-6 w-64  rounded-2xl shadow-lg z-50 border border-gray-300 overflow-hidden transition-all transform origin-top-right ${isDark ? 'bg-gray-800' : 'bg-white'}`}
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
      </motion.header>

      <motion.article
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-14 md:mt-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <header className="mb-16 mt-10">
          <motion.h1
            className="text-3xl md:text-4xl sm:text-5xl font-semibold text-gray-900 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Will AI Take Our Jobs? The Truth Behind the Fear
          </motion.h1>
          <div className="flex flex-row sm:flex-row sm:items-center gap-4 sm:gap-6 text-gray-600 mb-8 text-sm">
            <span className="flex items-center gap-1.5">
              <Calendar size={16} />
              April 18, 2025
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={16} />
              10 min read
            </span>
            <span className="flex items-center gap-1.5">
              <User size={16} />
              LonewolfFSD
            </span>
          </div>
          <motion.img
            src={AIJobs}
            alt="AI and Jobs"
            className="w-full h-[200px] sm:h-[400px] object-cover rounded-xl shadow-md hover:scale-105 transition-transform duration-300"
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
          <p className="text-[19px] md:text-xl leading-relaxed mb-8">
            Artificial Intelligence (AI) is no longer a sci-fi fantasy—it’s here, reshaping industries, automating tasks, and sparking debates about the future of work. The big question looms: will AI take our jobs, or will it create new opportunities that redefine what work means? Let’s unpack this complex issue with a clear-eyed look at both sides.
          </p>
          <p className="leading-relaxed mb-8">
            History offers clues. The Industrial Revolution replaced manual labor with machines, yet it birthed new industries and roles. The internet disrupted traditional media but gave rise to digital marketing and app development. AI, with its ability to process vast data and mimic human cognition, is a similar force—disruptive but brimming with potential. Below, we explore the fears, the possibilities, and how we can prepare for an AI-driven future.
          </p>

          <h2 className="text-2xl font-medium mt-12 mb-4 text-gray-900">The Fear: AI as a Job Destroyer</h2>
          <motion.img
            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
            alt="Automation Concerns"
            className="w-full h-[200px] sm:h-[300px] object-cover rounded-xl shadow-md mb-6 hover:scale-105 transition-transform duration-300"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          />
          <p className="leading-relaxed mb-6">
            The anxiety around AI’s impact on jobs is palpable. Studies paint a stark picture: a 2017 McKinsey report estimated that 30% of current jobs could be automated by 2030, while Oxford University’s 2013 study flagged 47% of U.S. jobs as “at risk” from automation. These numbers fuel fears of widespread unemployment and economic upheaval.
          </p>
          <p className="leading-relaxed mb-6">
            Certain sectors are already feeling the heat. In manufacturing, robots handle assembly lines with precision. In transportation, self-driving trucks threaten drivers’ livelihoods. Even white-collar roles like accounting and legal research face disruption as AI tools analyze data faster than humans. The concern isn’t just about job loss—it’s about the speed of change and whether workers can adapt.
          </p>
          <motion.ul className="list-disc list-inside space-y-4 mb-8" variants={stagger}>
            {[
              { text: "Automation of repetitive tasks like data entry, warehousing, and customer service.", icon: Briefcase },
              { text: "Displacement in industries such as transportation (e.g., autonomous vehicles) and retail (e.g., cashier-less stores).", icon: Truck },
              { text: "Challenges for low-skill workers who may struggle to reskill for tech-driven roles.", icon: User },
              { text: "Potential for economic inequality as automation benefits corporations over workers.", icon: Scale },
            ].map((point, index) => (
              <motion.li
                key={index}
                className="flex items-start gap-2 hover:translate-x-2 transition-transform duration-200"
                variants={fadeIn}
              >
                <point.icon size={20} className="mt-1 text-red-500" />
                <span>{point.text}</span>
              </motion.li>
            ))}
          </motion.ul>
          <p className="leading-relaxed mb-8">
            These fears aren’t unfounded, but they don’t tell the whole story. AI’s impact depends on how we manage the transition—through policy, education, and innovation.
          </p>

          <h2 className="text-2xl font-medium mt-12 mb-4 text-gray-900">The Opportunity: AI as a Job Creator</h2>
          <motion.img
            src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
            alt="AI Innovation"
            className="w-full h-[200px] sm:h-[300px] object-cover rounded-xl shadow-md mb-6 hover:scale-105 transition-transform duration-300"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          />
          <p className="leading-relaxed mb-6">
            While AI disrupts, it also creates. The World Economic Forum’s 2020 Future of Jobs Report predicted that by 2025, AI and automation will create 97 million new jobs, outpacing the 85 million jobs displaced. These roles will span industries, from tech to healthcare to creative fields, driven by AI’s ability to unlock new possibilities.
          </p>
          <p className="leading-relaxed mb-6">
            AI isn’t just about replacing humans—it’s about augmenting them. Doctors use AI for faster diagnostics, freeing time for patient care. Marketers leverage AI for data insights, focusing on strategy over number-crunching. This human-AI collaboration can enhance productivity, job satisfaction, and innovation.
          </p>
          <motion.ul className="list-disc list-inside space-y-4 mb-8" variants={stagger}>
            {[
              { text: "AI trainers and ethicists to ensure responsible and unbiased AI systems.", icon: Brain },
              { text: "Data scientists and machine learning engineers to build and maintain AI models.", icon: Code },
              { text: "Creative roles enhanced by AI, like AI-assisted design, music, and content creation.", icon: Palette },
              { text: "New industries, such as AI-driven healthcare diagnostics and personalized education.", icon: Rocket },
              { text: "Green jobs in AI-optimized renewable energy and sustainability initiatives.", icon: Leaf },
            ].map((point, index) => (
              <motion.li
                key={index}
                className="flex items-start gap-2 hover:translate-x-2 transition-transform duration-200"
                variants={fadeIn}
              >
                <point.icon size={20} className="mt-1 text-green-500" />
                <span>{point.text}</span>
              </motion.li>
            ))}
          </motion.ul>
          <p className="leading-relaxed mb-8">
            Emerging fields like AI ethics and explainability are already in demand, as companies seek to build trust in their systems. Meanwhile, AI’s role in sustainability—optimizing energy grids or predicting climate patterns—creates jobs that align with global priorities. The key is to view AI as a partner, not a replacement.
          </p>

          <h2 className="text-2xl font-medium mt-12 mb-4 text-gray-900">The Tech Behind AI’s Impact</h2>
          <motion.img
            src={TechBehind}
            alt="AI Technology"
            className="w-full h-[200px] sm:h-[300px] object-cover rounded-xl shadow-md mb-6 hover:scale-105 transition-transform duration-300"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          />
          <p className="leading-relaxed mb-6">
            AI’s transformative power stems from advances in machine learning, natural language processing (NLP), and computer vision. These technologies enable AI to perform tasks once exclusive to humans, from writing reports to analyzing medical images. But they also create demand for skilled professionals to develop, maintain, and govern these systems.
          </p>
          <p className="leading-relaxed mb-6">
            For example, large language models like those powering chatbots require data scientists to fine-tune algorithms and ethicists to address biases. Computer vision systems in autonomous vehicles need engineers to ensure safety. As AI integrates into industries, the need for specialized roles grows, from AI auditors to prompt engineers who craft effective AI queries.
          </p>
          <p className="leading-relaxed mb-8">
            Open-source platforms and cloud computing have democratized AI development, enabling small businesses and startups to innovate. This lowers barriers to entry, fostering entrepreneurship and creating jobs in unexpected places—like rural areas where remote AI work is viable.
          </p>

          <h2 className="text-2xl font-medium mt-12 mb-4 text-gray-900">Challenges and Solutions</h2>
          <p className="leading-relaxed mb-6">
            The transition to an AI-driven economy won’t be seamless. Workers displaced by automation may face barriers to reskilling, especially in regions with limited access to education. Economic inequality could widen if AI’s benefits concentrate among tech giants. And ethical concerns—such as AI bias or job surveillance—demand urgent attention.
          </p>
          <p className="leading-relaxed mb-6">
            Solutions require collaboration between governments, businesses, and individuals:
          </p>
          <motion.ul className="list-disc list-inside space-y-4 mb-8" variants={stagger}>
            {[
              { text: "Invest in reskilling programs tailored to AI-driven roles, with a focus on accessibility.", icon: School },
              { text: "Promote lifelong learning through online platforms and community colleges.", icon: Book },
              { text: "Implement policies like universal basic income or wage subsidies to ease transitions.", icon: DollarSign },
              { text: "Encourage ethical AI development to prevent bias and protect worker rights.", icon: Shield },
            ].map((point, index) => (
              <motion.li
                key={index}
                className="flex items-start gap-2 hover:translate-x-2 transition-transform duration-200"
                variants={fadeIn}
              >
                <point.icon size={20} className="mt-1 text-blue-500" />
                <span>{point.text}</span>
              </motion.li>
            ))}
          </motion.ul>
          <p className="leading-relaxed mb-8">
            Individuals can prepare by embracing adaptability. Learning basic coding, data analysis, or AI ethics can open doors. Even non-tech skills like creativity and emotional intelligence—areas where humans still outshine AI—will remain valuable.
          </p>

          <h2 className="text-2xl font-medium mt-12 mb-4 text-gray-900">The Human Element</h2>
          <motion.img
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
            alt="Human-AI Collaboration"
            className="w-full h-[200px] sm:h-[300px] object-cover rounded-xl shadow-md mb-6 hover:scale-105 transition-transform duration-300"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          />
          <p className="leading-relaxed mb-6">
            AI’s rise underscores what makes humans unique: creativity, empathy, and critical thinking. While AI can process data or generate art, it lacks the emotional depth and intuition that define human work. Roles requiring personal connection—like counseling, teaching, or leadership—will remain human domains.
          </p>
          <p className="leading-relaxed mb-8">
            The future of work lies in human-AI synergy. Imagine architects using AI to simulate designs, teachers leveraging AI for personalized lessons, or musicians collaborating with AI to compose. By focusing on what humans do best, we can harness AI to amplify our potential rather than replace it.
          </p>

          <h2 className="text-2xl font-medium mt-12 mb-4 text-gray-900">Conclusion: Shaping the Future</h2>
          <p className="leading-relaxed mb-6">
            AI is neither a job-killer nor a utopia—it’s a tool, and its impact depends on how we wield it. Yes, automation will disrupt industries, but it will also spark new roles, industries, and ways of working. The challenge is to prepare proactively, ensuring that workers, businesses, and governments adapt to this new reality.
          </p>
          <p className="leading-relaxed mb-8">
            By investing in education, fostering ethical AI, and embracing human-AI collaboration, we can create a future where work is more fulfilling, not less. AI isn’t here to take our jobs—it’s here to redefine them. The question isn’t “Will AI take our jobs?” but “How will we shape the jobs AI creates?”
          </p>
        </motion.div>

        <motion.div
          className="border-t border-gray-200 mt-16 pt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h3 className="text-lg font-medium mb-4 text-gray-900">Share This Article</h3>
          <div className="flex gap-1">
            <motion.a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("Will AI take our jobs or create new ones? Explore the future of work in this insightful article. #AI #FutureOfWork")}&url=${encodeURIComponent("https://example.com/ai-jobs-blog")}`}
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
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent("https://example.com/ai-jobs-blog")}`}
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
                navigator.clipboard.writeText("Will AI take our jobs or create new ones? Check out this article! #AI #FutureOfWork https://example.com/ai-jobs-blog");
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
};

export default Blog;
