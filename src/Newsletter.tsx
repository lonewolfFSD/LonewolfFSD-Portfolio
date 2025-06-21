import React, { useState } from 'react';
import { Mail, X } from 'lucide-react';
import Logo from './mockups/logo.png'; // Adjust path to your Lonewolf Accelerate logo
import { useTranslation } from 'react-i18next';

interface NewsletterFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewsletterForm: React.FC<NewsletterFormProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

    const { t, i18n } = useTranslation();

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Invalid email address');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('https://script.google.com/macros/s/AKfycbxPvp7anY1apAXyrlYDZIgDZzVqnOupZN-EgvQTfvyLL-aviuYiRbotB5UDdHgnP4celg/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email }).toString(),
        mode: 'no-cors', // Required for Google Apps Script
      });

      // Note: 'no-cors' prevents reading response body, so assume success unless error
      setError('');
      setSuccess(true);
      setTimeout(() => {
        setEmail('');
        setSuccess(false);
        setIsLoading(false);
        onClose();
      }, 2000);
    } catch (err) {
      setError('Failed to subscribe. Please try again.');
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white w-full h-full md:h-auto md:max-w-xl md:w-auto rounded-none md:rounded-xl relative shadow-lg px-6 md:px-12 md:py-14 flex flex-col justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl"
            aria-label="Close newsletter form"
          >
            <X />
          </button>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              {t('Subscribe to Our Weekly Newsletter')}
            </h2>
          </div>
          <p className="text-gray-600 mb-6">
            {t('Join the Lonewolf Accelerate community! Get the latest news, exclusive content, and expert tips delivered to your inbox every week.')}
          </p>
          {success ? (
            <div className="text-green-600 font-semibold mb-4">
              {t('Thank you for subscribing! Check your inbox soon.')}
            </div>
          ) : (
            <div>
              <div className="relative">
                <Mail
                  strokeWidth={2}
                  className="absolute left-3 top-6 transform -translate-y-1/2 text-gray-800"
                  size={20}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('Enter your email address')}
                  className="w-full p-3 pl-10 border rounded-lg border-black/30 text-[15px] mb-4 outline-none"
                  aria-required="true"
                />
              </div>
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              <button
                onClick={handleSubmit}
                className="w-full font-medium bg-black text-[14.5px] text-white p-3 rounded-lg hover:bg-black/90 transition flex items-center justify-center"
                style={{
                  fontFamily: 'Poppins',
                  letterSpacing: '0.5px'
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  </div>
                ) : (
                  t("I'm Interested")
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsletterForm;