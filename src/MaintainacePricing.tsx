import React from 'react';
import { motion } from 'framer-motion';
import Helmet from 'react-helmet';

interface PricingCardProps {
  title: string;
  price: number;
  period: string;
  features: string[];
  isRecommended?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({ title, price, period, features, isRecommended = false }) => {
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
        onClick={() => window.location.href = '/contact'}
      >
        Choose Plan
      </motion.button>
    </motion.div>
  );
};

const PricingPage: React.FC = () => {
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
        />
        <PricingCard
          title="Quarterly"
          price={6000}
          period="3 months"
          features={['Unlimited access', 'Priority support', '3 user accounts', 'Monthly updates', 'Exclusive features']}
          isRecommended={true}
        />
        <PricingCard
          title="Yearly"
          price={20000}
          period="year"
          features={[
            'Unlimited access',
            'Premium support',
            '5 user accounts',
            'Monthly updates',
            'Exclusive features',
            'Annual insights report',
          ]}
        />
        <span className="lg:hidden">
          <br />
        </span>
      </div>
    </div>
  );
};

export default PricingPage;