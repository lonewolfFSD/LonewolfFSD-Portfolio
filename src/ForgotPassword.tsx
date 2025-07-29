// src/ForgotPassword.tsx
import React, { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight, ArrowLeft } from "lucide-react";
import { auth, sendPasswordResetEmail, fetchSignInMethodsForEmail } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import { DotPatternWithGlowEffectDemo } from "./DotPattern";

interface ForgotPasswordProps {
  isDark: boolean;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ isDark }) => {
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [cooldown, setCooldown] = useState<number>(0); // Cooldown in seconds
  const navigate = useNavigate();

  // Handle cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer); // Cleanup on unmount
    }
  }, [cooldown]);

  const handleResetPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    try {
      setIsSubmitting(true);
      // Attempt to fetch sign-in methods
      let signInMethods: string[] = [];
      try {
        signInMethods = await fetchSignInMethodsForEmail(auth, email);
        console.log("Sign-in methods:", signInMethods); // Debug
      } catch (fetchError: any) {
        console.error("fetchSignInMethodsForEmail error:", fetchError.code, fetchError.message); // Debug
      }
      if (signInMethods.length > 0) {
        // Check for Google or GitHub providers
        if (signInMethods.includes("google.com") || signInMethods.includes("github.com")) {
          setError(
            "This email is linked to a Google or GitHub account. Please sign in using that provider."
          );
          return;
        }
        // Send reset email for password provider
        if (signInMethods.includes("password")) {
          await sendPasswordResetEmail(auth, email);
          setSuccess("Password reset email sent! Please check your inbox.");
          setCooldown(60); // Start 60-second cooldown
        } else {
          setError("This account does not use a password. Please contact support.");
        }
        return;
      }
      // Fallback: Try sendPasswordResetEmail if signInMethods is empty
      try {
        await sendPasswordResetEmail(auth, email);
        setSuccess("Password reset email sent! Please check your inbox.");
        setCooldown(60); // Start 60-second cooldown
        console.log("Fallback: Reset email sent successfully"); // Debug
      } catch (resetError: any) {
        console.error("sendPasswordResetEmail fallback error:", resetError.code, resetError.message); // Debug
        setError(
          "No account found with this email. Please check the email or sign up."
        );
      }
    } catch (err: any) {
      console.error("General error:", err.code, err.message); // Debug
      const errorMessages: { [key: string]: string } = {
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/too-many-requests": "Too many attempts. Please wait a few minutes and try again.",
        "auth/operation-not-allowed": "Password reset is disabled. Contact support.",
      };
      setError(errorMessages[err.code] || "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center lg:p-6 bg-white">

            <div className="absolute inset-0 z-50 pointer-events-none">
        <div className="relative h-screen w-full overflow-hidden">
          <DotPatternWithGlowEffectDemo />
        </div>
      </div>

      <motion.div
        className="w-full max-w-[480px] -mt-28 md:mt-0 p-6 md:p-14 md:rounded-3xl bg-white relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-center mb-6">
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
          className="text-[30px] font-bold mb-8 text-center text-black tracking-tight"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            fontFamily: "Poppins",
          }}
        >
          Reset Password
        </motion.h2>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-50 border border-red-100 text-red-500 p-4 rounded-xl mb-6"
            >
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-green-50 border border-green-100 text-green-500 p-4 rounded-xl mb-6"
            >
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3.5">
            <Mail strokeWidth={2} className="w-6 h-6 mr-3 text-gray-700" />
            <input
              type="email"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent outline-none text-black placeholder-gray-400"
              required
            />
          </div>

          <motion.button
            type="submit"
            disabled={isSubmitting || cooldown > 0}
            className={`w-full cursor-custom-pointer py-3.5 font-semibold rounded-xl flex items-center justify-center gap-2 bg-black text-white hover:bg-black/90 transition-colors ${
              isSubmitting || cooldown > 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
            whileHover={{ scale: isSubmitting || cooldown > 0 ? 1 : 1.01 }}
            whileTap={{ scale: isSubmitting || cooldown > 0 ? 1 : 0.99 }}
          >
            {success ? `Send again${cooldown > 0 ? ` (${cooldown}s)` : ""}` : "Send Reset Link"}{" "}
            <ArrowRight strokeWidth={3} className="w-4 h-4" />
          </motion.button>
        </form>

        <p className="mt-6 text-[13px] text-center text-gray-500">
          Remember password?{" "}
          <Link
            to="/auth"
            className="font-semibold cursor-custom-pointer text-black hover:underline transition-colors"
            style={{
              fontFamily: "Poppins, sans-serif",
            }}
          >
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;