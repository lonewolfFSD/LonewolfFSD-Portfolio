import React from 'react';
import { motion } from 'framer-motion';
import Helmet from 'react-helmet';

interface PricingCardProps {
  title: string;
  price: number;
  period: string;
  features: string[];
  isRecommended?: boolean;
  onChoose: (plan: { title: string; price: number; period: string }) => void;
}



const PricingCard: React.FC<PricingCardProps> = ({ title, price, period, features, isRecommended = false, onChoose }) => {
  const GST_RATE = 0.18;
  const basePrice = price / (1 + GST_RATE);
  const gstAmount = price * GST_RATE;
  const totalAmount = price;

  return (
    <motion.div
      className={`pricing-card w-full max-w-sm md:max-w-md bg-white text-black rounded-2xl py-10 px-10 text-left relative overflow-hidden border border-black ${isRecommended ? 'border-2 border-black shadow-lg shadow-black/20 scale-110' : 'scale-100'} mx-auto`}
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
        className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition-colors"
        whileTap={{ scale: 0.95 }}
        onClick={() => onChoose({ title, price, period })}
      >
        Choose Plan
      </motion.button>
    </motion.div>
  );
};

const PricingPage: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = React.useState<null | {
    title: string;
    price: number;
    period: string;
  }>(null);

  const handleChoosePlan = (plan: { title: string; price: number; period: string }) => {
  setSelectedPlan(plan);
};

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
        />
        <PricingCard
          title="Quarterly"
          price={6000}
          period="3 months"
          features={['Unlimited access', 'Priority support', '3 user accounts', 'Monthly updates', 'Exclusive features']}
          isRecommended={true}
          onChoose={handleChoosePlan}
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
              onClick={() => setSelectedPlan(null)}
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">Confirm Your Plan</h2>
            <p className="mb-2"><strong>Plan:</strong> {selectedPlan.title}</p>
            <p className="mb-2"><strong>Billing Cycle:</strong> {selectedPlan.period}</p>
            <p className="mb-4"><strong>Total (incl. GST):</strong> ₹{selectedPlan.price.toLocaleString()}</p>
            
            <button
              onClick={async () => {
                // You'd normally fetch the subscription from your Vercel API route
                const res = await fetch('https://lonewolffsd.in/api/create-subscription', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ plan: selectedPlan.title })
                });

                if (!res.ok) {
                  alert('Failed to create subscription. Please try again.');
                  return;
                }

                const { subscription_id, key } = await res.json();

                const razorpay = new window.Razorpay({
                  key,
                  subscription_id,
                  name: 'LonewolfFSD',
                  description: `${selectedPlan.title} Maintenance Plan`,
                  handler: (response) => {
                    alert('Payment successful!');
                    console.log(response);
                  },
                  theme: {
                    color: '#000000'
                  }
                });

                razorpay.open();
              }}
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