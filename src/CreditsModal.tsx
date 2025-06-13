import React, { useState } from 'react';
import { db } from '../firebase'; // Assuming Firebase is set up
import { doc, updateDoc } from 'firebase/firestore';
import { loadRazorpay } from '../razorpay'; // Utility to load Razorpay SDK
import { motion, AnimatePresence } from 'framer-motion'; // For animations

const CreditsModal = ({ userId, isOpen, onClose, currentCredits }) => {
  const [eventCredits, setEventCredits] = useState(0);
  const [isClaimed, setIsClaimed] = useState(false); // Track if event reward is claimed
  const [showPurchaseAnimation, setShowPurchaseAnimation] = useState(false);

  // Handle Event Drop claim
  const handleClaimEventDrop = async () => {
    if (isClaimed) return;
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { credits: currentCredits + eventCredits, eventClaimed: true });
      setIsClaimed(true);
    } catch (error) {
      console.error('Error claiming event drop:', error);
    }
  };

  // Handle Razorpay payment
  const handlePurchase = async (amount) => {
    const options = {
      key: 'YOUR_RAZORPAY_KEY', // Replace with your Razorpay key
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      name: 'Your App Name',
      description: `Purchase ${amount} Credits`,
      handler: async (response) => {
        try {
          const userRef = doc(db, 'users', userId);
          await updateDoc(userRef, { credits: currentCredits + amount });
          setShowPurchaseAnimation(true);
          setTimeout(() => setShowPurchaseAnimation(false), 2000); // Hide animation after 2s
        } catch (error) {
          console.error('Error updating credits:', error);
        }
      },
      prefill: { contact: '', email: '' }, // Add user details if available
      theme: { color: '#1F2937' }, // Dark theme
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gray-800 text-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Manage Credits</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-white">
                &times;
              </button>
            </div>

            {/* Event Drop Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Event Drop</h3>
              <p className="text-gray-300 mb-2">Claim a one-time event reward!</p>
              <input
                type="number"
                value={eventCredits}
                onChange={(e) => setEventCredits(Number(e.target.value))}
                placeholder="Enter event credits"
                className="w-full p-2 bg-gray-700 rounded mb-2"
                disabled={isClaimed}
              />
              <button
                onClick={handleClaimEventDrop}
                disabled={isClaimed || eventCredits <= 0}
                className={`w-full p-2 rounded ${
                  isClaimed ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isClaimed ? 'Claimed' : 'Claim Reward'}
              </button>
            </div>

            {/* Store Section */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Store</h3>
              <p className="text-gray-300 mb-2">Buy credits with real money</p>
              <div className="grid grid-cols-1 gap-4">
                {[500, 5000, 10000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handlePurchase(amount)}
                    className="flex items-center justify-between p-3 bg-gray-700 rounded hover:bg-gray-600"
                  >
                    <span>{amount} Credits</span>
                    <span className="text-yellow-400">🪙 ₹{amount / 10}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Purchase Animation Overlay */}
      {showPurchaseAnimation && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="text-white text-2xl font-bold"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 1.5 }}
          >
            🎉 Purchase Successful! Credits Added! 🪙
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreditsModal;