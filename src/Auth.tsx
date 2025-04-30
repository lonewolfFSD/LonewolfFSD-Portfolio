import React, { useState, FormEvent, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAvatar } from "./AvatarContext";
import { DotPatternWithGlowEffectDemo } from "./DotPattern";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import ClickSpark from "./ClickSpark";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Github,
  Chrome,
  AlertCircle,
  XCircle,
  ShieldAlert,
  AlertTriangle,
  Ban,
  Loader2,
  Fingerprint,
  Check,
} from "lucide-react";
import zxcvbn from "zxcvbn";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendEmailVerification,
  updateProfile,
  RecaptchaVerifier,
} from "firebase/auth";
import { auth, googleProvider, githubProvider, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import Helmet from "react-helmet";

interface AuthPageProps {
  isDark: boolean;
}

const AuthPage: React.FC<AuthPageProps> = ({ isDark }) => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricPrompt, setIsBiometricPrompt] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [user, setUser] = useState<FirebaseUser | null>(null); // State for Firebase user
  const [errorType, setErrorType] = useState<string>("");
  const [success, setSuccess] = useState<string>(""); // Added success state
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
  const navigate = useNavigate();
  const { avatarURL } = useAvatar();

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        navigate("/"); // Redirect to home page if user is logged in
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const getErrorIcon = () => {
    switch (errorType) {
      case "user-cancelled":
        return <XCircle strokeWidth={3} className="w-4 h-4 mr-2 text-red-500" />;
      case "recaptcha":
        return <ShieldAlert strokeWidth={3} className="w-4 h-4 mr-2 text-red-500" />;
      case "ban":
        return <Ban strokeWidth={3} className="w-4 h-4 mr-2 text-red-500" />;
      case "email-verification":
        return <Mail strokeWidth={3} className="w-4 h-4 mr-2 text-red-500" />;
      case "biometric":
        return <Fingerprint strokeWidth={3} className="w-4 h-4 mr-2 text-red-500" />;
      default:
        return <AlertTriangle strokeWidth={3} className="w-4 h-4 mr-2 text-red-500" />;
    }
  };

  useEffect(() => {
    const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "",
      callback: () => {},
      "expired-callback": () => {
        setError("reCAPTCHA expired. Please try again.");
        setErrorType("recaptcha");
        setIsLoading(false);
      },
    });
    setRecaptchaVerifier(verifier);

    return () => {
      verifier.clear();
    };
  }, []);

  const checkBiometricEnabled = async (uid: string) => {
    try {
      const userDoc = doc(db, "users", uid);
      const docSnap = await getDoc(userDoc);
      return docSnap.exists() && docSnap.data().biometric2FAEnabled === true;
    } catch (err) {
      console.error("Firestore check error:", err);
      return false;
    }
  };

  const verifyBiometric = async (uid: string) => {
    try {
      setIsBiometricPrompt(true);
      setIsLoading(true);
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          rpId: window.location.hostname,
          userVerification: "required",
          allowCredentials: [], // Allow browser to select platform credential
          timeout: 60000,
        },
      });
      console.log("Biometric verified:", credential);
      setSuccess("Welcome back, cyber-wolf! 🐺");
      return true;
    } catch (err) {
      console.error("Biometric error:", err.name, err.message);
      setError("Couldn't verify your biometric. Try your PIN or fingerprint again, or skip for now.");
      setErrorType("biometric");
      return false;
    } finally {
      setIsBiometricPrompt(false);
      setIsLoading(false);
    }
  };

  const handleAuth = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setErrorType("");
    setIsLoading(true);

    if (!recaptchaVerifier) {
      setError("reCAPTCHA not initialized. Please refresh the page.");
      setErrorType("recaptcha");
      setIsLoading(false);
      return;
    }

    try {
      const recaptchaToken = await recaptchaVerifier.verify();
      if (!recaptchaToken) {
        setError("reCAPTCHA verification failed. Please try again.");
        setErrorType("recaptcha");
        setIsLoading(false);
        return;
      }

      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Set displayName in Firebase Authentication
        if (name) {
          await updateProfile(user, { displayName: name });
        }

        // Save user data to Firestore
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          name: user.displayName || email.split('@')[0], // Sync displayName or fallback to email prefix
          status: 'active',
          role: 'user',
          lastActive: new Date().toISOString(),
          biometric2FAEnabled: false,
        });

        // Check for biometric 2FA
        const isBiometricEnabled = await checkBiometricEnabled(user.uid);
        if (isBiometricEnabled) {
          const biometricVerified = await verifyBiometric(user.uid);
          if (!biometricVerified) {
            await auth.signOut();
            return; // Stop login if biometric fails
          }
        }

        if (!user.emailVerified) {
          setError("Please verify your email before signing in.");
          setErrorType("email-verification");
          await auth.signOut();
          navigate("/check-email");
          return;
        }
        navigate("/");
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (name) {
          await updateProfile(userCredential.user, { displayName: name });
        }
        await sendEmailVerification(userCredential.user);
        navigate("/check-email");
      }
    } catch (err: any) {
      setIsLoading(false);
      switch (err.code) {
        case "auth/invalid-credential":
          setError("Invalid email or password.");
          setErrorType("generic");
          break;
        case "auth/email-already-in-use":
          setError("This email is already in use.");
          setErrorType("user-cancelled");
          break;
        case "auth/weak-password":
          setError("Password is too weak.");
          setErrorType("generic");
          break;
        default:
          setError(err.message || "Authentication failed.");
          setErrorType("generic");
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setErrorType("");
    setIsLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/");
    } catch (err: any) {
      setIsLoading(false);
      switch (err.code) {
        case "auth/user-cancelled":
          setError("You cancelled the Google sign-in. Please try again.");
          setErrorType("user-cancelled");
          break;
        case "auth/user-disabled":
          setError("Your account has been suspended.");
          setErrorType("ban");
          break;
        case "auth/account-exists-with-different-credential":
          setError("Account already exists with different credentials");
          setErrorType("generic");
          break;
        default:
          setError(err.message || "Google sign-in failed.");
          setErrorType("generic");
      }
    }
  };

  const handleGithubSignIn = async () => {
    setError("");
    setErrorType("");
    setIsLoading(true);
    try {
      await signInWithPopup(auth, githubProvider);
      navigate("/");
    } catch (err: any) {
      setIsLoading(false);
      switch (err.code) {
        case "auth/user-cancelled":
          setError("You cancelled the GitHub sign-in. Please try again.");
          setErrorType("user-cancelled");
          break;
        case "auth/user-disabled":
          setError("Your account has been suspended.");
          setErrorType("ban");
          break;
        case "auth/account-exists-with-different-credential":
          setError("Account already exists with different credentials");
          setErrorType("generic");
          break;
        default:
          setError(err.message || "GitHub sign-in failed.");
          setErrorType("generic");
      }
    }
  };


  

  const getPasswordStrength = (score) => {
    switch (score) {
      case 0:
        return { width: "20%", color: "bg-red-500", label: "Very Weak" };
      case 1:
        return { width: "40%", color: "bg-orange-500", label: "Weak" };
      case 2:
        return { width: "60%", color: "bg-yellow-500", label: "Fair" };
      case 3:
        return { width: "80%", color: "bg-blue-500", label: "Good" };
      case 4:
        return { width: "100%", color: "bg-green-500", label: "Strong" };
      default:
        return { width: "0%", color: "bg-gray-200", label: "None" };
    }
  };

  const passwordStrength = password ? zxcvbn(password).score : -1;
  const { width, color, label } = getPasswordStrength(passwordStrength);

  return (
    <div className="h-screen flex items-center justify-center lg:p-6 bg-white">
      <Helmet>
        <script
          src="https://www.google.com/recaptcha/api.js?onload=onloadCallback&render=explicit"
          async
          defer
        ></script>
        <title>{isLogin ? "Login | LonewolfFSD" : "Create Account | LonewolfFSD"}</title>
      </Helmet>

      <div className="absolute inset-0 z-50 pointer-events-none">
  <div className="relative h-screen w-full overflow-hidden">
    <DotPatternWithGlowEffectDemo />
  </div>
</div>
        



      <motion.div
        className="w-full max-w-lg px-6 py-10 lg:p-14 lg:rounded-3xl lg:border lg:border-black bg-white relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={`flex justify-center mb-6 ${isLogin ? 'mt-0' : 'mt-36'} md:mt-0`}>
          <motion.img
            src="https://pbs.twimg.com/profile_images/1905319445851246592/KKJ22pIP_400x400.jpg"
            alt="Profile"
            className="w-28 h-auto rounded-full -mb-1 pointer-events-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <motion.h2
          className="text-[33px] font-bold mb-8 text-center text-black tracking-tight"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{ fontFamily: "Poppins" }}
        >
          {isLogin ? "Welcome Back" : "Create Account"}
        </motion.h2>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-50 border border-red-100 text-red-500 p-4 rounded-xl mb-6"
            >
              <div className="flex text-[12.5px] px-1 font-semibold" style={{ fontFamily: "Poppins" }}>
                {getErrorIcon()} {error}
              </div>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-green-50 border border-green-100 text-green-500 p-4 rounded-xl mb-6"
            >
              <div className="flex text-[12.5px] px-1 font-semibold" style={{ fontFamily: "Poppins" }}>
                <Check /> {success}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleAuth} className="space-y-3">
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center border border-gray-200 rounded-xl p-4">
                  <User strokeWidth={2} className="w-5 h-5 mr-3 text-gray-600" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-transparent outline-none text-black placeholder-gray-400"
                    required
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3.5">
            <Mail strokeWidth={2} className="w-5 h-5 mr-3 text-gray-500" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent outline-none text-black placeholder-gray-400"
              required
            />
          </div>

          <div className="">
            <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3.5">
              <Lock strokeWidth={2} className="w-5 h-5 mr-3 text-gray-500" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent outline-none text-black placeholder-gray-400"
                required
              />
            </div>

            {isLogin && (
              <div className="absolute mt-1 right-7 lg:right-14">
                <Link
                  to="/forgot-password"
                  className="lg:text-[11px] text-[13px] cursor-custom-pointer text-gray-500 hover:text-black underline hover:underline transition-colors"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Forgot Password?
                </Link>
              </div>
            )}
          </div>
          {!isLogin && <br />}
          <div className="">
            {!isLogin && (
              <div className="-mt-4">
                <p className="text-xs mb-1.5 text-gray-500">Password Strength: {label}</p>
                <div className="h-1 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${color}`}
                    style={{ width }}
                  />
                </div>
                <ul
                  className="mt-2.5 text-xs flex flex-wrap gap-x-4 gap-y-1 text-gray-500 whitespace-nowrap"
                  style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                >
                  <li className={/[a-z]/.test(password) ? "text-green-600 line-through" : ""}>
                    • Lowercase letter
                  </li>
                  <li className={/[A-Z]/.test(password) ? "text-green-600 line-through" : ""}>
                    • Uppercase letter
                  </li>
                  <li className={/[0-9]/.test(password) ? "text-green-600 line-through" : ""}>
                    • Numeric character
                  </li>
                  <li className={/[^A-Za-z0-9]/.test(password) ? "text-green-600 line-through" : ""}>
                    • Special character
                  </li>
                  <li className={password.length >= 6 ? "text-green-600 line-through" : ""}>
                    • Minimum 6 characters
                  </li>
                </ul>
              </div>
            )}
          </div>
          <br />
          <div id="recaptcha-container"></div>
            <div className="py-[1px]"/>
          <motion.button
            type="submit"
            disabled={isLoading || isBiometricPrompt}
            className={`w-full py-3.5 cursor-custom-pointer text-md font-medium rounded-xl flex items-center justify-center gap-2 ${
              isLoading || isBiometricPrompt ? "bg-black/50 cursor-not-allowed" : "bg-black"
            } text-white hover:bg-black/90 transition-colors`}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {isBiometricPrompt ? (
              <span className="flex items-center justify-center">
                <Loader2 strokeWidth={3} className="w-4 h-4 ml-1.5 mt-0.5 animate-spin" />
                Verifying biometric...
              </span>
            ) : isLoading ? (
              <span className="flex items-center justify-center">
                <Loader2 strokeWidth={3} className="w-4 h-4 ml-1.5 mt-0.5 animate-spin" />
                {isLogin ? "Signing in..." : "Creating account..."}
              </span>
            ) : (
              <span className="flex items-center justify-center">
                {isLogin ? "Sign In" : "Create Account"}
              </span>
            )}
          </motion.button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <motion.button
            onClick={handleGoogleSignIn}
            disabled={isLoading || isBiometricPrompt}
            className={`py-4 cursor-custom-pointer font-semibold rounded-xl flex items-center justify-center gap-2 border border-gray-200 ${
              isLoading || isBiometricPrompt ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
            } transition-colors`}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <Chrome className="w-5 h-5" /> Google
          </motion.button>

          <motion.button
            onClick={handleGithubSignIn}
            disabled={isLoading || isBiometricPrompt}
            className={`py-4 cursor-custom-pointer font-semibold rounded-xl flex items-center justify-center gap-2 border border-gray-200 ${
              isLoading || isBiometricPrompt ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
            } transition-colors`}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <Github className="w-5 h-5" /> GitHub
          </motion.button>
        </div>

        <p className="mt-8 text-sm text-center text-gray-500">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="font-semibold text-black hover:underline transition-colors"
            disabled={isLoading || isBiometricPrompt}
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default AuthPage;