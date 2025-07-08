import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Helmet from 'react-helmet';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../firebase'; // Your Firestore instance from firebase.tsx
import logo from './mockups/logo.png';
import backdrop from './mockups/backdrop.jpg';

interface PricingCardProps {
  title: string;
  price: number;
  period: string;
  features: string[];
  isRecommended?: boolean;
  onChoose: (plan: { title: string; price: number; period: string }) => void;
  isDisabled: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({ title, price, period, features, isRecommended = false, onChoose, isDisabled }) => {
  const GST_RATE = 0.18;
  const basePrice = price / (1 + GST_RATE);
  const gstAmount = price * GST_RATE;
  

  return (
    <motion.div
      className={`pricing-card w-full max-w-sm md:max-w-md text-black rounded-2xl py-10 px-10 text-left relative overflow-hidden border border-black ${isRecommended ? 'border-2 border-black shadow-lg shadow-black/20 scale-110' : 'scale-100'} mx-auto ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={{
        backgroundImage: 'url("https://png.pngtree.com/thumb_back/fh260/background/20210526/pngtree-black-and-white-high-end-line-network-technology-background-image_720925.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Helmet>
        <title>LonewolfFSD Maintenance Pricing</title>
      </Helmet>
      {isRecommended && (
        <div className="absolute -top-0 right-0 lg:right-[115px] bg-black text-white px-5 py-2 rounded-bl-lg lg:rounded-b-lg text-xs font-semibold" style={{
          fontFamily: 'Poppins'
        }}>
          Recommended
        </div>
      )}
      <h2 className="text-xl font-semibold mb-2 mt-4" style={{ fontFamily: 'Poppins' }}>
        {title}
      </h2>
      <div className="text-3xl font-bold mb-6">
        ₹{price.toFixed(2)}
        <span className="text-base font-medium" style={{ fontFamily: 'Poppins' }}>
          /{period}
        </span>
      </div>
      <ul className="text-left mb-8 space-y-3 min-h-[300px]">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-sm">
            <span className="mr-3">✔</span> {feature}
          </li>
        ))}
      </ul>
      <motion.button
        className={`w-full py-3 text-[16px] rounded-lg font-medium transition-colors ${isDisabled ? 'bg-gray-400 text-gray-600 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-900'}`}
        whileTap={{ scale: isDisabled ? 1 : 0.95 }}
        onClick={() => !isDisabled && onChoose({ title, price, period })}
        disabled={isDisabled}
        style={{
          fontFamily: 'Poppins'
        }}
      >
        {isDisabled ? 'Plan Active' : `Select ${title} Plan`}
      </motion.button>
    </motion.div>
  );
};

const PricingPage: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<null | {
    title: string;
    price: number;
    period: string;
  }>(null);
  const [website, setWebsite] = useState('');
  const [disabledPlans, setDisabledPlans] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Loading state for auth
  const auth = getAuth();

const [loading, setLoading] = useState(false);
const [websiteError, setWebsiteError] = useState('');

  // Define plan durations
  const planDurations: { [key: string]: number } = {
    monthly: 30 * 24 * 60 * 60 * 1000, // 30 days
    quarterly: 90 * 24 * 60 * 60 * 1000, // 90 days
    yearly: 365 * 24 * 60 * 60 * 1000 // 365 days
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true);
      if (!user) {
        console.log('No user is logged in');
        setDisabledPlans([]);
        setIsLoading(false);
        return;
      }

      try {
        const userId = user.uid;
        console.log('Checking active plans for user:', userId);
        const purchasesRef = collection(db, 'users', userId, 'purchases');
        const q = query(purchasesRef, where('status', '==', 'completed'));
        const querySnapshot = await getDocs(q);

        const disabled: string[] = [];
        const now = new Date().getTime();

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          console.log('Purchase found:', data);
          const createdAt = data.createdAt.toDate().getTime();
          const durationMs = data.durationMs || planDurations[data.name.toLowerCase()] || 0;

          if (createdAt + durationMs > now) {
            disabled.push(data.name);
            console.log(`Plan ${data.name} is active until ${new Date(createdAt + durationMs).toISOString()}`);
          }
        });

        console.log('Disabled plans:', disabled);
        setDisabledPlans(disabled);
      } catch (error) {
        console.error('Error checking active plans:', error);
        alert('Failed to load active plans. Please try again.');
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [auth]);

  const handleChoosePlan = (plan: { title: string; price: number; period: string }) => {
    if (!auth.currentUser) {
      alert('Please log in to select a plan.');
      return;
    }
    setSelectedPlan(plan);
  };

  const handlePurchase = async () => {
  if (!website) {
    alert('Please enter a website URL');
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    alert('Please log in to proceed with the purchase.');
    setSelectedPlan(null);
    setWebsite('');
    return;
  }

  try {
    const userId = user.uid;
    const durationMs = planDurations[selectedPlan!.title.toLowerCase()];
    const purchaseData = {
      amount: selectedPlan!.price,
      createdAt: new Date().toISOString(), // Use ISO string for consistency
      date: new Date().toISOString().split('T')[0], // Date in YYYY-MM-DD format
      name: selectedPlan!.title,
      website: website,
      paymentType: 'real_money',
      status: 'pending',
      transactionId: '',
      type: 'maintenance',
      url: website,
      durationMs: durationMs
    };

    const razorpay = new (window as any).Razorpay({
      key: 'rzp_live_y2c1NPOWRBIcgH',
      amount: selectedPlan!.price * 100,
      currency: 'INR',
      name: 'LonewolfFSD',
      description: `${selectedPlan!.title} Maintenance Plan`,
      image: logo,
      handler: async (response: any) => {
        try {
          // Save to Firestore
          const purchasesRef = collection(db, 'users', userId, 'purchases');
          const docRef = await addDoc(purchasesRef, {
            ...purchaseData,
            createdAt: Timestamp.fromDate(new Date()), // Firestore Timestamp
            transactionId: response.razorpay_payment_id,
            status: 'success'
          });
          console.log('Purchase saved to Firestore:', {
            id: docRef.id,
            ...purchaseData,
            transactionId: response.razorpay_payment_id,
            status: 'success'
          });

          // Send to Google Sheets
          const sheetData = {
            amount: "₹" + purchaseData.amount.toFixed(2),
            createdAt: purchaseData.createdAt,
            date: purchaseData.date,
            name: purchaseData.name,
            website: purchaseData.website,
            paymentType: purchaseData.paymentType,
            status: 'success',
            transactionId: response.razorpay_payment_id,
            type: purchaseData.type,
            url: purchaseData.url,
            durationMs: purchaseData.durationMs
          };

          const sheetResponse = await fetch('https://lonewolffsd.in/api/updateGoogleSheet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sheetData)
          });

          let sheetResponseData;
          try {
            sheetResponseData = await sheetResponse.json();
          } catch (parseError) {
            console.error('Failed to parse Google Sheets response:', parseError);
            alert('Payment successful, but failed to update Google Sheet. Please contact support.');
            return;
          }

          if (!sheetResponse.ok) {
            console.error('Failed to update Google Sheets:', sheetResponse.status, sheetResponseData);
            alert('Payment successful, but failed to update Google Sheet. Please contact support.');
            return;
          }

          console.log('Data sent to Google Sheets:', sheetResponseData);
          alert('Payment successful! Purchase saved.');
          setDisabledPlans([...disabledPlans, selectedPlan!.title]);
          setSelectedPlan(null);
          setWebsite('');
        } catch (error) {
          console.error('Error processing purchase:', error);
          alert('Payment successful, but failed to save purchase. Please contact support.');
        }
      },
      prefill: {
        name: user.displayName || 'Client Name',
        email: user.email || 'client@example.com',
        contact: user.phoneNumber || '9999999999'
      },
      theme: {
        color: '#000000'
      }
    });

    razorpay.open();
  } catch (error) {
    console.error('Error initiating purchase:', error);
    alert('Error initiating purchase. Please try again.');
  }
};

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white text-black font-poppins flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black font-poppins flex flex-col items-center justify-center p-6"
          style={{
        backgroundImage: `url(${backdrop})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
      <motion.div
        className="text-left mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl lg:text-4xl font-semibold mb-4 mt-12 lg:mt-auto text-center" style={{ fontFamily: 'Poppins' }}>
          Choose Your Maintenance Plan
        </h1>
        <p className="text-base md:text-lg text-center">Flexible pricing to suit your needs.</p>
      </motion.div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl w-full place-items-center md:place-items-start">
        <PricingCard
          title="Monthly"
          price={2500}
          period="month"
          features={['Unlimited access', 'Basic support', '1 user account', 'Monthly updates']}
          onChoose={handleChoosePlan}
          isDisabled={disabledPlans.includes('Monthly')}
        />
        <PricingCard
          title="Quarterly"
          price={6000}
          period="3 months"
          features={['Unlimited access', 'Priority support', '3 user accounts', 'Monthly updates', 'Exclusive features']}
          isRecommended={true}
          onChoose={handleChoosePlan}
          isDisabled={disabledPlans.includes('Quarterly')}
        />
        <PricingCard
          title="Yearly"
          price={18000}
          period="year"
          features={[
            'Unlimited access',
            'Premium support',
            '5 user accounts',
            'Monthly updates',
            'Exclusive features',
            'Annual insights report',
          ]}
          onChoose={handleChoosePlan}
          isDisabled={disabledPlans.includes('Yearly')}
        />
        <span className="lg:hidden">
          <br />
        </span>
      </div>

      {selectedPlan && (
<div className="fixed inset-0 bg-black bg-opacity-80 z-50">
  <div className="flex items-center justify-center h-screen md:px-4 py-8 md:py-8">
    <div className="bg-white text-black md:rounded-xl p-6 sm:p-10 w-full max-w-xl shadow-lg relative
                    h-screen sm:h-auto flex flex-col justify-center">
      <button
        className="absolute top-3 right-4 text-xl"
        onClick={() => {
          setSelectedPlan(null);
          setWebsite('');
          setWebsiteError(''); // Reset website error
          setLoading(false); // Reset loading state
        }}
      >
        ✕
      </button>
      <h2 className="text-2xl font-semibold mb-6" style={{ fontFamily: 'Poppins' }}>
        Confirm Your Plan
      </h2>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="font-bold">Plan:</span>
          <span>{selectedPlan.title}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold">Billing Cycle:</span>
          <span>{selectedPlan.period}</span>
        </div>
        <hr className="my-3" />
        <div className="flex justify-between">
          <span className="font-bold">Total (incl. GST):</span>
          <span>₹{selectedPlan.price.toLocaleString()}</span>
        </div>
        <hr className="my-3" />
      </div>
      <br />
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Website URL</label>
        <input
          type="url"
          value={website}
          onChange={(e) => {
            setWebsite(e.target.value);
            // Validate URL or domain
            const isValid = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/.test(e.target.value);
            setWebsiteError(isValid || e.target.value === '' ? '' : 'Please enter a valid URL or domain (e.g., https://example.com or example.com)');
          }}
          className={`w-full border text-sm ${websiteError ? 'border-red-500' : 'border-gray-300'} rounded-md p-3`}
          placeholder="https://example.com"
          required
        />
        {websiteError && (
          <p className="text-red-500 text-sm mt-1.5">{websiteError}</p>
        )}
      </div>
      <button
        onClick={handlePurchase}
        style={{
          fontFamily: 'Poppins'
        }}
        disabled={loading || websiteError || !website}
        className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center ${
          loading || websiteError || !website ? 'bg-black/90 text-white/50 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-900'
        }`}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-5 w-5 mr-2 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing...
          </>
        ) : (
          'Proceed to Pay'
        )}
      </button>
      <br />
      <p className="text-xs text-gray-700">
  This transaction is legally valid and will be securely logged in both the LonewolfFSD server and the user's account transaction history. Refunds are permitted within 7 days from the date of service initiation.
</p>

<p className="text-xs text-gray-700 mt-3">
  After a successful purchase, the selected plan remains active for its full duration and cannot be repurchased until that period has ended.
</p>


      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default PricingPage;