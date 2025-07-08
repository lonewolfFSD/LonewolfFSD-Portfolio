import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Helmet from 'react-helmet';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../firebase'; // Your Firestore instance from firebase.tsx

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
      className={`pricing-card w-full max-w-sm md:max-w-md bg-white text-black rounded-2xl py-10 px-10 text-left relative overflow-hidden border border-black ${isRecommended ? 'border-2 border-black shadow-lg shadow-black/20 scale-110' : 'scale-100'} mx-auto ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Helmet>
        <title>LonewolfFSD Maintenance Pricing</title>
      </Helmet>
      {isRecommended && (
        <div className="absolute -top-0 right-[115px] bg-black text-white px-5 py-2 rounded-b-lg text-xs font-semibold">
          Recommended
        </div>
      )}
      <h2 className="text-2xl font-semibold mb-3 mt-4" style={{ fontFamily: 'Poppins' }}>
        {title}
      </h2>
      <div className="text-4xl font-bold mb-6">
        ₹{price.toFixed(2)}
        <span className="text-base font-medium" style={{ fontFamily: 'Poppins' }}>
          /{period}
        </span>
      </div>
      <ul className="text-left mb-8 space-y-4 min-h-[300px]">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-base">
            <span className="mr-3">✔</span> {feature}
          </li>
        ))}
      </ul>
      <motion.button
        className={`w-full py-3 rounded-lg font-semibold transition-colors ${isDisabled ? 'bg-gray-400 text-gray-600 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-900'}`}
        whileTap={{ scale: isDisabled ? 1 : 0.95 }}
        onClick={() => !isDisabled && onChoose({ title, price, period })}
        disabled={isDisabled}
      >
        {isDisabled ? 'Plan Active' : 'Choose Plan'}
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
      key: 'rzp_test_qFMlNVzbfLAP7P',
      amount: selectedPlan!.price * 100,
      currency: 'INR',
      name: 'LonewolfFSD',
      description: `${selectedPlan!.title} Maintenance Plan`,
      image: 'https://lonewolffsd.in/logo.png',
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
            amount: purchaseData.amount.toFixed(2),
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
    <div className="min-h-screen bg-white text-black font-poppins flex flex-col items-center justify-center p-6">
      <motion.div
        className="text-left mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl lg:text-5xl font-semibold mb-4 mt-12 md:mt-auto text-center" style={{ fontFamily: 'Poppins' }}>
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
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 px-4">
          <div className="bg-white text-black rounded-xl p-8 w-full max-w-md shadow-lg relative">
            <button
              className="absolute top-3 right-4 text-xl"
              onClick={() => {
                setSelectedPlan(null);
                setWebsite('');
              }}
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">Confirm Your Plan</h2>
            <p className="mb-2"><strong>Plan:</strong> {selectedPlan.title}</p>
            <p className="mb-2"><strong>Billing Cycle:</strong> {selectedPlan.period}</p>
            <p className="mb-4"><strong>Total (incl. GST):</strong> ₹{selectedPlan.price.toLocaleString()}</p>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Website URL</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2"
                placeholder="https://example.com"
                required
              />
            </div>
            <button
              onClick={handlePurchase}
              className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-900"
            >
              Proceed to Pay
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingPage;