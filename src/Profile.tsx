import React, { useEffect, useState, useCallback, useRef } from "react";
import { db, storage } from "../firebase"; // Ensure storage is imported
import { doc, setDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAvatar } from "./AvatarContext.tsx";
import { QRCodeSVG } from "qrcode.react";
import * as nsfwjs from "nsfwjs"; // Import nsfwjs

import Cropper from "react-easy-crop";
import { Area } from "react-easy-crop/types";
import { RotateCcw, RotateCw } from "lucide-react";

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

const DeleteAccountModal = ({ isOpen, onClose, onDelete }) => {

  const [error, setError] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
            Are you absolutely sure?
          </h2>
          <p className="mt-3 text-gray-600">
            This action cannot be undone. This will permanently delete your account and remove your data from our servers.
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
              <Trash2 size={17} strokeWidth={3} /> Delete
            </button>

            <button
              onClick={onClose}
              className="w-full py-2.5 px-6 rounded-md border border-black text-black hover:bg-black hover:text-white transition"
            >
              Cancel
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

const Profile: React.FC<ProfileProps> = ({ isDark, publicMode = false }) => {
  const navigate = useNavigate();
  const { uid } = useParams<{ uid: string }>();
  const [user, setUser] = useState(auth.currentUser);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [location, setLocation] = useState<string>("Fetching...");
  const [region, setRegion] = useState<string>("Unknown");
  const [currentTime, setCurrentTime] = useState<string>(() =>
    new Date().toLocaleTimeString()
  );
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

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // Load avatar from Firestore on mount
useEffect(() => {
  const loadAvatar = async () => {
    if (!user || !user.uid) {
      console.log("No user or UID for avatar load");
      return;
    }
    try {
      console.log("Loading avatar for UID:", user.uid);
      const userDoc = doc(db, "users", user.uid, "profile", "avatar");
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
          await checkBiometricState(currentUser.uid);
          setUser(currentUser);

          // Load avatar for authenticated user
          const userDoc = doc(db, "users", currentUser.uid, "profile", "avatar");
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
            id: new TextEncoder().encode(user.uid),
            name: user.email || "user@example.com",
            displayName: user.displayName || "User",
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
      await setDoc(doc(db, "users", user.uid), {
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
    if (!auth.currentUser) {
      console.log("No authenticated user");
      throw new Error("User not authenticated.");
    }
    const uid = auth.currentUser.uid;
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
  if (!selectedFile || !auth.currentUser || !croppedAreaPixels) {
    setError("No file selected, not signed in, or image not cropped.");
    return;
  }
  try {
    setUploadProgress(0);
    console.log("Uploading for UID:", auth.currentUser.uid);

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
      const userDoc = doc(db, "users", auth.currentUser!.uid, "profile", "avatar");
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
          await checkBiometricState(currentUser.uid);
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
  if (!user || !user.uid) {
    console.log("No user or UID for notifications");
    return;
  }

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
    try {
      await handleShare();
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  const handleShare = async () => {
    try {
      const publicProfileRef = doc(db, "publicProfiles", user.uid);
      await setDoc(publicProfileRef, {
        avatar: avatarURL || user.photoURL,
        displayName: user.displayName,
        email: user.email,
        region: region,
        lastSignInTime: user.metadata.lastSignInTime,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      const shareLink = `${window.location.origin}/public-profile/${user.uid}`;
      navigator.clipboard.writeText(shareLink);
      setSuccess("Shareable link copied to clipboard!");
    } catch (err) {
      setError("Failed to generate shareable link.");
    }
  };

  const confirmDelete = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("No user signed in");
      await currentUser.getIdToken(true);
      await deleteUser(currentUser);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Failed to delete account");
    }
  };

    const [notifications, setNotifications] = useState<Notification[]>([]);

  const profileOptions = [
    { label: "Profile", icon: User, action: () => navigate("/profile") },
    { label: "Log Out", icon: LogOut, action: () => signOut(auth).then(() => navigate("/")) },
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      
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

            <div className="absolute inset-0 z-50 pointer-events-none">
        <div className="relative h-[800px] w-full overflow-hidden">
          <DotPatternWithGlowEffectDemo />
        </div>
        
        </div>

      <div className="flex min-h-screen items-center justify-center px-4 md:px-6 py-20 bg-white z-0">


        <motion.div
          className={`w-full max-w-5xl -mt-14 ${publicMode ? 'md:-mt-36' : 'md:-mt-10'} px-2 md:py-16 md:px-12 md:rounded-xl backdrop-blur-lg md:border md:border-black bg-white relative z-10`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
<h2
      className="text-[30px] font-bold mb-6 text-left text-black tracking-tight"
      style={{ fontFamily: "Poppins" }}
    >
      {user.displayName}'s Profile
      <motion.button
        onClick={onShareClick}
        className={`p-2 ml-2.5 bg-gray-400/20 shadow-md border border-gray-500 rounded-full cursor-custom-pointer inline-flex items-center justify-center group"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="flex items-center md:gap-[2px] md:group-hover:gap-1 transition-all duration-300 md:group-hover:px-3 md:group-hover:py-0 ${publicMode ? 'hidden' : 'hidden'}`}>
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
      </motion.button>
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

            <h3 className={`text-2xl md:text-lg font-bold text-black md:mt-3 mt-8 ${publicMode ? 'col-span-2' : 'col-span-1'}`} style={{ fontFamily: 'Poppins'}}>Personal Details</h3>

            <div className={`flex items-start border border-gray-200 rounded-xl px-4 py-3.5 space-x-3 ${publicMode ? 'col-span-1' : 'col-span-2'}`}>
              <div className="pt-1"><User className="text-gray-700 w-5 h-5" /></div>
              <div>
                <p className="text-xs text-gray-500">Name</p>
                <p className="text-black font-medium text-sm break-words">{user.displayName || "Not set"}</p>
              </div>
            </div>

            <div className="flex items-start border border-gray-200 rounded-xl px-4 py-3.5 space-x-3 col-span-2 md:col-span-1">
              <div className="pt-1"><Mail className="text-gray-700 w-5 h-5" /></div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-black font-medium text-sm break-words">{user.email || "Unknown"}</p>
              </div>
            </div>

            <div className="flex items-start border border-gray-200 rounded-xl px-4 py-3.5 space-x-3 col-span-2 md:col-span-1">
              <div className="pt-1"><ShieldCheck className="text-gray-700 w-5 h-5" /></div>
              <div>
                <p className="text-xs text-gray-500">Email Verified</p>
                <p className="text-black font-medium text-sm break-words">{user.emailVerified ? "Yes" : "No"}</p>
              </div>
            </div>

            <div className="flex items-start border border-gray-200 rounded-xl px-4 py-3.5 space-x-3 col-span-2 md:col-span-1">
              <div className="pt-1"><Calendar className="text-gray-700 w-5 h-5" /></div>
              <div>
                <p className="text-xs text-gray-500">Last Login</p>
                <p className="text-black font-medium text-sm break-words">{publicMode ? user.metadata?.lastSignInTime || "Unknown" : user.metadata?.lastSignInTime || "Unknown"}</p>
              </div>
            </div>

            <div className="flex items-start border border-gray-200 rounded-xl px-4 py-3.5 space-x-3 col-span-2 md:col-span-1">
              <div className="pt-1"><Globe className="text-gray-700 w-5 h-5" /></div>
              <div>
                <p className="text-xs text-gray-500">Region</p>
                <p className="text-black font-medium text-sm break-words">{region}</p>
              </div>
            </div>

            {/* Sensitive info - Hidden in public mode */}

                <div className={`flex items-start border border-gray-200 ${publicMode ? 'hidden' : 'block'} rounded-xl px-4 py-3.5 space-x-3col-span-2 md:col-span-1`}>
                    <div className="pt-1"><LocateFixed className="text-gray-700 w-5 h-5" /></div>
                    <div>
                      <p className="text-xs text-gray-500 ml-3">Location</p>
                      <p className="text-black font-medium text-sm break-words ml-3 md:ml-3">{location}</p>
                    </div>
                  </div>

                  <div className="flex items-start border border-gray-200 rounded-xl px-4 py-3.5 space-x-3 col-span-2 md:col-span-1">
                    <div className="pt-1"><Clock className="text-gray-700 w-5 h-5" /></div>
                    <div>
                      <p className="text-xs text-gray-500">Current Time</p>
                      <p className="text-black font-medium text-sm break-words">{currentTime}</p>
                    </div>
                  </div>


                  <div className="flex items-start border border-gray-200 rounded-xl px-4 py-3.5 space-x-3 col-span-2 md:col-span-1">
                    <div className="pt-1">
                      {deviceName === "iPhone" ? (
                        <Phone className="text-gray-700 w-5 h-5" />
                      ) : deviceName === "Windows PC" ? (
                        <Monitor className="text-gray-700 w-5 h-5" />
                      ) : deviceName === "Linux PC" ? (
                        <Monitor className="text-gray-700 w-5 h-5" />
                      ) : deviceName.includes("Android") ? (
                        <Phone className="text-gray-700 w-5 h-5" />
                      ) : (
                        <User className="text-gray-700 w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Device</p>
                      <p className="text-black font-medium text-sm break-words">{deviceName}</p>
                    </div>
                  </div>

                  {!publicMode && (
                    <div className="flex items-start border border-gray-200 rounded-xl px-4 py-3.5 space-x-3">
                      <div className="pt-1"><Calendar className="text-gray-700 w-5 h-5" /></div>
                      <div>
                        <p className="text-xs text-gray-500">Account Created</p>
                        <p className="text-black font-medium text-sm break-words">
                          {user?.metadata?.creationTime
                            ? new Date(user.metadata.creationTime).toLocaleDateString()
                            : "Unknown"}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className={`flex items-start border border-gray-200 rounded-xl px-4 py-3.5 space-x-3 col-span-2 ${publicMode ? 'hidden' : 'block'}`}>
                    <div className="pt-1"><UserCog className="text-gray-700 w-5 h-5" /></div>
                    <div>
                      <p className="text-xs text-gray-500">FSD ID</p>
                      <p className="text-black font-medium text-sm break-all">{user.uid}</p>
                    </div>
                  </div>

                                {!publicMode && user?.uid === auth.currentUser?.uid && (
                <>

                  {/* Privacy & Security Section */}
                  <h1 className="text-2xl md:text-lg font-bold mt-8 col-span-2" style={{ fontFamily:'Poppins'}}>Privacy & Security</h1>
                  
                  <h3 className="text-lg md:text-sm font-semibold text-black mb-1 mt-3 col-span-2">Two-Factor Authentication (2FA)</h3>
                  {biometricError && <p className="text-red-500 text-sm mb-4"><span className="bg-red-100 text-sm border border-red-400 rounded-lg px-6 py-2.5 flex gap-2"><AlertCircle size={18} className="mt-[1px]" />{biometricError}</span></p>}
                    {success && <p className="text-green-500 text-sm mb-4"><span className="bg-green-100 text-sm border border-green-400 rounded-lg px-6 py-2.5 flex gap-2"><CheckCircle size={18} className="mt-[1px]" />{success}</span></p>}
                  <div className="flex items-center justify-between col-span-2">
                    <div className="flex items-center space-x-4 ">
                      <div className="p-3 bg-black/5 rounded-lg">
                        <Fingerprint className="w-6 h-6 text-black" />
                      </div>
                      <div>
                        <h3 className="font-medium mt-2 md:mt-0">Biometric Authentication</h3>
                        <p className="text-sm text-gray-500">
                          {isBiometric2FAEnabled ? "Enabled" : "Not enabled"}
                        </p>
                      </div>
                    </div>
                    <motion.button
                      onClick={initiateBiometricSetup}
                      disabled={isBiometric2FAEnabled}
                      className={`px-5 py-2 rounded-lg cursor-custom font-semibold text-[12px] transition-colors ${
                        isBiometric2FAEnabled
                        ? "bg-green-50 border border-2 border-green-300 text-green-600 hover:bg-green-100"
                        : "bg-black text-white hover:bg-black/90"
                      }`}
                      style={{ fontFamily: "Poppins" }}
                      >
                      {isBiometric2FAEnabled ? "Biometric 2FA Enabled" : "Enable Biometric 2FA"}
                    </motion.button>
                  </div>
                  <span className="bg-yellow-50  col-span-2 text-sm border border-yellow-400 rounded-lg text-yellow-600 px-5 py-3 flex items-start space-x-2">
                    <AlertCircle className="hidden md:block md:w-6 md:h-6 md:-mt-0.5" />
                    <span className="font-semibold">
                      <span style={{ fontFamily: 'Poppins' }}>Biometric 2FA</span> is enabled for your security. Disabling it without a proper reason may put your account at risk. 
                      
                      <span style={{ fontFamily: 'Poppins' }}> LonewolfFSD</span> does not allow disabling 2FA unless there's a valid justification.
                      <br /><br />
                      <a href="/request-disable-2fa" className="underline text-yellow-600 flex gap-0.5">Click here to request and state your reason. <ExternalLink size={12} className="" /></a>
                    </span>
                  </span>

                  <hr className="col-span-2 my-3" />
                  <h3 className="text-xl md:text-md font-semibold text-black ">Connections & Activities</h3>
                  <div className="flex items-start border border-gray-200 rounded-xl px-4 py-3.5 space-x-3 col-span-2">
                    <div className="pt-1"><Link2 className="text-gray-700 w-5 h-5" /></div>
                    <div>
                      <p className="text-xs text-gray-500">Connected Accounts</p>
                      <p className="text-black font-medium text-sm break-words">
                        {connectedAccounts.length > 0 ? connectedAccounts.join(", ") : "None"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start border border-gray-200 rounded-xl px-4 py-3.5 space-x-3 col-span-2">
                    <div className="pt-1"><History className="text-gray-700 w-5 h-5" /></div>
                    <div>
                      <p className="text-xs text-gray-500">Recent Login Activity</p>
                      <ul className="text-black font-medium text-xs mt-1.5 space-y-1 break-words">
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
                {!publicMode && user?.uid === auth.currentUser?.uid && (
                <>
                <div className="mt-8">
                  <h3 className="text-xl md:text-md font-semibold text-black mb-3">Change Password</h3>
                  <>
                    {error && <p className="text-red-500 text-sm mb-4"><span className="bg-red-100 text-sm border border-red-400 rounded-lg px-6 py-2.5 flex gap-2"><AlertCircle size={18} className="mt-[1px]" />{error}</span></p>}
                    {success && <p className="text-green-500 text-sm mb-4"><span className="bg-green-100 text-sm border border-green-400 rounded-lg px-6 py-2.5 flex gap-2"><CheckCircle size={18} className="mt-[1px]" />{success}</span></p>}
                    <form onSubmit={handleChangePassword} className="space-y-2 gap-x-3 grid grid-cols-2">
                      {!isPasswordProvider && (
                        <p className="text-sm flex text-red-500 bg-red-100 col-span-2 px-4 py-2.5 rounded-lg border border-red-500">
                          <AlertTriangle size={18} className="mr-2" /> Password changes are not available for accounts using Google or GitHub login.
                        </p>
                      )}
                      <div className="col-span-2">
                        <label className="text-xs text-gray-500">Current Password</label>
                        <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 space-x-3">
                          <Lock className="text-gray-700 w-4 h-4" />
                          <input
                            type="password"
                            placeholder="Enter your current password"
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
                        <label className="text-xs text-gray-500">New Password</label>
                        <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 space-x-3">
                          <Lock className="text-gray-700 w-4 h-4" />
                          <input
                            type="password"
                            value={newPassword}
                            placeholder="Enter your new password"
                            disabled={!isPasswordProvider}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full outline-none text-sm text-black"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Confirm New Password</label>
                        <div className="flex items-center border border-gray-200 rounded-xl mb-5 px-4 py-3 space-x-3">
                          <Lock className="text-gray-700 w-4 h-4" />
                          <input
                            type="password"
                            value={confirmPassword}
                            placeholder="Re-enter your new password"
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
                          !isPasswordProvider ? "bg-black/20 text-white/90 cursor-not-allowed" : "bg-black text-white hover:bg-black/90 cursor-custom-pointer"
                        } transition-colors`}
                        whileHover={{ scale: 1.01 }}
                        disabled={!isPasswordProvider}
                        whileTap={{ scale: 0.99 }}
                      >
                        {!isPasswordProvider ? "Update Disabled" : "Update Password"}
                      </motion.button>
                    </form>
                  </>
                
                </div>
                

                <hr className="mt-20 mb-14 border-red-400" />
                <h1 className="text-3xl font-bold text-red-600" style={{ fontFamily: "Poppins" }}>
                  DANGER ZONE
                </h1>
                <div className="mt-8 grid grid-cols-2">
                  <h3
                    className="text-lg md:text-[17px] font-semibold text-black mb-4 whitespace-nowrap md:whitespace-nowrap flex text-red-600"
                    style={{ fontFamily: "Poppins" }}
                  >
                    <Trash2 strokeWidth={3} className="md:w-4 md:h-4 md:mt-1 md:mr-2" /> Delete Account for {user.displayName}
                  </h3>
                  <p className="text-md text-gray-500 mb-4 col-span-2">
                    Permanently delete your account. This action cannot be undone.
                  </p>
                  <motion.button
                    onClick={handleDeleteAccount}
                    className="w-full py-3.5 cursor-custom-pointer font-semibold rounded-xl flex items-center justify-center gap-2 bg-red-600 text-white hover:bg-red-700 transition-colors col-span-2 md:col-span-1"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    Delete Account
                  </motion.button>

                </div>
                <h3
                  className="text-lg md:text-[17px] mt-12 font-semibold text-black mb-4 flex text-black"
                  style={{ fontFamily: "Poppins" }}
                >
                  <LogOut strokeWidth={3} className="w-4 h-4 mt-1 mr-2" /> Logout From {deviceName}
                </h3>
                <p className="text-md md:text-sm text-gray-500 -mb-3">
                  Sign out from your current session on this device.
                </p>
                <div className="grid grid-cols-2">
                  <motion.button
                    onClick={handleSignOut}
                    className="w-full py-3.5 -mt-0 cursor-custom-pointer font-semibold rounded-xl flex items-center justify-center gap-2 bg-black text-white hover:bg-black/90 transition-colors mt-8 col-span-2 md:col-span-1"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    Log Out
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
              <h3 className="text-xl font-semibold mb-4">Enable Biometric Two-Factor Authentication</h3>
              <p className="text-sm text-gray-600 mb-6">
                Register your fingerprint or face to enable secure sign-in.
              </p>
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              
              <div className="space-y-4">
                <button
                  onClick={registerBiometric}
                  className="w-full py-2 rounded-lg bg-black text-white hover:bg-black/90 transition-colors"
                >
                  Register Biometric
                </button>
                <button
                  onClick={() => setShowBiometricSetup(false)}
                  className="w-full py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
                >
                  Cancel
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
                Upload Your Avatar
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
                    Drag and drop or click to upload (JPEG/JPG/PNG/WEBP, max 5MB)
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
                    {isDragging ? "Drop Here" : "Choose File"}
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
                    Upload Avatar
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
                    Choose Another
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
                Verify Your Identity
              </h3>
              <div className="text-center">
                <Fingerprint className="w-14 h-14 mx-auto mb-4 text-black" />
                <p className="text-sm text-gray-500 mb-6">
                  Please verify with your biometric credentials to change your password.
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
                  {isVerifying ? "Verifying..." : "Verify Biometrics"}
                </motion.button>
                {biometricError && setIsBiometricModalOpen(false)}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;


