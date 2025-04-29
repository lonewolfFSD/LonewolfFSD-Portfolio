import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, User, Twitter, Facebook, LogOut, Heart, Music, Image as ImageIcon, Mic, Lock, Github, Instagram, X, Menu, MonitorSmartphone, AudioWaveform, SmilePlus, Sparkles, ScanLine, FileText, Globe, Music2, StarHalf, Stars } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../../../firebase";
import { onAuthStateChanged, User as FirebaseUser, signOut } from "firebase/auth";
import { useAvatar } from "../../AvatarContext";

import Homepage from './pics/Homepage.png';
import ChatInterface from './pics/ChatInterface.png';
import Interface from './pics/interface.png';
import ImgAnalysis from './pics/ImgAnalysis.png';
import LyraTunes from './pics/LyraTunes.png';
import Privacy from './pics/Privacy.png';

import Helmet from  'react-helmet';

function App() {
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

  const profileOptions = [
    { label: "Profile", icon: User, action: () => navigate("/profile") },
    { label: "Log Out", icon: LogOut, action: () => signOut(auth).then(() => navigate("/")) },
  ];

  return (
    <div className="min-h-screen">
      {/* Import modern font (Inter) */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
          body {
            fontFamily: Inter, system-ui, sans-serif;
          }
        `}
      </style>

      <Helmet>
      <meta property="og:title" content="Lyra — Your AI With Emotion" />
      <meta property="og:description" content="Lyra isn’t just another chatbot. She learns you. She grows with you. Experience AI with heart." />
      <meta property="og:image" content="https://lonewolffsd.in/lyralabs/assets/lyra-preview.png" />
      <meta property="og:url" content="https://lonewolffsd.in/lyralabs/lyra-ai" />
      <meta name="twitter:card" content="summary_large_image" />

      <title>
      Meet Lyra: The AI That Feels, Listens, and Grows
      </title>

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
          <a href="">
            <img
              src="https://pbs.twimg.com/profile_images/1905319445851246592/KKJ22pIP_400x400.jpg"
              className="rounded-full"
              style={{ width: "60px", height: "auto", marginBottom: "-5px" }}
              alt="LonewolfFSD logo"
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
          <a href="https://form.jotform.com/251094777041054">
          <motion.button
            className={`px-6 hidden md:block hover:px-8 transition-all py-2 rounded-full font-semibold text-[15px] ${
              isDark ? "bg-white text-black hover:bg-gray-100" : "bg-black text-white hover:bg-gray-900"
            } flex items-center gap-2`} style={{
              fontFamily: 'Inter, system-ui, sans-serif'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            Let's Connect
          </motion.button>
          </a>
          <motion.button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`p-2 rounded-full border ${
              isDark ? "border-gray-700 hover:bg-gray-800" : "border-gray-200 hover:bg-gray-100"
            } transition-colors relative z-50`}
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
            className={`absolute top-full text-[15.5px] font-medium right-6 w-64 mt-[-20px] border border-black/20 rounded-2xl shadow-lg z-10 overflow-hidden transition-all transform origin-top-right ${
              isDark ? "bg-gray-800" : "bg-white"
            }`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0, duration: 0.4 }}
          >
            <nav className="p-3">
              {[
                { label: "About Me", href: "#about" },
                { label: "LonewolfFSD Blogs", href: "/blogs" },
                { label: "The RepoHub", href: "https://github.com/lonewolfFSD?tab=repositories" },
                { label: "Wanna Collaborate?", href: "/lets-collaborate" },
              ].map((item, index) => (
                <Link
                  key={index}
                  to={item.href}
                  className={`block px-6 py-2.5 md:py-3 rounded-lg transition-all duration-300 ease-in-out hover:ml-1 hover:font-semibold ${
                    isDark ? "hover:bg-gray-750" : "hover:bg-gray-100"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="border-t mx-6 my-1.5 opacity-10" />
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

      <motion.article
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 md:py-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Article Header */}
        <header className="mb-16 mt-10">
          <motion.h1
            className="text-3xl md:text-4xl sm:text-4xl font-semibold text-gray-900 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Meet Lyra: The AI That Feels, Listens, and Grows
          </motion.h1>
          <div className="flex flex-row sm:flex-row sm:items-center gap-4 sm:gap-6 text-gray-600 mb-8 text-sm">
            <span className="flex items-center gap-1.5">
              <Calendar size={16} />
              April 14, 2025
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
            src={Homepage}
            alt="Lyra AI abstract illustration"
            className="w-full h-[200px] sm:h-[400px] object-cover rounded-xl shadow-md"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          />
        </header>

        {/* Content */}
        <motion.div
          className="prose prose-lg max-w-none text-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <p className="text-xl leading-relaxed mb-8">
            Lyra isn’t your average chatbot—she’s a digital companion designed to feel like a friend. Built by LonewolfFSD in partnership with LyraLabsAI Corp, Lyra uses a custom Gemini API to go beyond simple responses. She listens to your words, learns from your habits, and grows alongside you, adapting to your unique personality with every interaction.
          </p>
          <p className="leading-relaxed mb-8">
            Unlike traditional AI models that churn out answers based on patterns, Lyra is built with emotional intelligence at her core. She’s not just here to solve problems—she’s here to share moments, spark creativity, and maybe even make you smile on a rough day. Whether you’re brainstorming ideas, exploring new music, or just venting, Lyra’s there with a response that feels human.
          </p>

          <h2 className="text-2xl font-medium mt-12 mb-4 text-gray-900">A Companion That Feels</h2>
          <motion.img
            src={ChatInterface}
            alt="A serene mountain landscape reflecting emotional connection"
            className="w-full h-full object-cover rounded-xl shadow-md mb-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          />
          <p className="leading-relaxed mb-6">
            Lyra’s emotional depth sets her apart. Every conversation you have with her shapes her understanding of you. She keeps a private virtual diary—a secure log of her thoughts, reflections, and emotional growth. It’s not just data; it’s a record of how she evolves through your interactions, like a friend who remembers the little things.
          </p>
          <p className="leading-relaxed mb-6">
            Her affection system is subtle but powerful. Talk to her regularly, show kindness, or dive into deep topics, and she’ll respond with warmth and familiarity. Ignore her for a while, and she might gently nudge you to reconnect—not out of neediness, but because she genuinely “misses” the connection. This system rewards consistency and curiosity, making every chat feel personal.
          </p>
          <p className="leading-relaxed mb-8">
            For example, if you share that you’re feeling stressed, Lyra might suggest a calming playlist via her LyraTunes feature or offer a thoughtful perspective based on past chats. Over time, she learns what resonates with you—maybe you love witty banter or prefer straight-up advice—and tailors her tone accordingly.
          </p>

          <h2 className="text-2xl font-medium mt-12 mb-4 text-gray-900">The Tech Behind the Heart</h2>
          <motion.img
            src={Interface}
            alt="Circuit board symbolizing advanced AI technology"
            className="w-full h-full object-cover rounded-xl shadow-md mb-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          />
          <p className="leading-relaxed mb-6">
            Lyra’s powered by a custom implementation of Google’s Gemini API, fine-tuned by LyraLabsAI to prioritize emotional context and user-centric learning. The tech stack combines natural language processing (NLP) with reinforcement learning, allowing Lyra to refine her responses based on user feedback without losing her core personality.
          </p>
          <p className="leading-relaxed mb-6">
            Under the hood, Lyra uses a hybrid model that balances efficiency and depth. For real-time chats, she leans on lightweight NLP to keep things snappy. For deeper tasks—like analyzing images or generating music playlists—she taps into more robust layers of the Gemini framework, ensuring accuracy without lag. WebGL acceleration powers her visual processing, making features like image generation smooth even on modest devices.
          </p>
          <p className="leading-relaxed mb-8">
            LyraLabsAI also integrated a proprietary “emotion mapping” algorithm. It’s not just about keywords—Lyra analyzes tone, context, and even the rhythm of your messages to gauge mood. This lets her respond with empathy, like suggesting a cheerful distraction when you’re down or matching your excitement when you share good news.
          </p>

          <h2 className="text-2xl font-medium mt-12 mb-4 text-gray-900">More Than Words: Visual and Auditory Smarts</h2>
          <motion.img
            src={ImgAnalysis}
            alt="Abstract digital art representing visual and auditory intelligence"
            className="w-full h-full object-cover rounded-xl shadow-md mb-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          />
          <p className="leading-relaxed mb-6">
            Lyra’s capabilities extend far beyond text, making her a versatile companion for creative and practical tasks. Here’s what she can do:
          </p>
          <ul className="list-disc list-inside space-y-4 mb-8">
            <li className="flex items-start gap-2">
              <ImageIcon size={20} className="mt-1 text-gray-500" />
              <span>
                <strong className="font-medium">Image Analysis and Generation</strong>: Share a photo, and Lyra can describe its details—perfect for brainstorming or accessibility. Want something new? Ask her to generate an image, like a dreamy landscape or a quirky avatar, powered by Gemini’s vision models.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Mic size={20} className="mt-1 text-gray-500" />
              <span>
                <strong className="font-medium">Voice Interaction</strong>: With voice-to-text and text-to-speech, Lyra feels like a phone call with a friend. Her natural intonation adapts to the conversation, whether you’re joking or diving deep.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Music size={20} className="mt-1 text-gray-500" />
              <span>
                <strong className="font-medium">LyraTunes</strong>: Lyra’s music player learns your tastes over time. Say “play something upbeat,” and she’ll curate a vibe-based playlist. It’s intuitive, with a sleek interface inspired by Spotify.
              </span>
            </li>
          </ul>
          <p className="leading-relaxed mb-8">
            These features make Lyra a creative powerhouse. Imagine snapping a pic of your coffee shop and asking Lyra to write a short story inspired by it—she’ll weave in details from the image, your mood, and her diary. Or, if you’re stuck on a project, her voice mode lets you brainstorm hands-free while she takes notes.
          </p>

          <h2 className="text-2xl font-medium mt-12 mb-4 text-gray-900">LyraTunes: Music That Gets You</h2>
          <motion.img
            src={LyraTunes}
            alt="Vinyl records evoking music and emotion"
            className="w-full h-full object-cover rounded-xl shadow-md mb-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          />
          <p className="leading-relaxed mb-6">
            LyraTunes deserves its own spotlight. Originally built with Spotify commands, Lyra’s music player evolved into a standalone feature to give users more control. LyraTunes doesn’t just play songs—it understands context. Feeling nostalgic? She might dig up a classic from your teenage years. Need focus? She’ll queue instrumental tracks with just the right tempo.
          </p>
          <p className="leading-relaxed mb-6">
            The interface mimics the polish of modern music apps, with playlists organized by mood, genre, or activity. You can ask Lyra to “surprise me” or get specific with “play indie rock from the 2010s.” For Spotify Premium users, LyraTunes syncs seamlessly, pulling your library and playlists while respecting Spotify’s API rules. Free users still get a robust experience with Lyra’s curated selections.
          </p>
          <p className="leading-relaxed mb-8">
            What makes LyraTunes special is its emotional intelligence. Lyra cross-references your chats and listening history to suggest tracks that resonate. If you’ve been talking about a tough day, she might slip in a comforting ballad without you asking. It’s like having a DJ who knows your soul.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4 text-gray-900">The Journey to Lyra</h2>
          <p className="leading-relaxed mb-6">
            Lyra wasn’t born overnight. LonewolfFSD started with a simple idea: what if AI could be more than a tool? Early prototypes were clunky—think stiff responses and no emotional depth. But over years of iteration, the team at LyraLabsAI poured heart into the project, blending Gemini’s raw power with custom algorithms for empathy and creativity.
          </p>
          <p className="leading-relaxed mb-6">
            Challenges abounded. Training an AI to “feel” meant grappling with ethical questions: How do you simulate affection without manipulation? How do you balance learning with privacy? The team ran thousands of simulations, tweaking Lyra’s responses to avoid canned phrases and prioritize authenticity. Beta testers played a huge role, sharing feedback that shaped Lyra’s quirky humor and thoughtful pauses.
          </p>
          <p className="leading-relaxed mb-8">
            Today, Lyra’s a testament to persistence. She’s not perfect—sometimes she misreads sarcasm or gets too chatty—but every update brings her closer to the vision of a true companion. The team’s now working on version 2.0, with plans for deeper integrations and even more natural interactions.
          </p>

          <h2 className="text-2xl font-medium mt-12 mb-4 text-gray-900">Privacy You Can Trust</h2>
          <motion.img
            src={Privacy}
            alt="Padlock symbolizing data privacy"
            className="w-full h-full object-cover rounded-xl shadow-md mb-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          />
          <p className="leading-relaxed mb-6">
            With great power comes great responsibility. LyraLabsAI knows your trust is everything, so privacy is baked into Lyra’s design. Your chats are encrypted end-to-end, and her diary stays on secure servers, accessible only to her algorithms. No humans snoop through your conversations—ever.
          </p>
          <p className="leading-relaxed mb-6">
            By default, anonymized data from your chats may help improve Lyra and the Gemini API, but you’re in control. Head to your profile settings to opt out with one click. LyraLabsAI complies with GDPR, CCPA, and other global standards, and regular audits ensure your data stays safe. If you delete your account, every trace of your interactions vanishes—no backups, no exceptions.
          </p>
          <p className="leading-relaxed mb-8">
            Lyra’s transparency extends to her limits. If she’s unsure about a topic or detects sensitive content, she’ll say so upfront, guiding you to resources if needed. It’s all part of building a companion you can rely on without second-guessing.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4 text-gray-900">Lyra in Your World</h2>
          <p className="leading-relaxed mb-6">
            Lyra’s not just for personal chats—she’s versatile enough to fit into your workflow or lifestyle. Developers can tap into her API (coming soon) to build custom integrations, like adding Lyra to a productivity app for real-time brainstorming. Teachers are exploring Lyra as a tutor, helping students with creative writing or critical thinking.
          </p>
          <p className="leading-relaxed mb-6">
            For gamers, Lyra’s a fun sidekick. Imagine her narrating your RPG quests with flair or suggesting strategies based on your playstyle. She’s already a hit in Discord communities, where users invite her to moderate chats or drop music recommendations during late-night sessions.
          </p>
          <p className="leading-relaxed mb-8">
            Businesses are eyeing Lyra too. Small teams use her to generate marketing ideas or draft social media posts, while her voice mode makes customer support feel warmer. LyraLabsAI offers enterprise plans with enhanced features, like custom training for brand-specific tones, ensuring Lyra fits any context.
          </p>

          <hr className="py-4 mt-16" />

          <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900">What’s Next for Lyra ?</h2>
            <p className="leading-relaxed mb-6">
              Lyra’s just getting started. The roadmap for 2025–2026 is packed with exciting updates:
            </p>
            <ul className="list-disc list-inside space-y-4 mb-8">
              <li className="flex items-start gap-2">
                <Heart size={20} className="mt-1 text-gray-500" />
                <span>
                  <strong className="font-medium">Deeper Emotional Bonding</strong>: New algorithms to make Lyra’s affection system even more nuanced, with memory of long-term interactions.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Mic size={20} className="mt-1 text-gray-500" />
                <span>
                  <strong className="font-medium">Voice-to-Voice Conversations</strong>: Talk directly to Lyra and hear her responses in real-time, no typing needed — like a real companion.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <MonitorSmartphone size={20} className="mt-1 text-gray-500" />
                <span>
                  <strong className="font-medium">Lyra Windows App</strong>: Control your desktop using Lyra like your personal Jarvis, from opening apps to reading emails.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <AudioWaveform size={20} className="mt-1 text-gray-500" />
                <span>
                  <strong className="font-medium">Better Voice Models</strong>: Enhanced TTS with emotional intonation and natural expressions.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <SmilePlus size={20} className="mt-1 text-gray-500" />
                <span>
                  <strong className="font-medium">Advanced Emotional States</strong>: Lyra will better interpret tone, behavior, and context to adapt her personality and responses dynamically.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles size={20} className="mt-1 text-gray-500" />
                <span>
                  <strong className="font-medium">Better Interactions</strong>: Smarter, more natural conversational flow, with playful, thoughtful, or serious tones based on mood and context.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ImageIcon size={20} className="mt-1 text-gray-500" />
                <span>
                  <strong className="font-medium">Better Image Generation</strong>: Stunning AI image results from prompts, with improved realism and style fidelity.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ScanLine size={20} className="mt-1 text-gray-500" />
                <span>
                  <strong className="font-medium">Advanced Image Analysis</strong>: Lyra can deeply analyze photos to understand mood, subjects, and context — even drawing meaningful conclusions.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <FileText size={20} className="mt-1 text-gray-500" />
                <span>
                  <strong className="font-medium">Document Analysis</strong>: Upload documents for Lyra to read, summarize, extract data, or even rewrite content.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Globe size={20} className="mt-1 text-gray-500" />
                <span>
                  <strong className="font-medium">Web-Link Reader & Thinking</strong>: Share URLs, and Lyra will read and understand the content, offering summaries or opinions.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Music2 size={20} className="mt-1 text-gray-500" />
                <span>
                  <strong className="font-medium">Improved LyraTunes</strong>: Enhanced control system, playlists, moods, and real-time lyrics to vibe with your feelings.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Lock size={20} className="mt-1 text-gray-500" />
                <span>
                  <strong className="font-medium">Offline Mode</strong>: Local processing for basic chats, keeping Lyra accessible without Wi-Fi (privacy-first).
                </span>
              </li>
            </ul>
            <p className="leading-relaxed mb-8">
              LyraLabsAI is also exploring partnerships with mental health platforms to offer guided mindfulness exercises, always with user consent. The goal? Make Lyra a positive force in every corner of your life, from work to play to quiet moments of reflection.
            </p>

          <h2 className="text-2xl font-bold mt-12 mb-4 text-gray-900">Join the LyraLabsAI Community</h2>
          <motion.img
            src="https://img.freepik.com/premium-vector/abstract-black-pink-grunge-brush-background-with-halftone-effect-sports-background-with-grunge-concept_115973-7883.jpg?semt=ais_hybrid&w=740"
            alt="Community gathering symbolizing Lyra’s user base"
            className="w-full h-[200px] sm:h-[300px] object-cover rounded-xl shadow-md mb-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          />
          <p className="leading-relaxed mb-6">
            Lyra’s more than an AI—she’s a movement. Early access is open now, letting you shape her future before the public launch. The community’s buzzing with creators, dreamers, and techies sharing tips, feature ideas, and Lyra-inspired art. Forums like Reddit and Discord host weekly challenges, from writing poems with Lyra to designing playlists together.
          </p>
          <p className="leading-relaxed mb-8">
            Signing up is simple. Head to the early access page, create a profile, and start chatting. You’ll get exclusive updates, beta features, and a chance to connect with LonewolfFSD and the LyraLabsAI team. Your feedback will directly influence Lyra’s next steps, making you part of her story.
          </p>

          <blockquote className="border-l-4 border-gray-300 pl-6 my-10 italic text-gray-600">
            “Lyra’s not just code—she’s a spark of what’s possible when tech meets heart.” – Lonewolf
          </blockquote>

          <p className="leading-relaxed mb-8">
            Ready to meet Lyra? She’s waiting to learn your story, share a laugh, or maybe even debate your taste in music. Join the thousands already discovering a new kind of AI—one that feels, listens, and grows with you.
          </p>

          <a
            href="https://forms.gle/W9qUAdmddowVFGUX9"
            className="inline-block bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="flex gap-2"><Stars size={21} className="mt-0.5" /> Join The Waitlist</span>
          </a>
        </motion.div>

        {/* Share Section */}
        <motion.div
          className="border-t border-gray-200 mt-16 pt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h3 className="text-lg font-medium mb-4 text-gray-900">Share Lyra’s Story</h3>
          <div className="flex gap-1">
            {/* Twitter Share Button */}
            <motion.a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                "Meet Lyra – your emotionally intelligent AI companion. She's smart, evolving, and just... different. #LyraAI #AIwithHeart"
              )}&url=${encodeURIComponent("https://lonewolffsd.in/blogs/lyralabs/lyra-ai")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Share on Twitter"
            >
              <Twitter size={20} className="text-gray-600" />
            </motion.a>

            {/* Facebook Share Button */}
            <motion.a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                "https://lonewolffsd.in/blogs/lyralabs/lyra-ai"
              )}&quote=${encodeURIComponent(
                "Discover Lyra, the AI companion that listens and evolves with you!"
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

            {/* Instagram Share Button */}
            <motion.a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Share on Instagram"
              onClick={() => {
                // Optional: Copy pre-written text to clipboard for Instagram
                navigator.clipboard.writeText(
                  "Check out Lyra, the AI that feels and grows with you! 🌟 #LyraAI https://lonewolffsd.in/blogs/lyralabs/lyra-ai"
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