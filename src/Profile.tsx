import React, { useEffect, useState, useCallback, useRef } from "react";
import { db, storage } from "../firebase"; // Ensure storage is imported
import { doc, setDoc, getDoc, updateDoc, arrayUnion, runTransaction } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAvatar } from "./AvatarContext.tsx";
import { QRCodeSVG } from "qrcode.react";
import { getAuth } from 'firebase/auth';
import * as nsfwjs from "nsfwjs"; // Import nsfwjs
import { Tilt } from 'react-tilt';
import logo from './mockups/logo.png';
import { useTranslation } from 'react-i18next';

import FireEffect from './Effects/Cartoon_Fire_7_3997_HD.webm';
import SmokeEffect from './Effects/Cartoon_Smoke_4_4005_HD.webm';
import SmokeBlast from './Effects/Cartoon_Smoke_1_4002_HD.webm';
import confetti from 'canvas-confetti';

// Import required for Razorpay verification (add at top of Profile.tsx if not present)
import axios from 'axios';

import JapaneseSpring from './Videos/japanese-spring.960x540.mp4';
import LosSantos from './Videos/sunset-in-los-santos-gta-v.1920x1080.mp4';
import Tanquirl from './Videos/tranquil-japan-lake-view.3840x2160.mp4';
import MysticalTorii from './Videos/mystical-torii.3840x2160.mp4';
import Samurai from './Videos/samurai-spirit-under-the-moon.3840x2160.mp4';
import Coffeeshop from './Videos/coffee-shop.3840x2160.mp4';
import MistyRain from './Videos/hydrangeas-rain.3840x2160.mp4';
import SunsetDrive from './Videos/evening-drive-and-windmills.3840x2160.mp4';
import Nebula from './Videos/nebula.3840x2160.mp4';
import LastOfUs from './Videos/surviving-the-last-of-us.3840x2160.mp4';
import SilentHill from './Videos/silent-hill-2.3840x2160.mp4';
import RedDead from './Videos/rdr-2-animated.3840x2160.mp4';
import Yinlin from './Videos/yinlin-wuthering-waves.3840x2160.mp4';

import Cropper from "react-easy-crop";
import { Area } from "react-easy-crop/types";
import { BadgeCheck, ChevronDown, ChevronUp, Inbox, Music, Paintbrush2, PaintBucket, Pause, Play, Plus, RotateCcw, RotateCw, Wallet } from "lucide-react";

import { collection, query, where, onSnapshot } from 'firebase/firestore';

import { ScaleLoader } from "react-spinners";

import { DotPatternWithGlowEffectDemo } from "./DotPattern.tsx";
import * as tf from "@tensorflow/tfjs"; // Import TensorFlow.js
import {
  User,
  LogOut,
  Mail,
  Globe,
  LocateFixed,
  ShieldCheck,
  Calendar,
  Clock,
  Lock,
  Trash2,
  AlertTriangle,
  Instagram,
  Github,
  Twitter,
  X,
  Menu,
  Phone,
  Monitor,
  UserCog,
  Settings,
  Key,
  Link2,
  History,
  Fingerprint,
  Upload,
  AlertCircle,
  Check,
  CheckCircle,
  ExternalLink,
  Pencil,
  Bell,
} from "lucide-react";
import {
  auth,
  signOut,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
  deleteUser,
  multiFactor,
  TotpMultiFactorGenerator,
  updateProfile,
} from "../firebase";
import Helmet from "react-helmet";

// Add this interface at the top of Profile.tsx, after imports
interface Achievement {
  achievementId: string;
  name: string;
  description: string;
  badgeImage: string; // URL to badge image
  earnedDate?: string; // ISO date string or undefined if locked
  status: 'earned' | 'locked';
}

// Assume existing interfaces and imports for videos, credits, toast, etc.
interface Effect {
  id: string;
  name: string;
  price?: number; // Credits
  priceINR?: number; // INR
  url: string;
  category: string;
}

interface EffectPurchaseDetails {
  id: string;
  name: string;
  url: string;
  price?: number;
  priceINR?: number;
  paymentType: "credits" | "real_money";
  transactionId: string;
  date: string;
}

interface UserProfile {
  displayName: string;
  photoURL?: string;
  email: string;
  emailVerified: boolean;
  metadata: { creationTime?: string; lastSignInTime?: string };
  activeEffect?: Effect;
  selectedVideo?: string;
  achievements?: Array<{ name: string; description: string; badgeImage: string; status: string; earnedDate?: string }>;
  region?: string;
}

interface PurchaseDetails {
  credits: number;
  amount: number; // Amount in INR
  date: string; // Formatted date
  transactionId: string; // Razorpay payment ID
}

const DeleteAccountModal = ({ isOpen, onClose, onDelete }) => {

  const [error, setError] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const { t, i18n } = useTranslation();

  const handleDelete = async () => {
    try {
      await onDelete();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to delete account");
    }
  };

  return (
    
    
    <AnimatePresence>
    {isOpen && (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="bg-white md:rounded-2xl w-full md:max-w-lg px-4 md:px-10 h-full md:h-auto py-10 md:py-12 shadow-lg flex flex-col justify-center md:items-left md:text-left  text-center"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-2xl font-bold " style={{ fontFamily: "Poppins" }}>
            {t('Are you absolutely sure?')}
          </h2>
          <p className="mt-3 text-gray-600">
            {t('This action cannot be undone. This will permanently delete your account and remove your data from our servers.')}
          </p>
  
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-500 p-4 rounded-xl mt-4">
              {error}
            </div>
          )}
  
          <div className="mt-6 w-full max-w-md flex flex-col gap-3 items-center self-center md:grid md:grid-cols-2 md:items-stretch md:self-auto">
            <button
              onClick={handleDelete}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-6 bg-red-500 font-semibold text-white rounded-md hover:bg-red-600"
            >
              <Trash2 size={17} strokeWidth={3} /> {t('Delete')}
            </button>

            <button
              onClick={onClose}
              className="w-full py-2.5 px-6 rounded-md border border-black text-black hover:bg-black hover:text-white transition"
            >
              {t('Cancel')}
            </button>
          </div>

        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
  
  );
};

interface ProfileProps {
  isDark: boolean;
  publicMode?: boolean; // New prop
  uid?: string; // Optional UID for public profiles
}

const Profile: React.FC<ProfileProps> = ({ isDark }) => {
  const navigate = useNavigate();
  const { uid } = useParams<{ uid: string }>();
  const [user, setUser] = useState(auth?.currentUser);
    const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
  const [publicMode, setPublicMode] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [location, setLocation] = useState<string>("Fetching...");
  const [region, setRegion] = useState<string>("Unknown");
  const [currentTime, setCurrentTime] = useState<string>(() =>
    new Date().toLocaleTimeString()
  );

const [publicUserData, setPublicUserData] = useState<{
  displayName?: string;
  photoURL?: string;
  achievements?: any[];
  selectedVideo?: string;
} | null>(null);
  const [password, setPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [avatarURL, setAvatarURL] = useState<string>(""); // New state for avatar
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [deviceName, setDeviceName] = useState<string>("this device");
  const [isPasswordProvider, setIsPasswordProvider] = useState<boolean>(false);
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState<boolean>(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [totpUri, setTotpUri] = useState("");
  const [totpSecret, setTotpSecret] = useState(null);
  const [isBiometric2FAEnabled, setIsBiometric2FAEnabled] = useState(false);
  const [isBiometricModalOpen, setIsBiometricModalOpen] = useState(false); // New state
  const [showBiometricSetup, setShowBiometricSetup] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [nsfwModel, setNsfwModel] = useState(null); // State for NSFW model
  const [passwordError, setPasswordError] = useState<string>("");
  const [biometricError, setBiometricError] = useState<string>(""); // New state for modal
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [isEffectModalOpen, setIsEffectModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
const [virtualCurrency, setVirtualCurrency] = useState<number>(300);
  const [selectedEffectCategories, setSelectedEffectCategories] = useState<string[]>([]);
  const [selectedEffect, setSelectedEffect] = useState<string | null>(null);
  const [isEffectInteractable, setIsEffectInteractable] = useState(false);
    const [effectPurchaseDetails, setEffectPurchaseDetails] = useState<EffectPurchaseDetails | null>(null);

const [isCreditsOpen, setIsCreditsOpen] = useState(true);
const [achievements, setAchievements] = useState<Achievement[]>([]);
  // Replace purchasedCredits with purchaseDetails
  const [purchaseDetails, setPurchaseDetails] = useState<PurchaseDetails | null>(null);
const [isPurchaseHistoryOpen, setIsPurchaseHistoryOpen] = useState(false);

const [selectedMusic, setSelectedMusic] = useState<string | null>(null);
const [purchasedMusic, setPurchasedMusic] = useState<string[]>([]);
const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);
const [musicSearchQuery, setMusicSearchQuery] = useState("");
const [selectedMusicCategories, setSelectedMusicCategories] = useState<string[]>([]);
const [playingMusicId, setPlayingMusicId] = useState<string | null>(null);
const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});
let [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false); // Minimal state for dropdown

// Add state for modal visibility and purchased credits
const [isOpen, setIsOpen] = useState(false);
const [purchasedCredits, setPurchasedCredits] = useState(null);

const profileData = publicMode
  ? publicUserData || {}
  : { displayName: user?.displayName, photoURL: user?.photoURL, achievements, selectedVideo };

// Then use:
{profileData.displayName}
{profileData.photoURL}
{profileData.achievements}
const backgroundVideo = profileData.selectedVideo;

const videoEffectRef = useRef<(HTMLVideoElement | null)[]>([]);
  const videoRef = useRef(null);

  // Determine public mode and fetch profile data
  useEffect(() => {
    if (loading) return;
    if (!user && !uid) {
      navigate("/login");
      return;
    }
    const targetUid = uid || user?.uid;
    if (!targetUid) return;

    setPublicMode(!!uid && uid !== user?.uid);
    const userRef = doc(db, "users", targetUid);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setProfileUser({
          displayName: data.displayName || "Anonymous",
          photoURL: data.photoURL,
          email: data.email || "Unknown",
          emailVerified: data.emailVerified || false,
          metadata: { creationTime: data.createdAt, lastSignInTime: data.lastLogin },
          activeEffect: data.activeEffect,
          selectedVideo: data.selectedVideo,
          achievements: data.achievements || [],
          region: data.region || "Unknown",
        });
        setVirtualCurrency(data.virtualCurrency ?? 0);
        setPurchasedVideos(data.purchasedVideos ?? []);
        setPurchasedEffects(data.purchasedEffects ?? []);
        setActiveEffect(data.activeEffect ?? null);
        setSelectedVideo(data.selectedVideo ?? null);
        setAvatarURL(data.avatarURL || null);
        setRegion(data.region || "Unknown");
        setLocation(data.location || "Unknown");
        setCurrentTime(data.currentTime || "Unknown");
        setDeviceName(data.deviceName || "Unknown");
        setUserRole(data.role || "user");
        setAchievements(data.achievements || []);
        setConnectedAccounts(data.connectedAccounts || []);
        setRecentLogins(data.recentLogins || []);
        setIsBiometric2FAEnabled(data.isBiometric2FAEnabled || false);
      } else {
        setToast({ message: "User not found.", type: "error" });
        if (uid) navigate("/profile");
      }
    }, (error) => {
      console.error("Firestore snapshot error:", error);
      setToast({ message: "Failed to load profile data.", type: "error" });
    });
    return unsubscribe;
  }, [user, uid, loading, navigate]);

  const flags = {
    en: (
      <svg
        className="w-7 h-[0.875rem] shrink-0"
        viewBox="0 0 60 30"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="60" height="30" fill="#00247d" />
        <path d="M0 0L60 30M60 0L0 30" stroke="#fff" strokeWidth="6" />
        <path d="M0 0L60 30M60 0L0 30" stroke="#cf142b" strokeWidth="4" />
        <path d="M30 0V30M0 15H60" stroke="#fff" strokeWidth="10" />
        <path d="M30 0V30M0 15H60" stroke="#cf142b" strokeWidth="6" />
      </svg>
    ),
    es: (
      <svg
        className="w-7 h-[0.875rem] shrink-0"
        viewBox="0 0 60 30"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="60" height="7.5" fill="#c60b1e" />
        <rect y="7.5" width="60" height="15" fill="#ffc107" />
        <rect y="22.5" width="60" height="7.5" fill="#c60b1e" />
      </svg>
    ),
    fr: (
      <svg
        className="w-7 h-[0.875rem] shrink-0"
        viewBox="0 0 60 30"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="20" height="30" fill="#0055a4" />
        <rect x="20" width="20" height="30" fill="#fff" />
        <rect x="40" width="20" height="30" fill="#ef4135" />
      </svg>
    ),
    it: (
      <svg
        className="w-7 h-[0.875rem] shrink-0"
        viewBox="0 0 60 30"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="20" height="30" fill="#009246" />
        <rect x="20" width="20" height="30" fill="#fff" />
        <rect x="40" width="20" height="30" fill="#ce2b37" />
      </svg>
    ),
    pt: (
      <svg
        className="w-7 h-[0.875rem] shrink-0"
        viewBox="0 0 60 30"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="24" height="30" fill="#006600" />
        <rect x="24" width="36" height="30" fill="#ff0000" />
      </svg>
    ),
    ja: (
      <svg
        className="w-7 h-[0.875rem] shrink-0"
        viewBox="0 0 60 30"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="60" height="30" fill="#fff" />
        <circle cx="30" cy="15" r="10" fill="#bc002d" />
      </svg>
    ),
    zh: (
      <svg
        className="w-7 h-[0.875rem] shrink-0"
        viewBox="0 0 60 30"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="60" height="30" fill="#de2910" />
        <path
          d="M15 7.5L16.5 10.5L19.5 12L16.5 13.5L15 16.5L13.5 13.5L10.5 12L13.5 10.5L15 7.5Z"
          fill="#ffde00"
        />
        <path d="M22.5 6L24 9L27 9L24 10.5L25.5 12L24 13.5L22.5 12L21 13.5L19.5 12L21 10.5L19.5 9L21 9L22.5 6Z" fill="#ffde00" />
        <path d="M25.5 15L27 18L30 18L27 19.5L28.5 21L27 22.5L25.5 21L24 22.5L22.5 21L24 19.5L22.5 18L24 18L25.5 15Z" fill="#ffde00" />
        <path d="M19.5 15L21 18L24 18L21 19.5L22.5 21L21 22.5L19.5 21L18 22.5L16.5 21L18 19.5L16.5 18L18 18L19.5 15Z" fill="#ffde00" />
      </svg>
    ),
    ko: (
      <svg
        className="w-7 h-[0.875rem] shrink-0"
        viewBox="0 0 60 30"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="60" height="30" fill="#fff" />
        <circle cx="30" cy="15" r="7.5" fill="#cd2e3a" />
        <circle cx="30" cy="15" r="7.5" transform="rotate(180 30 15)" fill="#0047a0" />
        <path d="M20 7H22V9H20V7Z M20 11H22V13H20V11Z M20 15H22V17H20V15Z" fill="#000" />
        <path d="M38 7H40V9H38V7Z M38 11H40V13H38V11Z M38 15H40V17H38V15Z" fill="#000" />
        <path d="M24 19H26V21H24V19Z M24 23H26V25H24V23Z" fill="#000" />
        <path d="M34 19H36V21H34V19Z M34 23H36V25H34V23Z" fill="#000" />
      </svg>
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

  // Fetch public user data if in publicMode
useEffect(() => {
  if (publicMode && uid) {
    const fetchPublicUser = async () => {
      try {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setPublicUserData({
            displayName: data.displayName,
            photoURL: data.photoURL,
            achievements: data.achievements || [],
            selectedVideo: data.selectedVideo || null,
          });
        } else {
          setToast({ message: "User not found.", type: "error" });
        }
      } catch (err) {
        console.error("Fetch public user error:", err);
        setToast({ message: "Failed to load profile.", type: "error" });
      }
    };
    fetchPublicUser();
  }
}, [publicMode, uid]);

let displayName;
if (publicMode) {
  displayName = publicUserData?.displayName;
} else {
  displayName = user?.displayName;
}

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
  };


  // Ensure language is loaded from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('i18nextLng');
    if (savedLanguage && savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage);
      setSelectedLanguage(savedLanguage);
    }
  }, [i18n]);

// Function to load Razorpay script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

// Function to handle Razorpay payment

  // Sample effects data (replace with your actual URLs)
  const effects: Effect[] = [
    {
      id: "anime-fire-whoosh",
      name: "Blaze Fire Effect",
      price: 500,
      priceINR: 199,
      url: FireEffect, // Use a transparent video
      category: "fire",
    },
    {
      id: "mystic-smoke",
      name: "Mystic Smoke Effect",
      price: 700,
      priceINR: 199,
      url: SmokeEffect,
      category: "smoke",
    },
    {
      id: "mystic-smoke-blast",
      name: "Smoke Blast Effect",
      price: 700,
      priceINR: 199,
      url: SmokeBlast,
      category: "smoke",
    },
  ];

useEffect(() => {
  if (purchaseDetails) {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });
  }
}, [purchaseDetails]);




// Updated handlePayment function
const handlePayment = async (amount: number, credits: number, image: string) => {
    const res = await loadRazorpayScript();
    if (!res) {
      setToast({ message: "Razorpay SDK failed to load.", type: "error" });
      return;
    }
    if (!user || !user?.uid) {
      setToast({ message: "User not authenticated.", type: "error" });
      return;
    }
    const name = `FSD ${credits} Credits Pack`;
    const purchaseDate = new Date().toLocaleString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_live_y2c1NPOWRBIcgH",
      amount: amount * 100,
      currency: "INR",
      name: "LonewolfFSD",
      description: `Purchase ${credits} Credits`,
      handler: async function (response: any) {
        try {
          const userRef = doc(db, "users", user?.uid);
          const purchaseRef = doc(collection(db, `users/${user?.uid}/purchases`));
          await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) {
              throw new Error("User document not found.");
            }
            const currentData = userDoc.data();
            const currentCredits = currentData.virtualCurrency ?? 0;
            transaction.update(userRef, {
              virtualCurrency: currentCredits + credits,
              updatedAt: new Date().toISOString(),
            });
            transaction.set(purchaseRef, {
              type: "credits",
              name,
              amount,
              paymentType: "real_money",
              transactionId: response.razorpay_payment_id,
              date: purchaseDate,
              image,
              createdAt: new Date().toISOString(),
              paymentMethod: response.razorpay_payment_method || "unknown",
              contact: response.razorpay_contact || user?.phoneNumber || "unknown",
              status: "success",
            });
          });
          setPurchaseDetails({
            credits,
            amount,
            date: purchaseDate,
            transactionId: response.razorpay_payment_id,
            image,
          });
          setVirtualCurrency((prev) => prev + credits);
          setToast({ message: `${credits} credits added!`, type: "success" });
        } catch (error) {
          console.error("Firestore update error:", error);
          setToast({ message: "Failed to update credits. Contact support.", type: "error" });
        }
      },
      modal: {
        ondismiss: () => {
          setToast({ message: "Payment cancelled.", type: "error" });
        },
      },
      prefill: {
        name: user?.displayName || "Client",
        email: user?.email || "",
        contact: user?.phoneNumber || "",
      },
      theme: {
        color: "#000000",
      },
    };
    try {
      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (err: any) {
        setToast({ message: `Payment failed: ${err.error.description}`, type: "error" });
      });
      rzp.open();
    } catch (err) {
      console.error("Razorpay error:", err);
      setToast({ message: "Failed to initiate payment.", type: "error" });
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

const allCategories = ["nature", "anime", "neon", "space", "games", "free"];


function toggleCategory(category: string) {
  setSelectedCategories(prev => 
    prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
  );
}



const videoOptions = [
  { id: "none", name: "No Video Background", url: null, categories: ["free"], price: 0, locked: false, paymentOptions: ["credits"] },
  { id: "video1", name: "Tranquil Japan Lake", url: Tanquirl, categories: ["nature"], price: 500, locked: true, paymentOptions: ["credits", "real_money"], priceINR: 49 },
  { id: "video2", name: "Mystical Torii", url: MysticalTorii, categories: ["nature"], price: 1500, locked: true, paymentOptions: ["credits", "real_money"], priceINR: 129 },
  { id: "video3", name: "Japanese Spring", url: JapaneseSpring, categories: ["nature"], price: 500, locked: true, paymentOptions: ["credits", "real_money"], priceINR: 49 },
  { id: "video4", name: "Samurai Night", url: Samurai, categories: ["anime"], price: 1500, locked: true, paymentOptions: ["credits", "real_money"], priceINR: 129 },
  { id: "video5", name: "Coffee Shop", url: Coffeeshop, categories: ["anime"], price: 2000, locked: true, paymentOptions: ["credits", "real_money"], priceINR: 199 },
  { id: "video6", name: "Misty Rain", url: MistyRain, categories: ["nature"], price: 2000, locked: true, paymentOptions: ["credits", "real_money"], priceINR: 199 },
  { id: "video7", name: "Evening Drive", url: SunsetDrive, categories: ["nature"], price: 2000, locked: true, paymentOptions: ["credits", "real_money"], priceINR: 199 },
  { id: "video8", name: "Neon Skyline", url: "https://motionbgs.com/media/7738/neon-skyline.960x540.mp4", categories: ["neon", "free"], price: 0, locked: false, paymentOptions: ["credits"] },
  { id: "video9", name: "The Nebula", url: Nebula, categories: ["space"], price: 5000, locked: true, paymentOptions: ["credits", "real_money"], priceINR: 399 },
  { id: "video10", name: "The Last Of Us", url: LastOfUs, categories: ["games"], price: 5000, locked: true, paymentOptions: ["credits", "real_money"], priceINR: 499 },
  { id: "video11", name: "Silent Hill 2", url: SilentHill, categories: ["games"], price: 3500, locked: true, paymentOptions: ["credits", "real_money"], priceINR: 299 },
  { id: "video12", name: "Los Santos: GTA V", url: LosSantos, categories: ["games"], price: 3500, locked: true, paymentOptions: ["credits", "real_money"], priceINR: 299 },
  { id: "video13", name: "Read Dead: RDR2", url: RedDead, categories: ["games"], price: 5000, locked: true, paymentOptions: ["credits", "real_money"], priceINR: 499 },
  { id: "video14", name: "Yinlin - WW", url: Yinlin, categories: ["games"], price: 5000, locked: true, paymentOptions: ["credits", "real_money"], priceINR: 499 },
];


const musicOptions = [
  { id: "none", name: "No Music", url: null, categories: ["free"], price: 0, locked: false, image: "https://via.placeholder.com/150?text=None" },
  { id: "music1", name: "Biscuit", url: "https://audio.jukehost.co.uk/cVF4excsRCXKJ9cW2VYrsQ6Jw6b0hqV2", categories: ["relax", "lo-fi"], price: 0, locked: false, image: "https://data.freetouse.com/music/tracks/0b2af3c9-f44f-df2f-0ae3-1a75f439829d/cover/webp/md" },
  { id: "music2", name: "Coffee", url: "https://audio.jukehost.co.uk/eYFWyH1hMSQI1SoibSSNU8Y4LTWihVI6", categories: ["lofi", "artist"], price: 1000, locked: true, image: "https://i.scdn.co/image/ab67616d00004851ad2c1e1bcbc8d7415636691b" },
  { id: "music3", name: "Blue - Yung Kai", url: "https://audio.jukehost.co.uk/pUsQGYErof1dt2bEbMJF18QnyxUJRxVq", categories: ["artist", "relax"], price: 2000, locked: true, image: "https://i.scdn.co/image/ab67616d00004851373c63a4666fb7193febc167" },
  { id: "music4", name: "Cigarettes After Sex", url: "https://audio.jukehost.co.uk/LxT0GaUKYp6F2cDePpDWvAXOJSrScsxn", categories: ["artist", "relax"], price: 2500, locked: true, image: "https://i.scdn.co/image/ab67616d00004851f20d15ff288e94492f7097eb" },
  { id: "music5", name: "Pursuit", url: "https://audio.jukehost.co.uk/S3J2BXhUOu7B9ySMs26iVlxpZAGpa2hj", categories: ["artist", "dark"], price: 2500, locked: true, image: "https://i.scdn.co/image/ab67616d00004851bd6a20f5851ef12e1a5583da" },
  { id: "music6", name: "Red Dead Redemption", url: "https://audio.jukehost.co.uk/P1lVIdxWvk9asAW13uYBAU4Wnn2DtNuN", categories: ["artist", "dark", "games"], price: 4000, locked: true, image: "https://i.scdn.co/image/ab67616d000048513dae5c9cf336a67a5b490608" },
];

const allMusicCategories = ["lo-fi", "dark", "free"];

const [purchasedVideos, setPurchasedVideos] = useState<string[]>([]);

const filteredVideos = videoOptions.filter(video => {
  const matchesSearch = video.name.toLowerCase().includes(searchQuery.toLowerCase());
  const matchesCategory = selectedCategories.length === 0
    ? true
    : video.categories.some(cat => selectedCategories.includes(cat));
  return matchesSearch && matchesCategory;
});

const handlePurchaseVideo = async (video: { id: string; price: number; url: string; name: string }) => {
  if (!user || !user?.uid) {
    setToast({ message: "You must be signed in to purchase videos.", type: "error" });
    return;
  }
  if (virtualCurrency < video.price) {
    setToast({ message: `Insufficient credits to purchase "${video.name}". Need ${video.price} credits, but you have ${virtualCurrency}.`, type: "error" });
    return;
  }
  try {
    const userDocRef = doc(db, "users", user?.uid);
    const purchaseRef = doc(collection(db, `users/${user?.uid}/purchases`));
    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const purchaseDate = new Date().toLocaleString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userDocRef);
      if (!userDoc.exists()) {
        throw new Error("User document not found.");
      }
      const currentData = userDoc.data();
      const currentCredits = currentData.virtualCurrency ?? 0;
      if (currentCredits < video.price) {
        throw new Error(`Insufficient credits in transaction. ${currentCredits} available, need ${video.price}`);
      }
      transaction.update(userDocRef, {
        virtualCurrency: currentCredits - video.price,
        purchasedVideos: arrayUnion(video.id),
        updatedAt: new Date().toISOString(),
      });
      transaction.set(purchaseRef, {
        type: "video",
        name: video.name,
        amount: video.price,
        paymentType: "credits",
        transactionId,
        date: purchaseDate,
        url: video.url,
        createdAt: new Date().toISOString(),
        status: "success",
      });
    });
    setVirtualCurrency((prev) => prev - video.price);
    setPurchasedVideos((prev) => [...prev, video.id]);
    setVideoPurchaseDetails({
      id: video.id,
      name: video.name,
      url: video.url,
      price: video.price,
      paymentType: "credits",
      transactionId,
      date: purchaseDate,
    });
    setToast({ message: `Purchased "${video.name}" successfully! 🌟`, type: "success" });
  } catch (err) {
    console.error("Purchase video error:", err);
    setToast({ message: err.message || "Failed to purchase video background. Please try again.", type: "error" });
  }
};

  const [activeEffect, setActiveEffect] = useState<Effect | null>(null);

const handlePurchaseMusic = async (music: { id: string; price: number; name: string }) => {
  if (!user || !user?.uid) {
    setError("You must be signed in to purchase music.");
    return;
  }

  if (virtualCurrency < music.price) {
    setError(`Insufficient credits to purchase "${music.name}". Need ${music.price} credits, but you have ${virtualCurrency}.`);
    return;
  }

  try {
    const userDocRef = doc(db, "users", user?.uid);

    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userDocRef);
      if (!userDoc.exists()) {
        throw new Error("User document not found.");
      }

      const currentData = userDoc.data();
      const currentCredits = currentData.virtualCurrency ?? 0;

      if (currentCredits < music.price) {
        throw new Error(`Insufficient credits in transaction. ${currentCredits} available, need ${music.price}`);
      }

      transaction.update(userDocRef, {
        virtualCurrency: currentCredits - music.price,
        purchasedMusic: arrayUnion(music.id),
        updatedAt: new Date().toISOString(),
      });
    });

    setVirtualCurrency(prev => prev - music.price);
    setPurchasedMusic(prev => [...prev, music.id]);
    setSuccess(`Purchased "${music.name}" successfully! 🎵`);
  } catch (err) {
    console.error("Purchase music error:", err);
    setError(err.message || "Failed to purchase music. Please try again.");
  }
};

const loadUserData = async () => {
  if (!user || !user?.uid) return;
  try {
    const userDocRef = doc(db, "users", user?.uid);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      setVirtualCurrency(data.virtualCurrency ?? 300);
      setPurchasedVideos(data.purchasedVideos ?? []);
      setPurchasedMusic(data.purchasedMusic ?? []);
      setPurchasedEffects(data.purchasedEffects ?? []); // Ensure purchasedEffects sync
      setActiveEffect(data.activeEffect ?? null);
      setSelectedVideo(data.backgroundVideo);
      setSelectedMusic(data.backgroundMusic);
    } else {
      await setDoc(userDocRef, {
        virtualCurrency: 300,
        purchasedVideos: [],
        purchasedMusic: [],
        createdAt: new Date().toISOString(),
      });
      setPurchasedVideos([]);
      setPurchasedMusic([]);
    }
  } catch (err) {
    console.error("Load user data error:", err);
    setError("Failed to load user data.");
  }
};

  const allEffectCategories = Array.from(new Set(effects.map((effect) => effect.category)));

useEffect(() => {
  const loadBackgroundMusic = async () => {
    if (!user || !user?.uid) return;
    try {
      const userDocRef = doc(db, "users", user?.uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists() && docSnap.data().backgroundMusic) {
        setSelectedMusic(docSnap.data().backgroundMusic);
      }
    } catch (err) {
      console.error("Load background music error:", err);
      setError("Failed to load background music.");
    }
  };
  loadBackgroundMusic();
}, [user]);

useEffect(() => {
  if (selectedMusic) {
    const audio = new Audio(selectedMusic);
    audio.loop = true;
    audio.play().catch(err => console.error("Audio play error:", err));
    return () => audio.pause();
  }
}, [selectedMusic]);

useEffect(() => {
  loadUserData();
}, [user]);

const handleMusicSelect = async (music: { id: string; url: string | null }) => {
  if (!user || !user?.uid) return;

  const selectedMusicOption = musicOptions.find(m => m.id === music.id);
  const isLocked = selectedMusicOption?.locked;
  const isPurchased = purchasedMusic.includes(music.id);
  const isFree = selectedMusicOption?.price === 0;

  if (isLocked && !isPurchased && !isFree) {
    setError("Please purchase this music first.");
    return;
  }

  try {
    setSelectedMusic(music.url);

    const userDocRef = doc(db, "users", user?.uid);
    await updateDoc(userDocRef, {
      profileMusic: music.url,
      updatedAt: new Date().toISOString(),
    });

    // Remove window.location.reload() from handleMusicSelect
    // Instead, rely on state updates
    setSelectedMusic(music.url || null);
    setSuccess("Profile music updated successfully! 🎵");
    setIsMusicModalOpen(false);
  } catch (err) {
    console.error("Save profile music error:", err);
    setError("Failed to save profile music.");
  }
};

// Consolidate loading logic in one useEffect
useEffect(() => {
  if (!user || !user?.uid) return;
  const loadData = async () => {
    try {
      const userDocRef = doc(db, "users", user?.uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setVirtualCurrency(data.virtualCurrency ?? 300);
        setPurchasedVideos(data.purchasedVideos ?? []);
        setPurchasedMusic(data.purchasedMusic ?? []);
        setSelectedVideo(data.backgroundVideo || null);
        setSelectedMusic(data.profileMusic || null); // Use profileMusic
      } else {
        await setDoc(userDocRef, {
          virtualCurrency: 300,
          purchasedVideos: [],
          purchasedMusic: [],
          profileMusic: null,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error("Load data error:", err);
      setError("Failed to load user data.");
    }
  };
  loadData();
}, [user]);


const handleVideoSelect = async (video: { id: string; url: string | null }) => {
  if (!user || !user?.uid) return;
  if (videoOptions.find(v => v.id === video.id)?.locked && !purchasedVideos.includes(video.id) && videoOptions.find(v => v.id === video.id)?.price !== 0) {
    setError("Please purchase this background first.");
    return;
  }
  try {
    setSelectedVideo(video.url);
    const userDocRef = doc(db, "users", user?.uid);
    await updateDoc(userDocRef, {
      backgroundVideo: video.url,
      updatedAt: new Date().toISOString(),
    });
    
    setSelectedVideo(video.url || null);
    window.location.reload();
    setSuccess("Background video updated successfully! 🌟");
    setIsVideoModalOpen(false);

  } catch (err) {
    console.error("Save background video error:", err);
    setError("Failed to save background video.");
  }
};

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // Add this state variable inside the Profile component, after other useState declarations


// Add this useEffect to fetch achievements, after the existing useEffect for auth state
useEffect(() => {
  if (!user || !user?.uid) {
    console.log("No user or UID for achievements");
    return;
  }

  const achievementsRef = collection(db, 'users', user?.uid, 'achievements');
  const unsubscribe = onSnapshot(achievementsRef, (snapshot) => {
    const achievementList: Achievement[] = snapshot.docs.map((doc) => ({
      achievementId: doc.id,
      ...doc.data(),
    } as Achievement));
    setAchievements(achievementList);
  }, (err) => {
    console.error("Achievements fetch error:", err);
    setError("Failed to load achievements.");
  });

  return () => unsubscribe();
}, [user]);

useEffect(() => {
  const loadBackgroundVideo = async () => {
    if (!user || !user?.uid) return;
    try {
      const userDocRef = doc(db, "users", user?.uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists() && docSnap.data().backgroundVideo) {
        setSelectedVideo(docSnap.data().backgroundVideo);
      }
    } catch (err) {
      console.error("Load background video error:", err);
      setError("Failed to load background video.");
    }
  };
  loadBackgroundVideo();
}, [user]);

  // Load avatar from Firestore on mount
useEffect(() => {
  const loadAvatar = async () => {
    if (!user || !user?.uid) {
      console.log("No user or UID for avatar load");
      return;
    }
    try {
      console.log("Loading avatar for UID:", user?.uid);
      const userDoc = doc(db, "users", user?.uid, "profile", "avatar");
      const docSnap = await getDoc(userDoc);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.avatar) {
          console.log("Avatar found:", data.avatar.substring(0, 50) + "...");
          setAvatarURL(data.avatar);
        } else {
          console.log("No avatar data in Firestore");
        }
      } else {
        console.log("No avatar document");
      }
    } catch (err) {
      console.error("Load avatar error:", err);
      setError("Failed to load avatar. Check permissions.");
    }
  };
  loadAvatar();
}, [user]);

  // Load NSFWJS model when modal opens
  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.setBackend("webgl");
        await tf.ready();
        const model = await nsfwjs.load();
        setNsfwModel(model);
        console.log("NSFWJS model loaded");
      } catch (err) {
        console.error("Failed to load NSFWJS model:", err);
        setError("Failed to initialize image validation.");
      }
    };

    if (isAvatarModalOpen) {
      loadModel();
    }

    return () => {
      if (previewURL) {
        URL.revokeObjectURL(previewURL);
        setPreviewURL(null);
      }
    };
  }, [isAvatarModalOpen, previewURL]);

  // Check if image is NSFW
  const isImageNSFW = async (file: File) => {
    if (!nsfwModel) throw new Error("NSFW model not loaded");
    const img = new Image();
    const objectURL = URL.createObjectURL(file);
    img.src = objectURL;

    try {
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error("Failed to load image"));
      });

      const predictions = await nsfwModel.classify(img);
      // Define tags to block
      const nsfwCategories = ["Porn", "Hentai", "Sexy"]; // Customize here
      const threshold = 0.7; // Adjust sensitivity (0.0 to 1.0)

      // Log predictions for debugging
      console.log("NSFW predictions:", predictions);

      const isNSFW = predictions.some(
        (p) => nsfwCategories.includes(p.className) && p.probability > threshold
      );

      if (isNSFW) {
        // Optional: Log the specific category that triggered the block
        const blockedCategory = predictions.find(
          (p) => nsfwCategories.includes(p.className) && p.probability > threshold
        )?.className;
        console.log(`Blocked due to category: ${blockedCategory}`);
      }

      return isNSFW;
    } finally {
      URL.revokeObjectURL(objectURL);
    }
  };

useEffect(() => {
  if (publicMode && uid) {
    const loadPublicProfile = async () => {
      try {
        const publicProfileRef = doc(db, "publicProfiles", uid);
        const docSnap = await getDoc(publicProfileRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const userData = {
            displayName: data.displayName,
            email: data.email,
            photoURL: data.avatar,
            uid,
            metadata: {
              lastSignInTime: data.lastSignInTime || "Unknown",
              creationTime: null, // Explicitly set to null to avoid errors
            },
          };
          setUser(userData);
          setAvatarURL(data.avatar);
          setRegion(data.region);

          // Load avatar from users collection
          const userDoc = doc(db, "users", uid, "profile", "avatar");
          const avatarSnap = await getDoc(userDoc);
          if (avatarSnap.exists()) {
            const avatarData = avatarSnap.data();
            if (avatarData.avatar) {
              setAvatarURL(avatarData.avatar);
            }
          }
        } else {
          setError("Public profile not found.");
        }
      } catch (err) {
        console.error("Public profile error:", err);
        setError("Failed to load public profile.");
      }
    };
    loadPublicProfile();
  } else {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        try {
          await currentUser.getIdToken(true);
          await checkBiometricState(currentUser?.uid);
          setUser(currentUser);

          // Load avatar for authenticated user
          const userDoc = doc(db, "users", currentUser?.uid, "profile", "avatar");
          const docSnap = await getDoc(userDoc);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.avatar) {
              setAvatarURL(data.avatar);
            }
          }
        } catch (err) {
          console.error("Auth error:", err);
        }
      } else {
        setUser(null);
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }
}, [publicMode, uid]);
  
  // Check Firestore for biometric state
  const checkBiometricState = async (uid) => {
    try {
      const userDoc = doc(db, "users", uid);
      const docSnap = await getDoc(userDoc);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setIsBiometric2FAEnabled(data.biometric2FAEnabled || false);
      } else {
        setIsBiometric2FAEnabled(false);
      }
    } catch (err) {
      console.error("Firestore read error:", err.code, err.message);
      setError("Failed to load biometric settings.");
      setIsBiometric2FAEnabled(false);
    }
  };

  // Biometric 2FA
  const initiateBiometricSetup = async () => {
    try {
      if (!user) throw new Error("User not authenticated");
      setShowBiometricSetup(true);
      setError("");
    } catch (err) {
      console.error("Biometric setup error:", err.code, err.message);
      setError("Failed to start biometric setup. Please try again.");
    }
  };

  const registerBiometric = async () => {
    try {
      if (!user) throw new Error("User not authenticated");
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          rp: { name: "LonewolfFSD", id: window.location.hostname },
          user: {
            id: new TextEncoder().encode(user?.uid),
            name: user.email || "user@example.com",
            displayName: user?.displayName || "User",
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
          },
          timeout: 60000,
        },
      });
      console.log("Passkey created:", credential);
  
      // Only set the enabled flag, no need to store credentialId
      await setDoc(doc(db, "users", user?.uid), {
        biometric2FAEnabled: true,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
  
      setIsBiometric2FAEnabled(true);
      setShowBiometricSetup(false);
      setSuccess("Biometric 2FA enabled successfully! You're now a cyber-wolf 🐺");
    } catch (err) {
      console.error("Biometric registration error:", err.name, err.message);
      setError("Failed to enable biometric 2FA. Ensure your device supports biometrics or try again.");
    }
  };

  const verifyBiometric = async () => {
    if (!auth?.currentUser) {
      console.log("No authenticated user");
      throw new Error("User not authenticated.");
    }
    const uid = auth?.currentUser?.uid;
    try {
      console.log("Verifying biometric for UID:", uid);
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          rpId: window.location.hostname,
          userVerification: "required",
          allowCredentials: [], // Let browser select platform credential
          timeout: 60000,
        },
      });
      console.log("Biometric verified:", credential);
      return !!credential;
    } catch (err) {
      console.error("Verify biometric error for UID:", uid, err.name, err.message);
      if (err.name === "NotAllowedError") {
        throw new Error("Biometric verification was cancelled or not allowed.");
      } else if (err.name === "InvalidStateError") {
        throw new Error("Biometric credential is invalid or not registered.");
      } else {
        throw new Error(`Failed to verify biometrics: ${err.message}`);
      }
    }
  };

  const handleFileChange = async (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      setPreviewURL("");
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setCroppedAreaPixels(null);
      return;
    }
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    const maxSize = 5 * 1024 * 1024;
    console.log("File type:", file.type, "Size:", file.size);
    if (!validTypes.includes(file.type)) {
      setError("Please upload a JPEG, PNG, WEBP, or JPG image.");
      return;
    }
    if (file.size > maxSize) {
      setError("Image size must be under 5MB.");
      return;
    }
    try {
      const isNSFW = await isImageNSFW(file);
      if (isNSFW) {
        setError("Inappropriate content detected. Please upload a different image.");
        setPreviewURL("");
        setSelectedFile(null);
        return;
      }

      const url = URL.createObjectURL(file);
      setPreviewURL(url);
      setSelectedFile(file);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setCroppedAreaPixels(null);
    } catch (err) {
      setError("Failed to validate image.");
      setPreviewURL("");
      setSelectedFile(null);
    }
  };

  const getCroppedImg = async (imageSrc: string, pixelCrop: Area, rotation: number): Promise<File> => {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => (image.onload = resolve));

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  canvas.width = safeArea;
  canvas.height = safeArea;

  if (!ctx) throw new Error("Canvas context not available");

  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-safeArea / 2, -safeArea / 2);

  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  );

  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(new File([blob], "cropped-image.jpg", { type: "image/jpeg" }));
      } else {
        throw new Error("Failed to create blob");
      }
    }, "image/jpeg");
  });
};

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileChange(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] || null;
    handleFileChange(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };
  

  const handleUpload = async () => {
  if (!selectedFile || !auth?.currentUser || !croppedAreaPixels) {
    setError("No file selected, not signed in, or image not cropped.");
    return;
  }
  try {
    setUploadProgress(0);
    console.log("Uploading for UID:", auth?.currentUser?.uid);

    // Generate cropped image
    const croppedFile = await getCroppedImg(previewURL, croppedAreaPixels, rotation);

    // Validate cropped image for NSFW
    const isNSFW = await isImageNSFW(croppedFile);
    if (isNSFW) {
      setError("Inappropriate content detected in cropped image.");
      return;
    }

    // Convert cropped file to base64
    const reader = new FileReader();
    reader.readAsDataURL(croppedFile);
    reader.onload = async () => {
      const base64 = reader.result as string;
      console.log("Base64 length:", base64.length);
      const userDoc = doc(db, "users", auth?.currentUser!.uid, "profile", "avatar");
      await setDoc(userDoc, { avatar: base64 }, { merge: true });
      setAvatarURL(base64);
      setSuccess("Avatar updated! You're rocking a new vibe! 🌟");
      setIsAvatarModalOpen(false);
      setSelectedFile(null);
      setPreviewURL("");
      setUploadProgress(100);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setCroppedAreaPixels(null);
    };
    reader.onerror = () => {
      setError("Failed to read file.");
    };
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        const progress = (e.loaded / e.total) * 100;
        setUploadProgress(progress);
      }
    };
  } catch (err) {
    console.error("Upload error:", err.code, err.message);
    setError(`Failed to upload avatar: ${err.code || err.message}`);
  }
};

  // Privacy & Security
  const [connectedAccounts, setConnectedAccounts] = useState<string[]>([]);
  const [recentLogins, setRecentLogins] = useState<string[]>([]);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [secretKey] = useState(() => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    const length = 32;
    let secret = "";
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      secret += chars[array[i] % chars.length];
    }
    return secret;
  });

  const initiate2FA = async () => {
    try {
      const multiFactorSession = await multiFactor(user).getSession();
      const secret = await TotpMultiFactorGenerator.generateSecret(multiFactorSession);
      const uri = secret.generateQrCodeUrl(`MyCoolApp:${user.email}`, "MyCoolApp");
      setTotpUri(uri);
      setTotpSecret(secret);
      setShowQRCode(true);
    } catch (err) {
      console.error("2FA init error:", err.code, err.message);
      setError("Failed to start 2FA setup. Please try again.");
    }
  };

  const handleVerifyCode = useCallback(async () => {
    setIsVerifying(true);
    try {
      if (!verificationCode) throw new Error("Verification code is missing");
      if (!user || !totpSecret) throw new Error("User or TOTP secret not available");
      const multiFactorAssertion = TotpMultiFactorGenerator.assertionForEnrollment(
        totpSecret,
        verificationCode
      );
      await multiFactor(user).enroll(multiFactorAssertion, "TOTP");
      setIs2FAEnabled(true);
      setShowQRCode(false);
      setSuccess("2FA has been enabled successfully!");
    } catch (err) {
      console.error("2FA verify error:", err.code, err.message);
      setError(err.message || "Invalid code or failed to enable 2FA.");
    } finally {
      setIsVerifying(false);
    }
  }, [verificationCode, user, totpSecret]);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        try {
          await currentUser.getIdToken(true);
          await checkBiometricState(currentUser?.uid);
        } catch (err) {
          console.error("Auth error:", err.code, err.message);
        }
      }
      setUser(currentUser);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

useEffect(() => {
  if (!user || !user?.uid) {
    console.log("No user or UID for notifications");
    return;
  }

  const q = query(
    collection(db, 'notifications'),
    where('recipient', '==', user?.uid)
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

  const [userRole, setUserRole] = useState<string | null>(null);
  // Fetch current user's role
  useEffect(() => {
    const fetchUserRole = async () => {
      const auth = getAuth();
      const user = auth?.currentUser;
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user?.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role || 'user');
          } else {
            setUserRole('user');
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          setUserRole('user');
        }
      }
    };
    fetchUserRole();
  }, []);

  const handlePurchaseRealMoneyVideo = async (video: { id: string; name: string; priceINR: number; url: string }) => {
  if (!user || !user?.uid) {
    setToast({ message: "You must be signed in to purchase videos.", type: "error" });
    return;
  }

  const res = await loadRazorpayScript();
  if (!res) {
    setToast({ message: "Razorpay SDK failed to load.", type: "error" });
    return;
  }

  const purchaseDate = new Date().toLocaleString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_live_y2c1NPOWRBIcgH",
    amount: (video.priceINR || 0) * 100,
    currency: "INR",
    name: "LonewolfFSD",
    description: `Purchase Video: ${video.name}`,
    handler: async function (response: any) {
      try {
        const userRef = doc(db, "users", user?.uid);
        const purchaseRef = doc(collection(db, `users/${user?.uid}/purchases`));
        await runTransaction(db, async (transaction) => {
          const userDoc = await transaction.get(userRef);
          if (!userDoc.exists()) {
            throw new Error("User document not found.");
          }
          transaction.update(userRef, {
            purchasedVideos: arrayUnion(video.id),
            updatedAt: new Date().toISOString(),
          });
          transaction.set(purchaseRef, {
            type: "video",
            name: video.name,
            amount: video.priceINR,
            paymentType: "real_money",
            transactionId: response.razorpay_payment_id,
            date: purchaseDate,
            url: video.url,
            createdAt: new Date().toISOString(),
            paymentMethod: response.razorpay_payment_method || 'unknown',
            contact: response.razorpay_contact || user?.phoneNumber || 'unknown',
            status: 'success',
          });
        });

        setPurchasedVideos((prev) => [...prev, video.id]);
        setVideoPurchaseDetails({
          id: video.id,
          name: video.name,
          url: video.url,
          priceINR: video.priceINR,
          paymentType: "real_money",
          transactionId: response.razorpay_payment_id,
          date: purchaseDate,
        });
        setToast({ message: `Purchased "${video.name}" successfully! 🌟`, type: "success" });
      } catch (error) {
        console.error("Firestore update error:", error);
        setToast({ message: "Failed to save purchase. Contact support.", type: "error" });
      }
    },
    modal: {
      ondismiss: () => {
        setToast({ message: "Payment cancelled.", type: "error" });
      },
    },
    prefill: {
      name: user?.displayName || 'Client',
      email: user?.email || '',
      contact: user?.phoneNumber || '',
    },
    theme: {
      color: "#000000",
    },
  };

  try {
    const rzp = new (window as any).Razorpay(options);
    rzp.on("payment.failed", function (response: any) {
      setToast({ message: `Payment failed: ${response.error.description}`, type: "error" });
    });
    rzp.open();
  } catch (err) {
    console.error("Razorpay error:", err);
    setToast({ message: "Failed to initiate payment.", type: "error" });
  }
};



  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      navigate("/auth");
      return;
    }
    const providerData = user.providerData;
    setIsPasswordProvider(providerData.some((provider) => provider.providerId === "password"));
    const providers = providerData.map((provider) => {
      if (provider.providerId === "google.com") return "Google";
      if (provider.providerId === "github.com") return "GitHub";
      if (provider.providerId === "password") return "Email/Password";
      return provider.providerId;
    });
    setConnectedAccounts(providers);
    setRecentLogins([`Login from ${deviceName} at ${new Date().toLocaleString()}`]);
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setRegion(timezone);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=9eb5efc401894a488b588db23153bb49`
            );
            const data = await response.json();
            const address = data.features[0]?.properties.formatted;
            setLocation(address || "Address not found");
          } catch (error) {
            setLocation("Address lookup failed");
          }
        },
        () => {
          setLocation("Location access denied");
        }
      );
    } else {
      setLocation("Geolocation not supported");
    }
  }, [user, navigate, deviceName, isAuthLoading]);

  useEffect(() => {
    const getDeviceName = () => {
      const ua = navigator.userAgent;
      if (/iPhone|iPad|iPod/i.test(ua)) {
        if (/iPhone/.test(ua)) {
          return /CPU iPhone OS ([0-9_]+)/.test(ua) ? "iPhone" : "iPhone (Unknown Model)";
        } else if (/iPad/.test(ua)) {
          return "iPad";
        } else {
          return "iPod";
        }
      } else if (/Android/i.test(ua)) {
        const match = ua.match(/Android.*; ([^)]+)/);
        return match && match[1] ? `Android (${match[1]})` : "Android Device";
      }
      if (/Windows NT/i.test(ua)) {
        return "Windows PC";
      } else if (/Macintosh/i.test(ua)) {
        return "Mac";
      } else if (/Linux/i.test(ua) && !/Android/i.test(ua)) {
        return "Linux PC";
      }
      return "Unknown Device";
    };
    setDeviceName(getDeviceName());
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/auth");
    } catch (err: any) {
      console.error("Sign-out error:", err.code, err.message);
      alert("Failed to sign out. Please try again.");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!isPasswordProvider) {
      setError("Password changes are only available for email/password accounts.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (!password) {
      setError("Please enter your current password.");
      return;
    }
    try {
      console.log("Validating current password for UID:", user!.uid);
      const credential = EmailAuthProvider.credential(user!.email!, password);
      await reauthenticateWithCredential(user!, credential);
      console.log("Current password validated");
      if (isBiometric2FAEnabled) {
        console.log("Biometric 2FA enabled, showing modal for UID:", user!.uid);
        setIsBiometricModalOpen(true);
        return;
      }
      await updatePassword(user!, newPassword);
      setSuccess("Password updated successfully! You're locked in! 🔒");
      setPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error("Password validation error:", err);
      if (err.code === "auth/invalid-credential") {
        setError("Incorrect current password. Please try again.");
      } else if (err.code === "auth/password-does-not-meet-requirements") {
        setError("Password didn't match the requirements.");
      } else {
        setError(err.message || "Failed to validate password.");
      }
    }
  };
  
  const handleBiometricVerify = async () => {
    try {
      setIsVerifying(true);
      setBiometricError("");
      setSuccess("");
      console.log("Verifying biometric for UID:", user!.uid);
      const verified = await verifyBiometric();
      console.log("Verification result:", verified);
      if (verified) {
        console.log("Biometric verification passed");
        // Reauthenticate again as a safety check (optional, since validated in handleChangePassword)
        const credential = EmailAuthProvider.credential(user!.email!, password);
        await reauthenticateWithCredential(user!, credential);
        await updatePassword(user!, newPassword);
        setSuccess("Password updated successfully! You're locked in! 🔒");
        setPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setIsBiometricModalOpen(false);
      } else {
        setBiometricError("Biometric verification failed. Try again.");
      }
    } catch (err: any) {
      console.error("Biometric verify error:", err);
      if (err.code === "auth/invalid-credential") {
        setBiometricError("Current password is incorrect. Please re-enter it.");
      } else if (err.code === "auth/password-does-not-meet-requirements") {
        setBiometricError("New Password doesn't meet the requirements.");
      } else {
        setBiometricError(err.message || "Failed to verify biometrics. Try again or skip.");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDeleteAccount = async () => {
    setModalOpen(true);
  };

    const [isCopied, setIsCopied] = useState(false);

    const onShareClick = async () => {
  if (!user?.uid) return;
  const shareUrl = `${window.location.origin}/profile/${user.uid}`;
  try {
    await navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    setToast({ message: "Profile link copied!", type: "success" });
    setTimeout(() => setIsCopied(false), 3000); // Reset after 3s
  } catch (err) {
    console.error("Copy failed:", err);
    setToast({ message: "Failed to copy link.", type: "error" });
  }
};

  const handleShare = async () => {
    try {
      const publicProfileRef = doc(db, "publicProfiles", user?.uid);
      await setDoc(publicProfileRef, {
        avatar: avatarURL || user?.photoURL,
        displayName: user?.displayName,
        email: user?.email,
        region: region,
        lastSignInTime: user?.metadata.lastSignInTime,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      const shareLink = `${window.location.origin}/public-profile/${user?.uid}`;
      navigator.clipboard.writeText(shareLink);
      setSuccess("Shareable link copied to clipboard!");
    } catch (err) {
      setError("Failed to generate shareable link.");
    }
  };

  const [videoPurchaseDetails, setVideoPurchaseDetails] = useState<{
  id: string;
  name: string;
  url: string;
  price?: number;
  priceINR?: number;
  paymentType: "credits" | "real_money";
  transactionId: string;
  date: string;
} | null>(null);

useEffect(() => {
  if (videoPurchaseDetails) {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });
  }
}, [videoPurchaseDetails]);

  const [purchasedEffects, setPurchasedEffects] = useState<string[]>([]);

useEffect(() => {
  if (effectPurchaseDetails) {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });
  }
}, [effectPurchaseDetails]);

const handlePurchaseEffect = async (effect: Effect) => {
  if (!user || !user?.uid) {
    setToast({ message: "You must be signed in to purchase effects.", type: "error" });
    return;
  }
  if (virtualCurrency < effect.price) {
    setToast({ message: `Insufficient credits to purchase "${effect.name}". Need ${effect.price} credits, but you have ${virtualCurrency}.`, type: "error" });
    return;
  }
  try {
    const userRef = doc(db, "users", user?.uid);
    const purchaseRef = doc(collection(db, `users/${user?.uid}/purchases`));
    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const purchaseDate = new Date().toLocaleString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists()) {
        throw new Error("User document not found.");
      }
      const currentCurrency = userDoc.data().virtualCurrency ?? 0;
      if (currentCurrency < effect.price) {
        throw new Error(`Insufficient credits. ${currentCurrency} available, need ${effect.price}`);
      }
      transaction.update(userRef, {
        virtualCurrency: currentCurrency - effect.price,
        purchasedEffects: arrayUnion(effect.id),
        updatedAt: new Date().toISOString(),
      });
      transaction.set(purchaseRef, {
        type: "effect",
        name: effect.name,
        amount: effect.price,
        paymentType: "credits",
        transactionId,
        date: purchaseDate,
        url: effect.url,
        createdAt: new Date().toISOString(),
        status: "success",
      });
    });
    setVirtualCurrency((prev) => prev - effect.price);
    setPurchasedEffects((prev) => [...prev, effect.id]);
    setEffectPurchaseDetails({
      id: effect.id,
      name: effect.name,
      url: effect.url,
      price: effect.price,
      paymentType: "credits",
      transactionId,
      date: purchaseDate,
    });
    setToast({ message: `Purchased "${effect.name}" successfully! 🌟`, type: "success" });
  } catch (error) {
    console.error("Purchase effect error:", error);
    setToast({ message: error.message || "Failed to purchase effect. Try again.", type: "error" });
  }
};

  const filteredEffects = effects.filter(
    (effect) =>
      effect.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedEffectCategories.length === 0 || selectedEffectCategories.includes(effect.category))
  );

  const handleEffectSelect = (effect: Effect) => {
    if (!purchasedEffects.includes(effect.id) && effect.price > 0) {
      setToast({ message: `Purchase "${effect.name}" first!`, type: "error" });
      return;
    }
    toggleEffect(effect); // Only call toggleEffect, don’t set selectedEffect here
  };

const toggleEffect = async (effect: Effect | null) => {
  if (!user || !user?.uid) {
    setToast({ message: "User not authenticated.", type: "error" });
    return;
  }
  if (effect && !purchasedEffects.includes(effect.id) && effect.price > 0) {
    setToast({ message: `Purchase "${effect.name}" first!`, type: "error" });
    return;
  }
  try {
    const userRef = doc(db, "users", user?.uid);
    const effectToSave = effect
      ? { ...effects.find((e) => e.id === effect.id)!, url: effects.find((e) => e.id === effect.id)!.url }
      : null; // Ensure url is resolved
    await runTransaction(db, async (transaction) => {
      transaction.update(userRef, {
        activeEffect: effectToSave,
        updatedAt: new Date().toISOString(),
      });
    });
    setActiveEffect(effectToSave);
    setSelectedEffect(effectToSave ? effectToSave.url : null);
    setIsEffectInteractable(false);
    if (effectToSave) {
      setToast({ message: `Applied "${effectToSave.name}"!`, type: "success" });
    }
  } catch (error) {
    console.error("Toggle effect error:", error);
    setToast({ message: "Failed to apply effect. Try again.", type: "error" });
  }
};

  const handleEffectClick = () => {
    setIsEffectInteractable(true);
  };

  const handlePurchaseRealMoneyEffect = async (effect: Effect) => {
  if (!user || !user?.uid) {
    setToast({ message: "User not authenticated.", type: "error" });
    return;
  }
  if (!effect.priceINR) {
    setToast({ message: "Price not available.", type: "error" });
    return;
  }
  const res = await loadRazorpayScript();
  if (!res) {
    setToast({ message: "Razorpay SDK failed to load.", type: "error" });
    return;
  }
  const purchaseDate = new Date().toLocaleString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_live_y2c1NPOWRBIcgH",
    amount: effect.priceINR * 100,
    currency: "INR",
    name: "LonewolfFSD",
    description: `Purchase ${effect.name} Effect`,
    handler: async function (response: any) {
      try {
        const userRef = doc(db, "users", user?.uid);
        const purchaseRef = doc(collection(db, `users/${user?.uid}/purchases`));
        await runTransaction(db, async (transaction) => {
          transaction.update(userRef, {
            purchasedEffects: arrayUnion(effect.id),
            updatedAt: new Date().toISOString(),
          });
          transaction.set(purchaseRef, {
            type: "effect",
            name: effect.name,
            amount: effect.priceINR,
            paymentType: "real_money",
            transactionId: response.razorpay_payment_id,
            date: purchaseDate,
            url: effect.url,
            createdAt: new Date().toISOString(),
            paymentMethod: response.razorpay_payment_method || "unknown",
            contact: response.razorpay_contact || user?.phoneNumber || "unknown",
            status: "success",
          });
        });
        setPurchasedEffects((prev) => [...prev, effect.id]);
        setEffectPurchaseDetails({
          id: effect.id,
          name: effect.name,
          url: effect.url,
          price: effect.priceINR,
          paymentType: "real_money",
          transactionId: response.razorpay_payment_id,
          date: purchaseDate,
        });
        setToast({ message: `Purchased "${effect.name}" successfully! 🌟`, type: "success" });
      } catch (error) {
        console.error("Purchase effect error:", error);
        setToast({ message: "Failed to purchase effect. Try again.", type: "error" });
      }
    },
    modal: { ondismiss: () => setToast({ message: "Payment cancelled.", type: "error" }) },
    prefill: {
      name: user?.displayName || "Client",
      email: user?.email || "",
      contact: user?.phoneNumber || "",
    },
    theme: { color: "#000000" },
  };
  try {
    const rzp = new (window as any).Razorpay(options);
    rzp.on("payment.failed", (err: any) => {
      setToast({ message: `Payment failed: ${err.error.description}`, type: "error" });
    });
    rzp.open();
  } catch (err) {
    console.error("Razorpay error:", err);
    setToast({ message: "Failed to initiate payment.", type: "error" });
  }
};

  // Add this useEffect to award a sample achievement on first login, after the useEffect for deviceName

  const accountLogos: Record<string, string> = {
    Google: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/2048px-Google_%22G%22_logo.svg.png",
    Microsoft: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Microsoft_icon.svg/768px-Microsoft_icon.svg.png",
    GitHub: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
  };

  const connectedAccountInfo: Record<string, { name: string; logo: string }> = {
    "microsoft.com": {
      name: "Microsoft",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Microsoft_icon.svg/768px-Microsoft_icon.svg.png",
    },
    "Google": {
      name: "Google",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/2048px-Google_%22G%22_logo.svg.png",
    },
    "GitHub": {
      name: "GitHub",
      logo: "https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg",
    }
  };

  const confirmDelete = async () => {
    try {
      const currentUser = auth?.currentUser;
      if (!currentUser) throw new Error("No user signed in");
      await currentUser.getIdToken(true);
      await deleteUser(currentUser);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Failed to delete account");
    }
  };

    const [notifications, setNotifications] = useState<Notification[]>([]);

    const handleLoopWithDelay = () => {

  const delayMs = 10000; // 2-second delay

  setTimeout(() => {
    if (videoEffectRef.current) {
      videoEffectRef.current.currentTime = 0;
      videoEffectRef.current.play();
    }
  }, delayMs);
};

  const profileOptions = [
    { label: t('Profile'), icon: User, action: () => navigate('/profile') },
    { label: t('Admin Panel'), icon: Settings, action: () => navigate("/gmpXRP05issfL14jWssIcxKOREJUNYwMwaS7mbQv69DAZ78N29"), adminOnly: true },
    { label: t('Purchase History'), icon: Wallet, action: () => navigate("/purchase-history") },
    { label: t("Enquiry Listing"), icon: Inbox, action: () => navigate("/enquiries"), adminOnly: true },
    { label: t('Log Out'), icon: LogOut, action: () => signOut(auth).then(() => navigate('/')) },
  ];



  useEffect(() => {
    const handleVideoPlayback = () => {
      if (videoRef.current) {
        if (window.innerWidth < 640) {
          videoRef.current.pause();
        } else {
          videoRef.current.play();
        }
      }
    };

    // Run once on mount
    handleVideoPlayback();

    // Optional: handle resize too
    window.addEventListener("resize", handleVideoPlayback);
    return () => window.removeEventListener("resize", handleVideoPlayback);
  }, []);



  return (
    <div className="min-h-screen flex flex-col relative">

              {activeEffect && (
                <video
                  key={activeEffect.url} // Force re-render on URL change
                  preload="auto"
                  autoPlay
                  ref={(el) => (videoEffectRef.current = el)}
                  className="fixed inset-0 w-full h-full object-cover z-50"
                  style={{ pointerEvents: isEffectInteractable ? "auto" : "none" }}
                  muted
                  onEnded={handleLoopWithDelay}
                  onClick={handleEffectClick}
                  onError={(e) => console.error("Video overlay error:", e)}
                  onLoadStart={() => console.log("Overlay video load started:", activeEffect.url)} // Debug
                >
                  <source src={activeEffect.url} type="video/webm" />
                  <source
                    src={
                      activeEffect.url.endsWith(".webm")
                        ? activeEffect.url.replace(".webm", ".mp4")
                        : activeEffect.url
                    }
                    type="video/webm"
                  />
                  Your browser does not support the video tag.
                </video>
              )}
          

    {selectedVideo && (
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0"
      >
        <source src={selectedVideo} type="video/mp4" />
      </video>
    )}
      
      <Helmet>
        <title>{user?.displayName || "User"}'s Profile</title>
        <link rel="canonical" href="https://lonewolffsd.in/profile" />
      </Helmet>

      <DeleteAccountModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onDelete={confirmDelete}
      />



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
          <Link to="/contact">
                    <motion.button
                      className={`px-6 hidden md:block hover:px-8 transition-all py-2 rounded-full font-semibold ${isDark ? 'bg-white text-black hover:bg-gray-100' : 'bg-black text-white hover:bg-gray-900'} flex items-center gap-2`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8, duration: 0.5 }}
                    >
                      {t("Let's Connect")}
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
                                className={`absolute top-full right-6 w-64 mt-[-20px] border border-black/20 rounded-2xl shadow-lg z-10 transition-all transform origin-top-right ${
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
                                      <span className='border border-black mr-2'>{languages.find((lang) => lang.code === selectedLanguage)?.flag}</span>
                                      {languages.find((lang) => lang.code === selectedLanguage)?.label}
                                    </button>
                                    {isLangDropdownOpen && (
                                      <motion.ul
                                        className={`absolute top-full left-4 w-full border border-black/40 rounded-lg shadow-lg z-50 ${
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
                                            <span className='border border-black mr-2'>{lang.flag}</span>
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

            <div className="absolute inset-0 z-50 pointer-events-none">
    <div className="relative h-[800px] w-full overflow-hidden">
      <DotPatternWithGlowEffectDemo />
    </div>
  </div>


      <div className={`flex min-h-screen items-center justify-center ${selectedVideo ? 'px-3 md:px-6' : 'px-2 md:px-6'}  py-20 bg-transparent z-0`}>


      <motion.div
        className={`w-full max-w-5xl -mt-14 ${publicMode ? 'md:-mt-36' : 'md:-mt-10'} px-6 ${selectedVideo ? 'py-10' : ''} md:py-16 md:px-12 rounded-2xl md:rounded-xl backdrop-blur-lg md:border md:border-black ${selectedVideo ? 'bg-black/60' : 'bg-white'} relative z-10`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
<h2
      className={`text-[30px] font-bold mb-6 text-left ${selectedVideo ? 'text-white' : 'text-black'}  tracking-tight`}
      style={{ fontFamily: "Poppins" }}
    >
      {publicMode ? publicUserData?.displayName : user?.displayName}'s {t('Profile')}
      {/* <motion.button
  onClick={onShareClick}
  className={`p-2 ml-2.5 bg-gray-400/20 shadow-md border border-gray-500 rounded-full cursor-custom-pointer inline-flex items-center justify-center group ${publicMode ? 'hidden' : ''}`}
  whileHover={{ scale: 1.01 }}
  whileTap={{ scale: 0.95 }}
>
  <span className="flex items-center md:gap-[2px] md:group-hover:gap-1 transition-all duration-300 md:group-hover:px-3 md:group-hover:py-0">
    {isCopied ? (
      <>
        <Check
          size={19}
          className="transition-transform duration-300 md:ml-[1px] md:group-hover:ml-0"
          style={{ transform: "rotate(0deg)" }}
        />
        <span
          className="hidden md:inline overflow-hidden max-w-0 md:group-hover:max-w-[120px] opacity-0 md:group-hover:opacity-100 transition-all duration-300 ease-in-out"
          style={{ fontFamily: "Inter" }}
        >
          <p className="text-[14px] font-semibold whitespace-nowrap">Copied</p>
        </span>
      </>
    ) : (
      <>
        <Link2
          size={19}
          className="transition-transform duration-300 md:ml-[1px] md:group-hover:ml-0"
          style={{ transform: "rotate(-45deg)" }}
        />
        <span
          className="hidden md:inline overflow-hidden max-w-0 md:group-hover:max-w-[120px] opacity-0 md:group-hover:opacity-100 transition-all duration-300 ease-in-out"
          style={{ fontFamily: "Inter" }}
        >
          <p className="text-[14px] font-semibold whitespace-nowrap">Share Profile</p>
        </span>
      </>
    )}
  </span>
</motion.button> */}
    </h2>

          {/* Profile Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          <div className="relative  flex justify-left col-span-2">
              <div className="relative group">
                <motion.img
                title={publicMode ? undefined : "Change Avatar"}
                src={
                  avatarURL || 
                  user?.photoURL ||
                  "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg"
                }
                alt="Avatar"
                className="w-40 h-40 cursor-custom-pointer rounded-2xl bg-gray-200 object-cover p-1.5 border border-black"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                onClick={publicMode ? undefined : () => setIsAvatarModalOpen(true)}
              />

              {/* Pencil Icon - Hidden in public mode */}
              {!publicMode && (
                <div
                  className="absolute top-3 cursor-custom-pointer left-3 text-black border border-black bg-white/80 rounded-full p-2 shadow-md group-hover:opacity-100 opacity-0"
                >
                  <Pencil size={16} />
                </div>
              )}
              </div>
          </div>

            <h3 className={`text-2xl md:text-lg font-bold md:mt-3 mt-8 ${publicMode ? 'col-span-2' : 'col-span-2'} ${selectedVideo ? 'text-white' : 'text-black'}`} style={{ fontFamily: 'Poppins'}}>{t('Personal Details')}</h3>

            <div className={`flex items-start border border-gray-200 rounded-xl px-4 py-3.5 space-x-3 col-span-2 md:col-span-1`}>
              <div className="pt-1"><User className={`${selectedVideo ? 'text-white' : 'text-gray-700'} w-5 h-5`} /></div>
              <div>
                <p className={`text-xs ${selectedVideo ? 'text-white' : 'text-gray-500'}`}>{t('Name')}</p>
                <p className={`${selectedVideo ? 'text-white' : 'text-black'} font-medium text-sm break-words`}>{user?.displayName || "Not set"}</p>
              </div>
            </div>

            <div className="flex items-start border border-gray-200 rounded-xl px-4 py-3.5 space-x-3 col-span-2 md:col-span-1">
              <div className="pt-1"><Mail className={`${selectedVideo ? 'text-white' : 'text-gray-700'} w-5 h-5`} /></div>
              <div>
                <p className={`text-xs ${selectedVideo ? 'text-white' : 'text-gray-500'}`}>{t('Email')}</p>
                <p className={`${selectedVideo ? 'text-white' : 'text-black'} font-medium text-sm break-words`}>{user?.email || "Unknown"}</p>
              </div>
            </div>

            <div className="flex items-start border border-gray-200 rounded-xl px-4 py-3.5 space-x-3 col-span-2 md:col-span-1">
              <div className="pt-1"><ShieldCheck className={`${selectedVideo ? 'text-white' : 'text-gray-700'} w-5 h-5`} /></div>
              <div>
                <p className={`text-xs ${selectedVideo ? 'text-white' : 'text-gray-500'}`}>{t('Email Verified')}</p>
                <p className={`${selectedVideo ? 'text-white' : 'text-black'} font-medium text-sm break-words`}>{user?.emailVerified ? t("Yes") : t("No")}</p>
              </div>
            </div>

            <div className="flex items-start border border-gray-200 rounded-xl px-4 py-3.5 space-x-3 col-span-2 md:col-span-1">
              <div className="pt-1"><Calendar className={`${selectedVideo ? 'text-white' : 'text-gray-700'} w-5 h-5`} /></div>
              <div>
                <p className={`text-xs ${selectedVideo ? 'text-white' : 'text-gray-500'}`}>{t('Last Login')}</p>
                <p className={`${selectedVideo ? 'text-white' : 'text-black'} font-medium text-sm break-words`}>{publicMode ? user?.metadata?.lastSignInTime || "Unknown" : user?.metadata?.lastSignInTime || "Unknown"}</p>
              </div>
            </div>

            <div className="flex items-start border border-gray-200 rounded-xl px-4 py-3.5 space-x-3 col-span-2 md:col-span-1">
              <div className="pt-1"><Globe className={`${selectedVideo ? 'text-white' : 'text-gray-700'} w-5 h-5`} /></div>
              <div>
                <p className={`text-xs ${selectedVideo ? 'text-white' : 'text-gray-500'}`}>{t('Region')}</p>
                <p className={`${selectedVideo ? 'text-white' : 'text-black'} font-medium text-sm break-words`}>{region}</p>
              </div>
            </div>

            {/* Sensitive info - Hidden in public mode */}

                <div className={`flex items-start border border-gray-200 ${publicMode ? 'hidden' : 'block'}  rounded-xl px-4 py-3.5 space-x-3 col-span-2 md:col-span-1`}>
                    <div className="pt-1"><LocateFixed className={`${selectedVideo ? 'text-white' : 'text-gray-700'} w-5 h-5`} /></div>
                    <div>
                      <p className={`text-xs ${selectedVideo ? 'text-white' : 'text-gray-500'}`}>{t('Location')}</p>
                      <p className={`${selectedVideo ? 'text-white' : 'text-black'} font-medium text-sm break-words`}>{location}</p>
                    </div>
                  </div>

                  <div className="flex items-start border border-gray-200 rounded-xl px-4 py-3.5 space-x-3 col-span-2 md:col-span-1">
                    <div className="pt-1"><Clock className={`${selectedVideo ? 'text-white' : 'text-gray-700'} w-5 h-5`} /></div>
                    <div>
                      <p className={`text-xs ${selectedVideo ? 'text-white' : 'text-gray-500'}`}>{t('Current Time')}</p>
                      <p className={`${selectedVideo ? 'text-white' : 'text-black'} font-medium text-sm break-words`}>{currentTime}</p>
                    </div>
                  </div>


                  <div className="flex items-start border border-gray-200 rounded-xl px-4 py-3.5 space-x-3 col-span-2 md:col-span-1">
                    <div className="pt-1">
                      {deviceName === "iPhone" ? (
                        <Phone className={`${selectedVideo ? 'text-white' : 'text-gray-700'} w-5 h-5`} />
                      ) : deviceName === "Windows PC" ? (
                        <Monitor className={`${selectedVideo ? 'text-white' : 'text-gray-700'} w-5 h-5`} />
                      ) : deviceName === "Linux PC" ? (
                        <Monitor className={`${selectedVideo ? 'text-white' : 'text-gray-700'} w-5 h-5`} />
                      ) : deviceName.includes("Android") ? (
                        <Phone className={`${selectedVideo ? 'text-white' : 'text-gray-700'} w-5 h-5`} />
                      ) : (
                        <User className={`${selectedVideo ? 'text-white' : 'text-gray-700'} w-5 h-5`} />
                      )}
                    </div>
                    <div>
                      <p className={`text-xs ${selectedVideo ? 'text-white' : 'text-gray-500'}`}>{t('Device')}</p>
                      <p className={`${selectedVideo ? 'text-white' : 'text-black'} font-medium text-sm break-words`}>{deviceName}</p>
                    </div>
                  </div>

                  {!publicMode && (
                    <div className="flex items-start border border-gray-200 rounded-xl px-4 py-3.5 space-x-3 col-span-2 md:col-span-1">
                      <div className="pt-1"><Calendar className={`${selectedVideo ? 'text-white' : 'text-gray-700'} w-5 h-5`} /></div>
                      <div>
                        <p className={`text-xs ${selectedVideo ? 'text-white' : 'text-gray-500'}`}>{t('Account Created')}</p>
                        <p className={`${selectedVideo ? 'text-white' : 'text-black'} font-medium text-sm break-words`}>
                          {user?.metadata?.creationTime
                            ? new Date(user?.metadata.creationTime).toLocaleDateString()
                            : "Unknown"}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className={`flex items-start border border-gray-200 rounded-xl px-4 py-3.5 space-x-3 col-span-2 md:col-span-1 ${publicMode ? 'hidden' : 'block'}`}>
                    <div className="pt-1"><BadgeCheck className={`${selectedVideo ? 'text-white' : 'text-gray-700'} w-5 h-5`} /></div>
                    <div>
                      <p className={`text-xs ${selectedVideo ? 'text-white' : 'text-gray-500'}`}>{t("Member Status")}</p>
                      <p className={`${selectedVideo ? 'text-white' : 'text-black'} font-medium text-sm break-all`}>{userRole || "user"}</p>
                    </div>
                  </div>

                  <div className={`flex items-start border border-gray-200 rounded-xl px-4 py-3.5 space-x-3 col-span-2 ${publicMode ? 'hidden' : 'block'}`}>
                    <div className="pt-1"><UserCog className={`${selectedVideo ? 'text-white' : 'text-gray-700'} w-5 h-5`} /></div>
                    <div>
                      <p className={`text-xs ${selectedVideo ? 'text-white' : 'text-gray-500'}`}>{t("FSD ID")}</p>
                      <p className={`${selectedVideo ? 'text-white' : 'text-black'} font-medium text-sm break-all`}>{user?.uid}</p>
                    </div>
                  </div>

                  {userRole === "client" && !publicMode && (
                    <hr className="my-3 opacity-20" />
                  )}

                  {userRole === "client" && !publicMode && (
                    <div className="flex flex-col md:flex-row items-left md:items-center justify-left md:justify-between border border-gray-200 rounded-xl px-4 py-3.5 col-span-2">
                      <div className="flex items-start space-x-3">
                        <div className="pt-1">
                          <UserCog className={`${selectedVideo ? 'text-white' : 'text-gray-700'} w-5 h-5`} />
                        </div>
                        <div>
                          <p className={`text-xs ${selectedVideo ? 'text-white' : 'text-gray-700'}`}>Client Portal</p>
                          <p className={`${selectedVideo ? 'text-gray-200' : 'text-black'} font-medium text-sm`}>
                            Track projects, payments & progress
                          </p>
                        </div>
                      </div>
                        
                      <motion.button
                        onClick={() => navigate("/client-portal")}
                        className={`py-2.5 px-4 font-semibold mt-4 md:mt-0 rounded-lg ${selectedVideo ? 'bg-white text-black hover:bg-white/90' : 'text-white bg-black hover:bg-black/90'}  cursor-custom-pointer transition-all text-xs`}
                        style={{
                          fontFamily: 'Poppins'
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Access Client Portal
                      </motion.button>
                    </div>
                  )}

                  {userRole === "client" && !publicMode && (
                    <hr className="my-3 opacity-20" />
                  )}

                  
                  <div className="mt-8 col-span-2">
                    <h1 className={`${selectedVideo ? 'text-white' : 'text-black'} text-2xl md:text-lg font-bold col-span-2`} style={{ fontFamily: 'Poppins' }}>
                      {t("Achievements")}
                    </h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {achievements.length > 0 ? (
                        achievements.map((achievement) => (
                          <Tilt
                            options={{
                              
                              scale: 1.02,
                              speed: 300,
                              perspective: 1000,
                              glare: true,
                              "max-glare": 0.2,
                            }}
                            style={{ transformStyle: 'preserve-3d' }}
                          >
                            <motion.div
                              className={`flex border border-gray-200 rounded-xl px-4 py-3.5 col-span-1 bg-white  ${
                                achievement.status === 'locked' ? 'opacity-50' : ''
                              }`}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                              style={{ minHeight: '8rem' }}
                            >
                              <div className="badge-container">
                                <img
                                  src={achievement.badgeImage}
                                  alt={achievement.name}
                                  className={`badge-image w-28 h-auto ${achievement.status === 'earned' ? 'opacity-100' : 'opacity-50 grayscale'}`}
                                  onError={(e) => {
                                    e.currentTarget.src = 'https://via.placeholder.com/112'; // Fallback image matches w-28 (112px)
                                  }}
                                />
                                {achievement.status === 'earned' && (
                                  <div className="shine-overlay" />
                                )}
                              </div>
                              <div className="ml-4 flex flex-col justify-center">
                                <p className={`text-lg font-bold text-black ${achievement.status === 'earned' ? 'opacity-100' : 'opacity-50 grayscale'}`} style={{ fontFamily: 'Poppins' }}>
                                  {achievement.name}
                                </p>
                                <p className={`text-sm text-gray-500 ${achievement.status === 'earned' ? 'opacity-100' : 'opacity-50 grayscale'}`}>{achievement.description}</p>
                                <hr className="my-2" />
                                
                                  <p className={`text-xs text-gray-400 mt-1 ${achievement.status === 'earned' ? 'opacity-100' : 'opacity-50 grayscale'}`}>
                                    <span className={`${achievement.status === 'earned' ? 'opacity-100' : 'opacity-50 grayscale hidden'}`}>Earned: {new Date(achievement.earnedDate).toLocaleDateString()}</span><span className={`${achievement.status === 'earned' ? 'hidden' : ' block'}`}>not earned</span>
                                  </p>
                              </div>
                            </motion.div>
                          </Tilt>
                        ))
                      ) : (
                        <p className={`text-sm  col-span-2 border p-4 rounded-xl ${selectedVideo ? 'text-gray-400' : 'text-gray-500'}`}>{t('No achievements yet. Keep exploring!')}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-8 col-span-2">
                    <h1 className={`text-2xl md:text-lg font-bold col-span-2 mb-5 ${selectedVideo ? 'text-white' : 'text-black'}`} style={{ fontFamily: 'Poppins' }}>
                      {t('Personalization')}
                    </h1>
                    <div className="flex flex-col md:flex-row items-left md:items-center justify-left md:justify-between border border-gray-200 rounded-xl px-4 py-3.5 col-span-2">
                      <div className="flex items-start space-x-3">
                        <div className="pt-1">
                          <Paintbrush2 className={`${selectedVideo ? 'text-gray-400' : 'text-gray-700'} w-4 h-4 -mt-1 -mr-1`} />
                        </div>
                        <div>
                          <p className={`text-xs ${selectedVideo ? 'text-white' : 'text-gray-700'}`}>{t('Background Appearance')}</p>
                          <p className={`${selectedVideo ? 'text-gray-200' : 'text-black'} font-medium text-sm`}>{t('Customize your profile background')}</p>
                        </div>
                      </div>
                        
                      <motion.button
                        onClick={() => setIsVideoModalOpen(true)}
                        className={`py-2.5 px-4 font-semibold mt-4 md:mt-0 rounded-lg ${selectedVideo ? 'bg-white text-black hover:bg-white/90' : 'text-white bg-black hover:bg-black/90'}  cursor-custom-pointer transition-all text-xs`}
                        style={{
                          fontFamily: 'Poppins'
                        }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {t('Change Background')}
                      </motion.button>
                    </div>

                    <div className="flex flex-col md:flex-row items-left md:items-center justify-left md:justify-between border border-gray-200 rounded-xl px-4 py-3.5 col-span-2 mt-4">
                      <div className="flex items-start space-x-3">
                        <div className="pt-1">
                          <Music className={`${selectedVideo ? 'text-gray-400' : 'text-gray-700'} w-4 h-4 -mt-1 -mr-1`} />
                        </div>
                        <div>
                          <p className={`text-xs ${selectedVideo ? 'text-white' : 'text-gray-700'}`}>{t('Profile Music')}</p>
                          <p className={`${selectedVideo ? 'text-gray-200' : 'text-black'} font-medium text-sm`}>{t('Customize your profile music')}</p>
                        </div>
                      </div>
                      <motion.button
                        onClick={() => setIsMusicModalOpen(true)}
                        className={`py-2.5 px-4 font-semibold mt-4 md:mt-0 rounded-lg ${selectedVideo ? 'bg-white text-black hover:bg-white/90' : 'text-white bg-black hover:bg-black/90'} cursor-custom-pointer transition-all text-xs`}
                        style={{ fontFamily: 'Poppins' }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {t('Change Music')}
                      </motion.button>
                    </div>

                    <div className="flex flex-col md:flex-row items-left md:items-center justify-left md:justify-between border border-gray-200 rounded-xl px-4 py-3.5 col-span-2 mt-4">
                      <div className="flex items-start space-x-3">
                        <div className="pt-1">
                          <Music className={`${selectedVideo ? 'text-gray-400' : 'text-gray-700'} w-4 h-4 -mt-1 -mr-1`} />
                        </div>
                        <div>
                          <p className={`text-xs ${selectedVideo ? 'text-white' : 'text-gray-700'}`}>{t('Profile Effect')}</p>
                          <p className={`${selectedVideo ? 'text-gray-200' : 'text-black'} font-medium text-sm`}>{t('Customize your profile effect')}</p>
                        </div>
                      </div>
                      <motion.button
                        onClick={() => setIsEffectModalOpen(true)}
                        className={`py-2.5 px-4 font-semibold mt-4 md:mt-0 rounded-lg ${selectedVideo ? 'bg-white text-black hover:bg-white/90' : 'text-white bg-black hover:bg-black/90'} cursor-custom-pointer transition-all text-xs`}
                        style={{ fontFamily: 'Poppins' }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {t('Change Effect')}
                      </motion.button>
                    </div>
                    
                  </div>



                                {!publicMode && user?.uid === auth?.currentUser?.uid && (
                <>

                  {/* Privacy & Security Section */}
                  <h1 className={`text-2xl md:text-lg font-bold mt-8 col-span-2 ${selectedVideo ? 'text-white' : 'text-black'}`} style={{ fontFamily:'Poppins'}}>{t('Privacy & Security')}</h1>
                  
                  <h3 className={`text-lg md:text-sm font-semibold ${selectedVideo ? 'text-white' : 'text-black'} mb-1 mt-3 col-span-2`}>{t('Two-Factor Authentication (2FA)')}</h3>
                  {biometricError && <p className="text-red-500 text-sm mb-4"><span className="bg-red-100 text-sm border border-red-400 rounded-lg px-6 py-2.5 flex gap-2"><AlertCircle size={18} className="mt-[1px]" />{biometricError}</span></p>}
                    {success && <p className="text-green-500 text-sm mb-4"><span className="bg-green-100 text-sm border border-green-400 rounded-lg px-6 py-2.5 flex gap-2"><CheckCircle size={18} className="mt-[1px]" />{success}</span></p>}
                  <div className="flex flex-col md:flex-row items-left md:items-center justify-left md:justify-between border border-gray-200 rounded-xl px-4 py-3.5 col-span-2">
                      <div className="flex items-start space-x-3">
                      <div className={`p-3  ${selectedVideo ? 'bg-white/5' : 'bg-black/5'} rounded-lg`}>
                        <Fingerprint className={`w-6 h-6 ${selectedVideo ? 'text-white' : 'text-black'}`} />
                      </div>
                      <div className="-mt-1.5 md:mt-0">
                        <h3 className={`font-medium mt-2 md:mt-0 ${selectedVideo ? 'text-white' : 'text-black'}`}>{t('Biometric Authentication')}</h3>
                        <p className={`text-sm ${selectedVideo ? 'text-gray-300' : 'text-gray-500'}`}>
                          {isBiometric2FAEnabled ? t("Enabled") : t("Not Enabled")}
                        </p>
                      </div>
                    </div>
                    <motion.button
                      onClick={initiateBiometricSetup}
                      disabled={isBiometric2FAEnabled}
                      className={`px-5 py-2 rounded-lg mt-3 md:mt-0 cursor-custom-pointer font-semibold text-[12px] transition-colors ${
                        isBiometric2FAEnabled
                        ? "bg-green-50 border border-2 border-green-300 text-green-600 hover:bg-green-100 cursor-not-allowed"
                        : `${selectedVideo ? 'bg-white text-black hover:bg-white/90' : 'bg-black text-white hover:bg-black/90'}`
                      }`}
                      style={{ fontFamily: "Poppins" }}
                      >
                      {isBiometric2FAEnabled ? t("Biometric 2FA Enabled") : t("Enable Biometric 2FA")}
                    </motion.button>
                  </div>
                  <span className={`bg-yellow-50 ${isBiometric2FAEnabled ? '' : 'hidden'}  col-span-2 text-sm border border-yellow-400 rounded-lg text-yellow-600 px-5 py-3 flex items-start space-x-2`}>
                    <AlertCircle className="w-12 -mt-0.5 md:block  md:w-6 md:h-6 md:-mt-0.5" />
                    <span className="font-semibold">
                      {t("Biometric 2FA is enabled for your security. Disabling it without a proper reason may put your account at risk. LonewolfFSD does not allow disabling 2FA unless there's a valid justification.")}
                      <br /><br />
                      <a href="/request-disable-2fa" className="underline text-yellow-600 flex gap-0.5">{t("Click here to request and state your reason.")} <ExternalLink size={12} className="" /></a>
                    </span>
                  </span>

                  <hr className="col-span-2 my-3" />
                  <h3 className={`text-xl md:text-md font-semibold ${selectedVideo ? 'text-white' : 'text-black'} `}>{t('Connections & Activities')}</h3>
                  <div className="flex items-start border border-gray-200 rounded-xl px-4 py-3.5 space-x-3 col-span-2">
                    <div className="pt-1">
                      <Link2 className={`${selectedVideo ? 'text-gray-400' : 'text-gray-700'} w-4 h-4 -mt-1 -mr-1`} />
                    </div>
                    <div>
                      <p className={`text-xs ${selectedVideo ? 'text-gray-400' : 'text-gray-500'}`}>{t('Connected Account')}</p>
                      {connectedAccounts.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {connectedAccounts.map((domain) => {
                            const account = connectedAccountInfo[domain];
                            return account ? (
                              <div
                                key={domain}
                                className="flex gap-1 items-center space-x-1 bg-gray-100 px-2 py-1 rounded-md"
                              >
                                <img src={account.logo} alt={account.name} className="w-3 h-3" />
                                <span className="text-sm text-gray-800">{account.name}</span>
                              </div>
                            ) : (
                              <span key={domain} className="text-sm text-gray-600">{domain}</span>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-black font-medium text-sm">None</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start border border-gray-200 rounded-xl px-4 py-3.5 space-x-3 col-span-2">
                    <div className="pt-1"><History className={`${selectedVideo ? 'text-gray-500' : 'text-gray-700'} w-4 h-4 -mt-1 -mr-1`} /></div>
                    <div>
                      <p className={`text-xs ${selectedVideo ? 'text-gray-400' : 'text-gray-500'}`}>{t('Recent Login Activity')}</p>
                      <ul className={`${selectedVideo ? 'text-white' : 'text-black'} font-medium text-xs mt-1.5 space-y-1 break-words`}>
                        {recentLogins.map((login, index) => (
                          <li key={index}>{login}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  </>
            )}

            </div>
                  

                {/* Change Password Section */}
                {!publicMode && user?.uid === auth?.currentUser?.uid && (
                <>
                <div className="mt-8">
                  <h3 className={`text-xl md:text-md font-semibold mb-3 ${selectedVideo ? 'text-white' : 'text-black'}`}>{t('Change Password')}</h3>
                  <>
                    {error && <p className="text-red-500 text-sm mb-4"><span className="bg-red-100 text-sm border border-red-400 rounded-lg px-6 py-2.5 flex gap-2"><AlertCircle size={18} className="mt-[1px]" />{error}</span></p>}
                    {success && <p className="text-green-500 text-sm mb-4"><span className="bg-green-100 text-sm border border-green-400 rounded-lg px-6 py-2.5 flex gap-2"><CheckCircle size={18} className="mt-[1px]" />{success}</span></p>}
                    <form onSubmit={handleChangePassword} className="space-y-2 gap-x-3 grid grid-cols-2">
                      {!isPasswordProvider && (
                        <p className="text-sm flex text-red-500 bg-red-100 col-span-2 px-4 py-2.5 rounded-lg border border-red-500">
                          <AlertTriangle size={18} className="mr-2" /> {t('Password changes are not available for accounts using Google, GitHub or Microsoft login.')}
                        </p>
                      )}
                      <div className="col-span-2">
                        <label className={`text-xs ${selectedVideo ? 'text-gray-400' : 'text-gray-500'}`}>{t('Current Password')}</label>
                        <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 space-x-3">
                          <Lock className="text-gray-700 w-4 h-4" />
                          <input
                            type="password"
                            placeholder={t("Enter your current password")}
                            value={password}
                            disabled={!isPasswordProvider}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              setPasswordError(e.target.value ? "" : "Current password is required.");
                            }}
                            className="w-full outline-none text-sm text-black"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className={`text-xs ${selectedVideo ? 'text-gray-400' : 'text-gray-500'}`}>New Password</label>
                        <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 space-x-3">
                          <Lock className="text-gray-700 w-4 h-4" />
                          <input
                            type="password"
                            value={newPassword}
                            placeholder={t("Enter your new password")}
                            disabled={!isPasswordProvider}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full outline-none text-sm text-black"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className={`text-xs ${selectedVideo ? 'text-gray-400' : 'text-gray-500'}`}>Confirm New Password</label>
                        <div className="flex items-center border border-gray-200 rounded-xl mb-5 px-4 py-3 space-x-3">
                          <Lock className="text-gray-700 w-4 h-4" />
                          <input
                            type="password"
                            value={confirmPassword}
                            placeholder={t("Re-enter your new password")}
                            disabled={!isPasswordProvider}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full outline-none text-sm text-black"
                            required
                          />
                        </div>
                      </div>
                      <motion.button
                        type="submit"
                        className={`w-full py-3.5 font-semibold rounded-xl col-span-2 md:col-span-1 ${
                          !isPasswordProvider ? `${selectedVideo ? 'bg-white/10 opacity-50 text-white' : 'bg-black/10 opacity-50 text-white'} cursor-not-allowed` : `${selectedVideo ? 'bg-white text-black hover:bg-white/90' : 'bg-black text-white hover:bg-black/90'} cursor-custom-pointer`
                          } transition-colors`}
                          whileHover={{ scale: 1.01 }}
                          disabled={!isPasswordProvider}
                          whileTap={{ scale: 0.99 }}
                          >
                        {!isPasswordProvider ? t("Update Disabled") : "Update Password"}
                      </motion.button>
                    </form>
                  </>
                
                </div>
                      
                

                <hr className="mt-20 mb-14 border-red-400" />
                <h1 className="text-3xl font-bold text-red-600" style={{ fontFamily: "Poppins" }}>
                  {t('DANGER ZONE')}
                </h1>
                <div className="mt-8 grid grid-cols-2">
                  <h3
                    className="text-lg md:text-[17px] font-semibold text-black mb-4 whitespace-nowrap md:whitespace-nowrap flex text-red-600"
                    style={{ fontFamily: "Poppins" }}
                  >
                    <Trash2 strokeWidth={3} className="md:w-4 md:h-4 md:mt-1 md:mr-2" /> {t('Delete Account for')} {user?.displayName}
                  </h3>
                  <p className={`text-md ${selectedVideo ? 'text-gray-400' : 'text-gray-500'}  mb-4 col-span-2`}>
                    {t('Permanently delete your account. This action cannot be undone.')}
                  </p>
                  <motion.button
                    onClick={handleDeleteAccount}
                    className="w-full py-3.5 cursor-custom-pointer font-semibold rounded-xl flex items-center justify-center gap-2 bg-red-600 text-white hover:bg-red-700 transition-colors col-span-2 md:col-span-1"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {t('Delete Account')}
                  </motion.button>

                </div>
                <h3
                  className={`text-lg md:text-[17px] mt-12 font-semibold  mb-4 flex ${selectedVideo ? 'text-white' : 'text-black'}`}
                  style={{ fontFamily: "Poppins" }}
                >
                  <LogOut strokeWidth={3} className="w-4 h-4 mt-1 mr-2" /> {t('Logout From')} {deviceName}
                </h3>
                <p className={`text-md ${selectedVideo ? 'text-gray-400' : 'text-gray-500'} -mb-3`}>
                  {t('Sign out from your current session on this device.')}
                </p>
                <div className="grid grid-cols-2">
                  <motion.button
                    onClick={handleSignOut}
                    className={`w-full py-3.5 -mt-0 cursor-custom-pointer font-semibold rounded-xl flex items-center justify-center ${selectedVideo ? 'bg-white text-black hover:bg-white/90' : 'bg-black text-white hover:bg-black/90'} gap-2 transition-colors mt-8 col-span-2 md:col-span-1`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {t('Log Out')}
                  </motion.button>
                </div>
                </>
                )}
              
              </motion.div>

            </div>

              
      {/* 2FA Modal */}
      <AnimatePresence>
        {showQRCode && totpUri && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowQRCode(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white p-8 rounded-2xl w-full max-w-md"
            >
              <h3 className="text-xl font-semibold mb-4">Enable Two-Factor Authentication</h3>
              <p className="text-sm text-gray-600 mb-6">
                1. Install Google Authenticator on your phone
                <br />
                2. Scan this QR code with the app
                <br />
                3. Enter the verification code below
              </p>
              <div className="flex justify-center mb-6">
                <QRCodeSVG value={totpUri} size={200} />
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter verification code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                    maxLength={6}
                  />
                  <div className="absolute right-3 top-2.5">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: verificationCode.length > 0 ? 1 : 0 }}
                      className="text-xs font-medium"
                    >
                      {verificationCode.length}/6
                    </motion.div>
                  </div>
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {success && <p className="text-green-500 text-sm">{success}</p>}
                <button
                  onClick={handleVerifyCode}
                  disabled={isVerifying || !verificationCode}
                  className={`w-full py-2 rounded-lg transition-colors ${
                    isVerifying || !verificationCode
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-black text-white hover:bg-black/90"
                    }`}
                >
                  {isVerifying ? "Verifying..." : "Verify and Enable 2FA"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Biometric Modal */}
      <AnimatePresence>
        {showBiometricSetup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowBiometricSetup(false)}
          >
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 md:static md:bg-transparent md:p-0">

                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white h-full md:h-auto w-full max-w-md p-6 md:p-8 rounded-none md:rounded-2xl flex flex-col justify-center"
                >
              <h3 className="text-xl font-semibold mb-4">{t('Enable Biometric Two-Factor Authentication')}</h3>
              <p className="text-sm text-gray-600 mb-6">
                {t('Register your fingerprint or face to enable secure sign-in.')}
              </p>
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              
              <div className="space-y-4">
                <button
                  onClick={registerBiometric}
                  className="w-full py-2 rounded-lg bg-black text-white hover:bg-black/90 transition-colors"
                >
                  {t('Register Biometric')}
                </button>
                <button
                  onClick={() => setShowBiometricSetup(false)}
                  className="w-full py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
                >
                  {t('Cancel')}
                </button>
              </div>
            </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Avatar Upload Modal */}
      <AnimatePresence>
        {isAvatarModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setIsAvatarModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
            
              onClick={(e) => e.stopPropagation()}
              className="bg-white h-full md:h-auto md:rounded-2xl md:p-12 p-6 pb-14 w-full max-w-2xl relative flex flex-col justify-center"
            >
              <button
                onClick={() => setIsAvatarModalOpen(false)}
                className="absolute top-4 cursor-custom-pointer right-4 text-gray-500 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-2xl font-bold mb-4 text-black" style={{ fontFamily: "Poppins" }}>
                {t('Upload Your Avatar')}
              </h3>
              {error && <p className="text-red-500 text-sm mt-4 px-4 py-2 bg-red-100 mb-4 rounded-lg border border-red-400 flex gap-1.5"><AlertTriangle size={16} className="mt-0.5"/> {error}</p>}
              {success && <p className="text-green-500 text-sm mt-4 px-4 py-2 bg-green-100 mb-4 rounded-lg border border-red-400 flex gap-1.5"><CheckCircle size={16} className="mt-0.5"/> {success}</p>}
              {previewURL ? (
                <div className="flex flex-col items-center">
                  <div className="relative w-full h-60 md:h-80 mb-4">
                    <Cropper
                      image={previewURL}
                      crop={crop}
                      zoom={zoom}
                      rotation={rotation}
                      aspect={1}
                      cropShape="round"
                      showGrid={true}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onRotationChange={setRotation}
                      onCropComplete={(_, croppedAreaPixels) => setCroppedAreaPixels(croppedAreaPixels)}
                    />
                  </div>
                  <div className="w-full max-w-md mb-4">
                    <div className="w-full max-w-md mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <label htmlFor="zoom-slider" className="text-sm mt-4 text-gray-500 font-medium">
                          Zoom
                        </label>
                        <span className="text-sm text-gray-600 font-semibold">{zoom.toFixed(1)}x</span>
                      </div>
                      <div className="relative">
                        <input
                          id="zoom-slider"
                          type="range"
                          min={1}
                          max={3}
                          step={0.1}
                          value={zoom}
                          onChange={(e) => setZoom(parseFloat(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer
                                    [&::-webkit-slider-thumb]:appearance-none
                                    [&::-webkit-slider-thumb]:w-5
                                    [&::-webkit-slider-thumb]:h-5
                                    [&::-webkit-slider-thumb]:bg-black
                                    [&::-webkit-slider-thumb]:rounded-full
                                    [&::-webkit-slider-thumb]:shadow-md
                                    [&::-webkit-slider-thumb]:hover:bg-gray-800
                                    [&::-webkit-slider-thumb]:focus:outline-none
                                    [&::-webkit-slider-thumb]:focus:ring-2
                                    [&::-webkit-slider-thumb]:focus:ring-black
                                    [&::-moz-range-thumb]:w-5
                                    [&::-moz-range-thumb]:h-5
                                    [&::-moz-range-thumb]:bg-black
                                    [&::-moz-range-thumb]:rounded-full
                                    [&::-moz-range-thumb]:shadow-md
                                    [&::-moz-range-thumb]:hover:bg-gray-800
                                    [&::-moz-range-thumb]:focus:outline-none
                                    [&::-moz-range-thumb]:focus:ring-2
                                    [&::-moz-range-thumb]:focus:ring-black
                                    [&::-webkit-slider-runnable-track]:bg-gray-300
                                    [&::-webkit-slider-runnable-track]:rounded-full
                                    [&::-moz-range-track]:bg-gray-300
                                    [&::-moz-range-track]:rounded-full"
                          aria-label={`Zoom level, currently ${zoom.toFixed(1)}x`}
                          aria-valuemin={1}
                          aria-valuemax={3}
                          aria-valuenow={zoom}
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>1x</span>
                          <span>3x</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3 justify-center">
                        {[1, 1.5, 2, 3].map((level) => (
                          <motion.button
                            key={level}
                            onClick={() => setZoom(level)}
                            className={`px-3 py-1 text-sm rounded-lg font-semibold transition-colors
                                        ${zoom === level ? "bg-black text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label={`Set zoom to ${level}x`}
                          >
                            {level}x
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mb-4">
                    <motion.button
                      onClick={() => setRotation((prev) => prev - 90)}
                      className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <RotateCcw className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      onClick={() => setRotation((prev) => prev + 90)}
                      className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <RotateCw className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div
                  className={`border-2 border-dashed rounded-xl p-10 text-center ${
                    isDragging ? "border-black/80 bg-black-30" : "border-gray-200"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <Upload className="w-10 h-10 mx-auto mb-4 text-gray-400" />
                  <p className="text-sm text-gray-500 mb-4">
                    {t('Drag and drop or click to upload (JPEG/JPG/PNG/WEBP, max 5MB)')}
                  </p>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    onChange={handleFileSelect}
                    className="hidden"
                    ref={fileInputRef}
                  />
                  <motion.button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 cursor-custom-pointer font-semibold text-sm py-2.5 bg-black text-white rounded-lg hover:bg-black/90"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isDragging}
                  >
                    {isDragging ? t("Drop Here") : t("Choose File")}
                  </motion.button>
                </div>
              )}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-4">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{Math.round(uploadProgress)}%</p>
                </div>
              )}
              {selectedFile && (
                <div className="flex gap-3 mt-6 grid grid-cols-1 md:grid-cols-2">
                  <motion.button
                    onClick={handleUpload}
                    className="w-full cursor-custom-pointer py-2.5 text-sm rounded-xl bg-black text-white hover:bg-black/90"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={!croppedAreaPixels}
                  >
                    {t("Upload Avatar")}
                  </motion.button>
                  <hr className="my-2 md:hidden" />
                  <motion.button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewURL("");
                      setCrop({ x: 0, y: 0 });
                      setZoom(1);
                      setRotation(0);
                      setCroppedAreaPixels(null);
                      fileInputRef.current!.value = "";
                    }}
                    className="w-full cursor-custom-pointer py-2.5 text-sm rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {t("Choose Another")}
                  </motion.button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Biometric Verification Modal */}
      <AnimatePresence>
        {isBiometricModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setIsBiometricModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl p-8 w-full max-w-md relative"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold mb-8 text-center text-black" style={{ fontFamily: "Poppins" }}>
                {t('Verify Your Identity')}
              </h3>
              <div className="text-center">
                <Fingerprint className="w-14 h-14 mx-auto mb-4 text-black" />
                <p className="text-sm text-gray-500 mb-6">
                  {t('Please verify with your biometric credentials to change your password.')}
                </p>
                <motion.button
                  onClick={handleBiometricVerify}
                  className={`w-full cursor-custom-pointer py-3 rounded-xl ${
                    isVerifying ? "bg-black/30 cursor-not-allowed" : "bg-black hover:bg-black/90"
                  } text-white font-semibold`}
                  whileHover={{ scale: isVerifying ? 1 : 1.01 }}
                  whileTap={{ scale: isVerifying ? 1 : 0.95 }}
                  disabled={isVerifying}
                >
                  {isVerifying ? t("Verifying...") : t("Verify Biometrics")}
                </motion.button>
                {biometricError && setIsBiometricModalOpen(false)}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

<AnimatePresence>
       {isVideoModalOpen && (
         <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
           onClick={() => setIsVideoModalOpen(false)}
         >
           <motion.div
             initial={{ scale: 0.95, y: 20 }}
             animate={{ scale: 1, y: 0 }}
             exit={{ scale: 0.95, y: 20 }}
             onClick={(e) => e.stopPropagation()}
             className="bg-white h-full md:h-auto md:rounded-2xl md:p-20 p-6 pb-14 w-full max-w-4xl relative flex flex-col"
           >
             <button
               onClick={() => setIsVideoModalOpen(false)}
               className="absolute top-4 right-4 text-gray-500 hover:text-black cursor-custom-pointer"
             >
               <X className="w-5 h-5" />
             </button>
            <div className="flex mt-12 md:mt-0 justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-black" style={{ fontFamily: "Poppins" }}>
                Select Background 
              </h3>
              <span className="flex items-center gap-1 text-sm font-semibold text-black border border-black px-4 py-1 rounded-full">
                <img src="https://i.ibb.co/LDnY9KSK/virtual-coin.png" alt="Credits" className="w-4 h-4" />
                {virtualCurrency} <span className="bg-black p-1 rounded-full ml-1"><Plus onClick={() => setIsOpen(true)} size={10} className="text-white cursor-custom-pointer"/></span>
              </span>

            </div>

             {error && (
               <p className="text-red-500 text-sm mb-4 bg-red-100 px-4 py-2 rounded-lg border border-red-400 flex gap-1.5">
                 <AlertTriangle size={16} className="mt-0.5" /> {error}
               </p>
             )}
             {success && (
               <p className="text-green-500 text-sm mb-4 bg-green-100 px-4 py-2 rounded-lg border border-green-400 flex gap-1.5">
                 <CheckCircle size={16} className="mt-0.5" /> {success}
               </p>
             )}
             <div className="mb-4">
               <div className="flex items-center justify-between mb-3">
                 <input
                   type="text"
                   placeholder="Search backgrounds..."
                   value={searchQuery}
                   onChange={e => setSearchQuery(e.target.value)}
                   className="w-full p-3 rounded-lg text-sm border border-gray-300"
                 />
                 
               </div>
               <div className="w-full overflow-x-scroll scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
                  <div className="inline-flex gap-2 whitespace-nowrap px-1 pb-1">
                    {allCategories.map(category => {
                      const isSelected = selectedCategories.includes(category);
                      return (
                        <button
                          key={category}
                          onClick={() => toggleCategory(category)}
                          className={`px-5 py-2 rounded-lg cursor-custom-pointer text-xs font-semibold border flex-shrink-0
                            ${isSelected ? "bg-black text-white" : "bg-gray-100 text-gray-700 border-gray-300"}`}
                        >
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </button>
                      );
                    })}
                  </div>
                </div>
             </div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
  {filteredVideos.map((video, index) => (
    <motion.div
      key={video.id}
      className={`rounded-xl p-3 flex items-center gap-3 relative transition-all duration-200 h-32
        ${selectedVideo === video.url ? "border-black border" : "bg-white border border-gray-200"}
        ${index === 1 ? "scale-100 z-10" : "scale-100"}
        cursor-custom-pointer`}
      whileHover={{ scale: 1 }}
      whileTap={{ scale: 1 }}
      onClick={() => {
        if (!video.locked || purchasedVideos.includes(video.id) || video.price === 0) {
          handleVideoSelect(video);
        }
      }}
    >
      {/* === VIDEO PREVIEW === */}
      <div
        className={`w-24 h-20 rounded-lg overflow-hidden flex-shrink-0 
        ${video.locked && !purchasedVideos.includes(video.id) && video.price > 0 ? "grayscale" : ""}`}
      >
        {video.url ? (
          <video
            ref={videoRef}
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={video.url} type="video/mp4" />
          </video>
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-sm text-gray-500">
            Empty
          </div>
        )}
      </div>

      {/* === TEXT + BUTTON AREA === */}
      <div className="flex-1 flex flex-col justify-center">
        <div className={`${video.locked && !purchasedVideos.includes(video.id) && video.price > 0 ? "opacity-100" : ""}`}>
          <p className="text-base font-semibold text-black">{video.name}</p>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            {purchasedVideos.includes(video.id) ? (
              "Owned"
            ) : video.price > 0 ? (
              <>
                <img src="https://i.ibb.co/LDnY9KSK/virtual-coin.png" alt="Credits" className="w-3.5 h-3.5" />
                {video.price}
              </>
            ) : (
              "Free"
            )}
          </p>
        </div>

        {/* === BUTTON stays NORMAL === */}
{video.locked && !purchasedVideos.includes(video.id) && video.price > 0 && (
  <motion.button
    onClick={(e) => {
      e.stopPropagation();
      console.log("Buy button clicked for:", video.name, "Currency:", virtualCurrency, "Price:", video.price);
      handlePurchaseVideo(video);
    }}
    className={`mt-2 px-3 py-2 text-sm font-semibold rounded-md text-white z-10
      ${virtualCurrency < video.price ? "bg-gray-400 cursor-not-allowed opacity-50" : "bg-black hover:bg-black/90 cursor-pointer"}`}
    whileHover={{ scale: virtualCurrency < video.price ? 1 : 1.01 }}
    whileTap={{ scale: virtualCurrency < video.price ? 1 : 0.95 }}
    disabled={virtualCurrency < video.price}
  >
    Buy "{video.name}"
  </motion.button>
)}
      </div>

      {/* === ICONS === */}
      {selectedVideo === video.url && (
        <CheckCircle strokeWidth={3} className="w-4 h-4 text-black absolute top-3 right-3" />
      )}
      {video.locked && !purchasedVideos.includes(video.id) && video.price > 0 && (
        <Lock strokeWidth={3} className="w-4 h-4 text-gray-500 absolute top-3 right-3" />
      )}
    </motion.div>
  ))}

             </div>
           </motion.div>
         </motion.div>
       )}
     </AnimatePresence>

     <AnimatePresence>
  {isMusicModalOpen && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={() => setIsMusicModalOpen(false)}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white h-full md:h-auto md:rounded-2xl md:p-20 p-6 pb-14 w-full max-w-4xl relative flex flex-col"
      >
        <button
          onClick={() => setIsMusicModalOpen(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-black cursor-custom-pointer"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex mt-12 md:mt-0 justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-black" style={{ fontFamily: "Poppins" }}>
            Select Profile Music
          </h3>
          <span className="flex items-center gap-1 text-sm font-semibold text-black border border-black px-4 py-1 rounded-full">
            <img src="https://i.ibb.co/LDnY9KSK/virtual-coin.png" alt="Credits" className="w-4 h-4" />
            {virtualCurrency} <span className="bg-black p-1 rounded-full ml-1"><Plus onClick={() => setIsOpen(true)} size={10} className="text-white cursor-custom-pointer"/></span>
          </span>
        </div>
        {error && (
          <p className="text-red-500 text-sm mb-4 bg-red-100 px-4 py-2 rounded-lg border border-red-400 flex gap-1.5">
            <AlertTriangle size={16} className="mt-0.5" /> {error}
          </p>
        )}
        {success && (
          <p className="text-green-500 text-sm mb-4 bg-green-100 px-4 py-2 rounded-lg border border-green-400 flex gap-1.5">
            <CheckCircle size={16} className="mt-0.5" /> {success}
          </p>
        )}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <input
              type="text"
              placeholder="Search music..."
              value={musicSearchQuery}
              onChange={e => setMusicSearchQuery(e.target.value)}
              className="w-full p-3 rounded-lg text-sm border border-gray-300"
            />
          </div>
          <div className="w-full overflow-x-scroll scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
            <div className="inline-flex gap-2 whitespace-nowrap px-1 pb-1">
              {allMusicCategories.map(category => {
                const isSelected = selectedMusicCategories.includes(category);
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedMusicCategories(prev =>
                      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
                    )}
                    className={`px-5 py-2 rounded-lg cursor-custom-pointer text-xs font-semibold border flex-shrink-0
                      ${isSelected ? "bg-black text-white" : "bg-gray-100 text-gray-700 border-gray-300"}`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
          {musicOptions
            .filter(music => {
              const matchesSearch = music.name.toLowerCase().includes(musicSearchQuery.toLowerCase());
              const matchesCategory = selectedMusicCategories.length === 0
                ? true
                : music.categories.some(cat => selectedMusicCategories.includes(cat));
              return matchesSearch && matchesCategory;
            })
            .map((music, index) => (
              <motion.div
                key={music.id}
                className={`rounded-xl p-3 flex items-center gap-3 relative transition-all duration-200 h-32
                  ${selectedMusic === music.url ? "border-black border" : "bg-white border border-gray-200"}
                  cursor-custom-pointer`}
                whileHover={{ scale: 1 }}
                whileTap={{ scale: 1 }}
                onClick={() => {
                  if (!music.locked || purchasedMusic.includes(music.id) || music.price === 0) {
                    handleMusicSelect(music);
                  }
                }}
              >
                <div
                  className={`w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 bg-center bg-cover relative`}
                  style={{
                    backgroundImage: `url(${music.image})`,
                    filter: music.locked && !purchasedMusic.includes(music.id) && music.price > 0 ? 'grayscale(100%)' : 'none'
                  }}
                >

                  {music.url ? (
                    <>
                      <audio
                        ref={(el) => (audioRefs.current[music.id] = el)}
                        src={music.url}
                        preload="metadata"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const audio = audioRefs.current[music.id];
                          if (!audio) return;

                          if (playingMusicId === music.id) {
                            audio.pause();
                            setPlayingMusicId(null);
                          } else {
                            Object.values(audioRefs.current).forEach(a => {
                              if (a && !a.paused) a.pause();
                            });
                            audio.play();
                            setPlayingMusicId(music.id);
                          }
                        }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black shadow-md rounded-full p-3 hover:bg-black/90 transition-colors"
                      >
                        {playingMusicId === music.id ? (
                          <Pause fill="currentColor" className="w-5 h-5 text-white" />
                        ) : (
                          <Play fill="currentColor" className="w-5 h-5 text-white" />
                        )}
                      </button>

                    </>
                  ) : (
                    <div className="text-sm text-gray-500">No Audio</div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <div className={`${music.locked && !purchasedMusic.includes(music.id) && music.price > 0 ? "opacity-100" : ""}`}>
                    <p className="text-base font-semibold text-black">{music.name}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      {purchasedMusic.includes(music.id) ? (
                        "Owned"
                      ) : music.price > 0 ? (
                        <>
                          <img src="https://i.ibb.co/LDnY9KSK/virtual-coin.png" alt="Credits" className="w-3.5 h-3.5" />
                          {music.price}
                        </>
                      ) : (
                        "Free"
                      )}
                    </p>
                  </div>
                  {music.locked && !purchasedMusic.includes(music.id) && music.price > 0 && (
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePurchaseMusic(music);
                      }}
                      className={`mt-2 px-3 py-2 text-sm font-semibold rounded-md text-white z-10
                        ${virtualCurrency < music.price ? "bg-gray-400 cursor-not-allowed opacity-50" : "bg-black hover:bg-black/90 cursor-pointer"}`}
                      whileHover={{ scale: virtualCurrency < music.price ? 1 : 1.01 }}
                      whileTap={{ scale: virtualCurrency < music.price ? 1 : 0.95 }}
                      disabled={virtualCurrency < music.price}
                    >
                      Buy "{music.name}"
                    </motion.button>
                  )}
                </div>
                {selectedMusic === music.url && (
                  <CheckCircle strokeWidth={3} className="w-4 h-4 text-black absolute top-3 right-3" />
                )}
                {music.locked && !purchasedMusic.includes(music.id) && music.price > 0 && (
                  <Lock strokeWidth={3} className="w-4 h-4 text-gray-500 absolute top-3 right-3" />
                )}
              </motion.div>
            ))}
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

<AnimatePresence>
  {isEffectModalOpen && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={() => setIsEffectModalOpen(false)}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white h-full md:h-auto md:rounded-2xl md:p-20 p-6 pb-14 w-full max-w-4xl relative flex flex-col"
      >
        <button
          onClick={() => setIsEffectModalOpen(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-black cursor-custom-pointer"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex mt-12 md:mt-0 justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-black" style={{ fontFamily: "Poppins" }}>
            Select Profile Effect
          </h3>
          <span
            className="flex items-center gap-1 text-sm font-semibold text-black border border-black px-4 py-1 rounded-full"
          >
            <img
              src="https://i.ibb.co/LDnY9KSK/virtual-coin.png"
              alt="Credits"
              className="w-4 h-4"
            />
            {virtualCurrency}{" "}
            <span className="bg-black p-1 rounded-full ml-1">
              <Plus
                onClick={() => {
                  setIsOpen(true);
                  setIsEffectModalOpen(false);
                }}
                size={10}
                className="text-white cursor-custom-pointer"
              />
            </span>
          </span>
        </div>
        {toast?.type === "error" && (
          <p
            className="text-red-500 text-sm mb-4 bg-red-100 px-4 py-2 rounded-lg border border-red-400 flex gap-1.5"
          >
            <AlertTriangle size={16} className="mt-0.5" /> {toast.message}
          </p>
        )}
        {toast?.type === "success" && (
          <p
            className="text-green-500 text-sm mb-4 bg-green-100 px-4 py-2 rounded-lg border border-green-400 flex gap-1.5"
          >
            <CheckCircle size={16} className="mt-0.5" /> {toast.message}
          </p>
        )}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <input
              type="text"
              placeholder="Search effects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 rounded-lg text-sm border border-gray-300"
            />
          </div>
          <div
            className="w-full overflow-x-scroll scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200"
          >
            <div className="inline-flex gap-2 whitespace-nowrap px-1 pb-1">
              {allEffectCategories.map((category) => {
                const isSelected = selectedCategories.includes(category);
                return (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`px-5 py-2 rounded-lg cursor-custom-pointer text-xs font-semibold border flex-shrink-0
                      ${isSelected ? "bg-black text-white" : "bg-gray-100 text-gray-700 border-gray-300"}`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
          {filteredEffects.map((effect, index) => (
            <motion.div
              key={effect.id}
              className={`rounded-xl p-3 flex items-center gap-3 relative transition-all duration-200 h-32
                ${activeEffect?.url === effect.url ? "border-black border" : "bg-white border border-gray-200"}
                ${index === 1 ? "scale-100 z-10" : "scale-100"}
                cursor-custom-pointer`}
              whileHover={{ scale: 1 }}
              whileTap={{ scale: 1 }}
              onClick={() => handleEffectSelect(effect)}
            >
              <div
                className={`w-24 h-20 rounded-lg overflow-hidden flex-shrink-0 
                ${!purchasedEffects.includes(effect.id) && effect.price > 0 ? "" : ""}`}
              >
                {effect.url ? (
                  <video
                    ref={(el) => {
                      if (el) videoEffectRef.current[index] = el;
                    }}
                    autoPlay
                    preload="auto"
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover bg-black/80"
                    onError={(e) => console.error(`Video error for ${effect.name}:`, e)} // Debug
                  >
                    <source src={effect.url} type="video/webm" />
                    <source
                      src={effect.url.endsWith(".webm") ? effect.url.replace(".webm", ".mp4") : effect.url}
                      type="video/mp4"
                    />

                    <source src={effect.url} type="video/webm" />
                    <source
                      src={effect.url.endsWith(".webm") ? effect.url.replace(".webm", ".mp4") : effect.url}
                      type="video/mp4"
                    />
                  </video>
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-sm text-gray-500">
                    Empty
                  </div>
                )}
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <div className={`${!purchasedEffects.includes(effect.id) && effect.price > 0 ? "opacity-100" : ""}`}>
                  <p className="text-base font-semibold text-black">{effect.name}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    {purchasedEffects.includes(effect.id) ? (
                      "Owned"
                    ) : effect.price > 0 ? (
                      <>
                        <img src="https://i.ibb.co/LDnY9KSK/virtual-coin.png" alt="Credits" className="w-3.5 h-3.5" />
                        {effect.price}
                      </>
                    ) : (
                      "Free"
                    )}
                  </p>
                </div>
                {!purchasedEffects.includes(effect.id) && effect.price > 0 && (
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePurchaseEffect(effect);
                    }}
                    className={`mt-2 px-3 py-2 text-sm font-semibold rounded-md text-white z-10
                      ${virtualCurrency < effect.price ? "bg-gray-400 cursor-not-allowed opacity-50" : "bg-black hover:bg-black/90 cursor-pointer"}`}
                    whileHover={{ scale: virtualCurrency < effect.price ? 1 : 1.01 }}
                    whileTap={{ scale: virtualCurrency < effect.price ? 1 : 0.95 }}
                    disabled={virtualCurrency < effect.price}
                  >
                    Buy "{effect.name}"
                  </motion.button>
                )}
              </div>
              {activeEffect?.url === effect.url && (
                <CheckCircle strokeWidth={3} className="w-4 h-4 text-black absolute top-3 right-3" />
              )}
              {!purchasedEffects.includes(effect.id) && effect.price > 0 && (
                <Lock strokeWidth={3} className="w-4 h-4 text-gray-500 absolute top-3 right-3" />
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

{isOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:px-4">
    <div className="h-screen flex items-center justify-center md:py-10">
      <div className="bg-white p-6 sm:p-12 w-full max-w-6xl shadow-2xl relative overflow-y-auto max-h-screen">
        <span className="md:hidden">
          <br /><br />
        </span>

        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-8 right-8 text-gray-400 hover:text-black text-2xl font-bold"
        >
          <X />
        </button>

        <h2
          style={{
            fontFamily: "Poppins",
          }}
          className="text-3xl sm:text-4xl font-bold mb-14 text-left font-poppins"
        >
          LonewolfFSD Store
        </h2>

        <p className="w-full text-left flex justify-between items-center text-xl font-semibold">
          <span
            className="flex items-center font-bold"
            style={{
              fontFamily: "Poppins",
            }}
          >
            FSD Credits Packs
          </span>
        </p>

        <hr className="border-black/10 my-3 mb-6" />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            {
              name: "FSD Spark Pack",
              credits: 1000,
              amount: 60,
              original: 80,
              popular: false,
              image: "https://i.ibb.co/LDnY9KSK/virtual-coin.png",
            },
            {
              name: "FSD Core Pack",
              credits: 5000,
              amount: 120,
              original: 150,
              popular: false,
              image: "https://i.ibb.co/rKR9JL9L/pro-pack-removebg-preview-1.png",
            },
            {
              name: "FSD Boost Pack",
              credits: 10000,
              amount: 240,
              original: 280,
              popular: false,
              image: "https://i.ibb.co/Gf6cFdWW/Chat-GPT-Image-Jun-13-2025-02-16-29-PM-removebg-preview.png",
            },
            {
              name: "FSD Surge Pack",
              credits: 25000,
              amount: 480,
              original: 540,
              popular: false,
              image: "https://i.ibb.co/DDfYQCGc/Chat-GPT-Image-Jun-13-2025-02-19-42-PM-removebg-preview.png",
            },
            {
              name: "FSD Vault Pack",
              credits: 50000,
              amount: 900,
              original: 1200,
              popular: false,
              image: "https://i.ibb.co/T5cqsFN/Chat-GPT-Image-Jun-13-2025-02-25-14-PM-removebg-preview.png",
            },
            {
              name: "FSD Nexus Pack",
              credits: 100000,
              amount: 1500,
              original: 2200,
              popular: false,
              image: "https://i.ibb.co/KzphMqf0/Chat-GPT-Image-Jun-13-2025-02-33-40-PM-removebg-preview.png",
            },
          ].map(({ name, credits, amount, original, popular, image }) => (
            <Tilt
              options={{
                scale: 1.02,
                speed: 300,
                perspective: 1000,
                glare: true,
                "max-glare": 0.2,
              }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div
                key={credits}
                className={`relative bg-gray-100 p-6 rounded-xl flex flex-col items-center shadow-md hover:shadow-lg transition-all transform border border-black duration-200 ${
                  popular ? "border-2 border-black" : ""
                }`}
              >
                {popular && (
                  <span className="absolute -top-4 right-4 bg-black text-white text-xs font-bold px-5 py-1.5 rounded-full shadow">
                    MOST POPULAR
                  </span>
                )}
                <img
                  src={image}
                  alt="Credits"
                  className="w-32 md:w-32 h-auto mb-4 animate-scale"
                />
                <p
                  className="text-xl font-semibold mb-1"
                  style={{
                    fontFamily: "Poppins",
                  }}
                >
                  {name}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  {credits.toLocaleString()} Credits
                </p>
                <div className="mb-3">
                  <span className="text-lg font-bold text-black ml-1">
                    ₹{amount}
                  </span>
                  <span className="text-gray-500 line-through text-sm ml-2">
                    ₹{original}
                  </span>
                </div>
                <button
                  onClick={() => handlePayment(amount, credits, image)}
                  className="bg-black text-sm text-white cursor-custom-pointer font-medium px-6 py-3 rounded-lg w-full hover:bg-gray-900 transition"
                  style={{
                    fontFamily: "Poppins",
                  }}
                >
                  <span className="hidden md:block">Buy "{name}"</span>
                  <span className="md:hidden">Purchanse</span>
                </button>
              </div>
            </Tilt>
          ))}
        </div>

        <br />
        <br />
        <br />

        <p className="w-full mb-3 text-left flex justify-between items-center text-xl font-semibold">
          <span
            className="flex items-center font-bold"
            style={{
              fontFamily: "Poppins",
            }}
          >
            Animated Profile Backgrounds
          </span>
        </p>
        <hr />
        <br />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videoOptions
            .filter((video) => video.locked && video.id !== "none")
            .map((video) => (
              <Tilt key={video.id} options={{ max: 15, scale: 1.05 }}>
                <div className="bg-gray-100 border border-black rounded-xl p-4 flex flex-col justify-between h-full">
                  <div>
                    <video
                      src={video.url}
                      ref={videoRef}
                      className="w-full md:h-32 object-cover rounded-lg mb-2"
                      muted
                      loop
                      playsInline
                    />
                    <h3 className="text-lg font-semibold" style={{
                      fontFamily: 'Poppins'
                    }}>{video.name}</h3>
                    <p className="text-base font-bold text-gray-800" style={{
                      fontFamily: 'Poppins'
                    }}>
                      ₹{video.priceINR || 0}/-
                    </p>
                  </div>
                  <div className="mt-4">
                    {(purchasedVideos || []).includes(video.id) ? ( // Add fallback
                      <button
                            
                            className="w-full bg-black/20 text-sm text-black py-3 rounded-md"
                          >
                            Already Owned
                          </button>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {(video.paymentOptions || ["credits"]).includes("real_money") && (
                          <button
                            onClick={() => handlePurchaseRealMoneyVideo(video)}
                            className="w-full bg-black text-sm font-semibold text-white py-3 rounded-md hover:bg-black/90"
                            style={{
                              fontFamily: 'Poppins'
                            }}
                            >
                            Buy "{video.name}"
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Tilt>
            ))}
            
            
            </div>
        <br />
            <br />
                      <div className="mb-8">
                <h3 style={{ fontFamily: "Poppins" }} className="text-xl font-bold mb-4">
                  Profile Effects
                </h3>
                <hr className="mb-6" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {effects.map((effect) => (
                    
                    <Tilt options={{ max: 15, scale: 1.05 }} key={effect.id} className="border border-black rounded-xl p-4">
                      
                      <video
                        src={effect.url}
                        className="w-full h-32 object-cover rounded-md mt-2"
                        autoPlay
                        loop
                        muted
                      />
                      <h4 style={{ fontFamily: "Poppins" }} className="text-lg mt-2 font-semibold">
                        {effect.name}
                      </h4>
                      <p className="text-base font-bold text-gray-800" style={{
                      fontFamily: 'Poppins'
                    }}>
                      ₹{effect.priceINR}/-
                    </p>
                      {!purchasedEffects.includes(effect.id) ? (
                        <div className="mt-4 flex space-x-2">
                          {effect.priceINR && (
                            <button
                              onClick={() => handlePurchaseRealMoneyEffect(effect)}
                              className="bg-black text-sm font-bold cursor-custom-pointer w-full text-white px-4 py-3 rounded-md hover:bg-black/90"
                            >
                              Buy "{effect.name}"
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="mt-4 flex space-x-2">
                        <p className="w-full bg-black/20 text-sm text-center text-black py-3 rounded-md">Already Owned</p>
                        </div>
                      )}
                    </Tilt>
                  ))}
                  </div>
                  </div>
                  </div>
                  </div>
                  </div>
                )}


  {/* Purchased Overlay */}
  {purchaseDetails && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white h-screen sm:h-auto pt-28 sm:pt-16 rounded-lg py-16 px-6 md:p-16 w-full max-w-xl">
            <h2 className="text-3xl font-bold mb-6 text-center" style={{
              fontFamily: 'Poppins'
            }}>Purchase Successful!</h2>
            {/* Coin Visual */}
            <div className="flex justify-center mb-4">
              <img src={purchaseDetails.image} className="w-40 animate-scale" />
            </div>
            <p className="text-center font-bold text-2xl">{purchaseDetails.credits} credits</p>
            <p className="text-center mt-3 text-gray-600">{purchaseDetails.credits} credits added to your account successfully</p>
            <br />
            <hr />
            <br />
            <p className="text-lg font-bold mb-4" style={{
              fontFamily: 'Poppins'
            }}>Purchase Details</p>
            {/* Purchase Details */}
              {/* Purchase Details */}
              <div className="overflow-x-auto w-full">
                <div className="flex whitespace-nowrap border border-black">
                  {/* Left column: header labels */}
                  <div className="flex flex-col w-full bg-gray-100 border-r border-black">
                    <div className="py-4 px-4 border-b border-black font-semibold text-sm">Credits Added</div>
                    <div className="py-4 px-4 border-b border-black font-semibold text-sm">Amount Paid</div>
                    <div className="py-4 px-4 border-b border-black font-semibold text-sm">Date & Time</div>
                    <div className="py-4 px-4 font-semibold text-sm">Transaction ID</div>
                  </div>

                  {/* Right column: actual data */}
                  <div className="flex flex-col">
                    <div className="py-4 px-6 border-b border-black text-sm">{purchaseDetails.credits}</div>
                    <div className="py-4 px-6 border-b border-black text-sm">₹{purchaseDetails.amount}</div>
                    <div className="py-4 px-6 border-b border-black text-sm">{purchaseDetails.date}</div>
                    <div className="py-4 px-6 text-sm">{purchaseDetails.transactionId}</div>
                  </div>
                </div>
              </div>

            {/* Close Button */}
            <button
              onClick={() => setPurchaseDetails(null)}
              className="mt-6 w-full bg-black text-white px-4 py-3 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
    )}

    {/* Video Purchase Overlay */}
{videoPurchaseDetails && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white h-screen sm:h-auto pt-28 sm:pt-16 rounded-lg py-16 px-6 md:p-16 w-full max-w-xl">
      <h2 className="text-3xl font-bold mb-6 text-center" style={{ fontFamily: 'Poppins' }}>
        Purchase Successful!
      </h2>
      {/* Video Visual */}
      <div className="flex justify-center mb-4">
        <video
          src={videoPurchaseDetails.url}
          className="w-full h-40 object-cover rounded-lg"
          muted
          loop
          autoPlay
        />
      </div>
      <p className="text-center font-bold text-2xl" style={{
        fontFamily: 'Poppins'
      }}>{videoPurchaseDetails.name}</p>
      <p className="text-center mt-3 text-gray-600">
        "{videoPurchaseDetails.name}" added to your profile backgrounds successfully
      </p>
      <br />
      <hr />
      <br />
      <p className="text-lg font-bold mb-4" style={{ fontFamily: 'Poppins' }}>
        Purchase Details
      </p>
      {/* Purchase Details */}
      <div className="overflow-x-auto w-full">
        <div className="flex whitespace-nowrap border border-black">
          {/* Left column: header labels */}
          <div className="flex flex-col w-full bg-gray-100 border-r border-black">
            <div className="py-4 px-4 border-b border-black font-semibold text-sm">Background Name</div>
            <div className="py-4 px-4 border-b border-black font-semibold text-sm">Amount Paid</div>
            <div className="py-4 px-4 border-b border-black font-semibold text-sm">Date & Time</div>
            <div className="py-4 px-4 font-semibold text-sm">Transaction ID</div>
          </div>
          {/* Right column: actual data */}
          <div className="flex flex-col">
            <div className="py-4 px-6 border-b border-black text-sm">{videoPurchaseDetails.name}</div>
            <div className="py-4 px-6 border-b border-black text-sm">
              {videoPurchaseDetails.paymentType === "credits"
                ? `${videoPurchaseDetails.price} Credits`
                : `₹${videoPurchaseDetails.priceINR}`}
            </div>
            <div className="py-4 px-6 border-b border-black text-sm">{videoPurchaseDetails.date}</div>
            <div className="py-4 px-6 text-sm">{videoPurchaseDetails.transactionId}</div>
          </div>
        </div>
      </div>
      {/* Close Button */}
      <button
        onClick={() => setVideoPurchaseDetails(null)}
        className="mt-6 w-full bg-black text-white px-4 py-3 rounded-lg"
      >
        Close
      </button>
    </div>
  </div>
)}


{effectPurchaseDetails && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white h-screen sm:h-auto pt-28 sm:pt-16 rounded-lg py-16 px-6 md:p-16 w-full max-w-xl">
      <h2 className="text-3xl font-bold mb-6 text-center" style={{ fontFamily: "Poppins" }}>
        Purchase Successful!
      </h2>
      {/* Video Visual */}
      <div className="flex justify-center mb-4">
        <video
          src={effectPurchaseDetails.url}
          className="w-full h-40 object-cover rounded-lg bg-black/80"
          muted
          loop
          autoPlay
        />
      </div>
      <p className="text-center font-bold text-2xl" style={{ fontFamily: "Poppins" }}>
        {effectPurchaseDetails.name}
      </p>
      <p className="text-center mt-3 text-gray-600">
        "{effectPurchaseDetails.name}" added to your profile effects successfully
      </p>
      <br />
      <hr />
      <br />
      <p className="text-lg font-bold mb-4" style={{ fontFamily: "Poppins" }}>
        Purchase Details
      </p>
      {/* Purchase Details */}
      <div className="overflow-x-auto w-full">
        <div className="flex whitespace-nowrap border border-black">
          {/* Left column: header labels */}
          <div className="flex flex-col w-full bg-gray-100 border-r border-black">
            <div className="py-4 px-4 border-b border-black font-semibold text-sm">Effect Name</div>
            <div className="py-4 px-4 border-b border-black font-semibold text-sm">Amount Paid</div>
            <div className="py-4 px-4 border-b border-black font-semibold text-sm">Date & Time</div>
            <div className="py-4 px-4 font-semibold text-sm">Transaction ID</div>
          </div>
          {/* Right column: actual data */}
          <div className="flex flex-col">
            <div className="py-4 px-6 border-b border-black text-sm">{effectPurchaseDetails.name}</div>
            <div className="py-4 px-6 border-b border-black text-sm">
                  ₹${effectPurchaseDetails.priceINR}
            </div>
            <div className="py-4 px-6 border-b border-black text-sm">{effectPurchaseDetails.date}</div>
            <div className="py-4 px-6 text-sm">{effectPurchaseDetails.transactionId}</div>
          </div>
        </div>
      </div>
      {/* Close Button */}
      <button
        onClick={() => setEffectPurchaseDetails(null)}
        className="mt-6 w-full bg-black text-white px-4 py-3 rounded-lg"
      >
        Close
      </button>
    </div>
  </div>
)}

    </div>
  );
};

export default Profile;
