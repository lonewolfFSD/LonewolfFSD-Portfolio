// src/CheckYourEmail.tsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight, RefreshCw } from "lucide-react";
import { auth, sendEmailVerification } from "../firebase";
import { useNavigate } from "react-router-dom";

interface CheckYourEmailProps {
  isDark: boolean;
}

const CheckYourEmail: React.FC<CheckYourEmailProps> = ({ isDark }) => {
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isResending, setIsResending] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleResendEmail = async () => {
    setError("");
    setSuccess("");
    if (!auth.currentUser) {
      setError("No user is signed in. Please sign up again.");
      return;
    }
    try {
      setIsResending(true);
      await sendEmailVerification(auth.currentUser);
      setSuccess("Verification email resent successfully!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center md:p-6 bg-white">

      <motion.div
        className="w-full max-w-[480px] p-6 md:p-14 md:rounded-3xl md:shadow-[0_0_60px_-15px_rgba(0,0,0,0.1)] bg-white relative"
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
          className="text-[33px] font-bold mb-8 text-center text-black tracking-tight"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            fontFamily: "Poppins",
          }}
        >
          Check Your Email
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

        <p className="text-center text-gray-600 mb-6">
          We’ve sent a verification email to <strong>{auth.currentUser?.email || "your email"}</strong>.
          Please click the link in the email to verify your account.
        </p>

        <div className="space-y-4">
          <motion.button
            onClick={handleResendEmail}
            disabled={isResending}
            className={`w-full py-3.5 rounded-xl flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 transition-colors ${
              isResending ? "opacity-50 cursor-not-allowed" : ""
            }`}
            whileHover={{ scale: isResending ? 1 : 1.01 }}
            whileTap={{ scale: isResending ? 1 : 0.99 }}
          >
            <RefreshCw className={`w-5 h-5 ${isResending ? "animate-spin" : ""}`} />
            Resend Email
          </motion.button>

          <motion.button
            onClick={() => navigate("/")}
            className="w-full py-3.5 cursor-custom-pointer rounded-xl flex items-center justify-center gap-2 bg-black text-white hover:bg-black/90 transition-colors"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            Continue <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>

        <p className="mt-8 text-sm text-center text-gray-500">
          Already verified?{" "}
          <button
            onClick={() => navigate("/")}
            className="font-semibold cursor-custom-pointer text-black hover:underline transition-colors"
          >
            Sign In
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default CheckYourEmail;