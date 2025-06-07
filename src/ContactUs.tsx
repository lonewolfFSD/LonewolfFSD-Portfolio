import React, { useState, FormEvent } from 'react';
import { db } from '../firebase'; // Adjust path to your firebase.ts
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { ArrowLeft, ArrowRight } from 'lucide-react';

// Interface for form data
interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  workType: string;
  contactMethod: string;
  contactTime: string;
}

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    workType: '',
    contactMethod: '',
    contactTime: ''
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      // Validates format like +91 98765 43210
      const phoneRegex = /^\+91\s\d{5}\s\d{5}$/;
      if (value && !phoneRegex.test(value)) {
        setPhoneError('Please enter a valid phone number (e.g., +91 98765 43210)');
      } else {
        setPhoneError('');
      }
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (phoneError) return;
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, 'enquiries'), {
        ...formData,
        createdAt: serverTimestamp()
      });
      
      setIsSubmitted(true);
      toast.success('Details saved successfully! LonewolfFSD will contact you soon.', {
        style: {
          background: '#ffffff',
          color: '#000000',
          border: '1px solid #000000',
        }
      });
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          company: '',
          workType: '',
          contactMethod: '',
          contactTime: ''
        });
        setCurrentStep(1);
      }, 3000);
    } catch (error) {
      console.error('Error saving enquiry:', error);
      toast.error('Failed to save details. Please try again.', {
        style: {
          background: '#ffffff',
          color: '#000000',
          border: '1px solid #000000',
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Move to next or previous step
  const nextStep = () => {
    if (currentStep === 1 && (!formData.firstName || !formData.lastName || !formData.email)) {
      toast.error('Please fill in all required fields.', {
        style: {
          background: '#ffffff',
          color: '#000000',
          border: '1px solid #000000',
        }
      });
      return;
    }
    if (currentStep === 2 && (!formData.company || !formData.workType)) {
      toast.error('Please fill in all required fields.', {
        style: {
          background: '#ffffff',
          color: '#000000',
          border: '1px solid #000000',
        }
      });
      return;
    }
    if (currentStep < 3) setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: '0 0 15px rgba(0, 0, 0, 0.2)',
      transition: { duration: 0.3 }
    },
    tap: { scale: 0.95 }
  };

  const lineVariants = {
    hidden: { scaleX: 0, originX: 0.5 },
    visible: { scaleX: 1, originX: 0.5, transition: { duration: 0.5, ease: 'easeInOut' } }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Toaster position="top-right" />
      <motion.div
        className="w-full max-w-xl bg-white border border-black/20 rounded-2xl px-8 py-14 shadow-lg"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <>
              {/* Step Tracker */}
<div className="mb-8">
  <div className="flex items-center justify-center gap-4">
    <motion.div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
        currentStep >= 1 ? 'bg-black text-white' : 'bg-black/10 text-black/50'
      }`}
      animate={{ scale: currentStep === 1 ? 1.2 : 1 }}
      transition={{ duration: 0.3 }}
    >
      1
    </motion.div>
    <motion.div
      className="h-1 mx-1"
      animate={{ backgroundColor: currentStep > 1 ? '#000000' : '#00000033' }}
      variants={lineVariants}
      initial="hidden"
      animate={currentStep > 1 ? 'visible' : 'hidden'}
    />
    <motion.div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
        currentStep >= 2 ? 'bg-black text-white' : 'bg-black/10 text-black/50'
      }`}
      animate={{ scale: currentStep === 2 ? 1.2 : 1 }}
      transition={{ duration: 0.3 }}
    >
      2
    </motion.div>
    <motion.div
      className="h-1  mx-1"
      animate={{ backgroundColor: currentStep > 2 ? '#000000' : '#00000033' }}
      variants={lineVariants}
      initial="hidden"
      animate={currentStep > 2 ? 'visible' : 'hidden'}
    />
    <motion.div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
        currentStep >= 3 ? 'bg-black text-white' : 'bg-black/10 text-black/50'
      }`}
      animate={{ scale: currentStep === 3 ? 1.2 : 1 }}
      transition={{ duration: 0.3 }}
    >
      3
    </motion.div>
  </div>

              </div>
                    
              <motion.h2
                className="text-3xl font-bold text-black mb-6 text-center tracking-wide"
                variants={itemVariants}
                style={{
                  fontFamily: 'Poppins'
                }}
              >
                Contact LonewolfFSD
              </motion.h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {currentStep === 1 && (
                  <motion.div key="step1" variants={itemVariants} initial="hidden" animate="visible">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-black/80 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white border border-black/20 rounded-lg text-black focus:outline-none focus:border-black/50 transition-all duration-300"
                        placeholder="First Name"
                      />
                    </div>
                    <div className="mt-4">
                      <label htmlFor="lastName" className="block text-sm font-medium text-black/80 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white border border-black/20 rounded-lg text-black focus:outline-none focus:border-black/50 transition-all duration-300"
                        placeholder="Last Name"
                      />
                    </div>
                    <div className="mt-4">
                      <label htmlFor="email" className="block text-sm font-medium text-black/80 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white border border-black/20 rounded-lg text-black focus:outline-none focus:border-black/50 transition-all duration-300"
                        placeholder="example@example.com"
                      />
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div key="step2" variants={itemVariants} initial="hidden" animate="visible">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-black/80 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 bg-white border ${
                          phoneError ? 'border-red-500' : 'border-black/20'
                        } rounded-lg text-black focus:outline-none focus:border-black/50 transition-all duration-300`}
                        placeholder="(000) 000-0000"
                      />
                      {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
                    </div>
                    <div className="mt-4">
                      <label htmlFor="company" className="block text-sm font-medium text-black/80 mb-2">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white border border-black/20 rounded-lg text-black focus:outline-none focus:border-black/50 transition-all duration-300"
                        placeholder="Company Name"
                      />
                    </div>
                    <div className="mt-4">
                      <label htmlFor="workType" className="block text-sm font-medium text-black/80 mb-2">
                        Type of Work Required *
                      </label>
                      <select
                        id="workType"
                        name="workType"
                        value={formData.workType}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white border border-black/20 rounded-lg text-black focus:outline-none focus:border-black/50 transition-all duration-300"
                      >
                        <option value="">Select Work Type</option>
                        <option value="Web Development">Web Development</option>
                        <option value="Mobile Development">Mobile Development</option>
                        <option value="UI/UX Design">UI/UX Design</option>
                        <option value="Backend Development">Backend Development</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div key="step3" variants={itemVariants} initial="hidden" animate="visible">
                    <div>
                      <label htmlFor="contactMethod" className="block text-sm font-medium text-black/80 mb-2">
                        Preferred Contact Method *
                      </label>
                      <select
                        id="contactMethod"
                        name="contactMethod"
                        value={formData.contactMethod}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white border border-black/20 rounded-lg text-black focus:outline-none focus:border-black/50 transition-all duration-300"
                      >
                        <option value="">Select Contact Method</option>
                        <option value="Email">Email</option>
                        <option value="Phone">Phone</option>
                        <option value="Video Call">Video Call</option>
                      </select>
                    </div>
                    <div className="mt-4">
                      <label htmlFor="contactTime" className="block text-sm font-medium text-black/80 mb-2">
                        Best Time to Contact *
                      </label>
                      <select
                        id="contactTime"
                        name="contactTime"
                        value={formData.contactTime}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white border border-black/20 rounded-lg text-black focus:outline-none focus:border-black/50 transition-all duration-300"
                      >
                        <option value="">Select Time</option>
                        <option value="Morning">Morning</option>
                        <option value="Afternoon">Afternoon</option>
                        <option value="Evening">Evening</option>
                        <option value="Anytime">Anytime</option>
                      </select>
                    </div>
                  </motion.div>
                )}

                <div className="flex justify-between mt-6">
                  {currentStep > 1 && (
                    <motion.button
                      type="button"
                      onClick={prevStep}
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      className="py-3 px-10 flex gap-2 bg-black/10 text-black font-semibold rounded-lg hover:bg-black/20 transition-all duration-300"
                    >
                      <ArrowLeft size={18} strokeWidth={3} className='mt-0.5' /> Previous
                    </motion.button>
                  )}
                  {currentStep < 3 ? (
                    <motion.button
                      type="button"
                      onClick={nextStep}
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      className="py-3 px-10 flex gap-2 bg-black text-white font-semibold rounded-lg hover:bg-black/90 transition-all duration-300 ml-auto"
                    >
                      Next Step <ArrowRight size={18} strokeWidth={3} className='mt-1' />
                    </motion.button>
                  ) : (
                    <motion.button
                      type="submit"
                      disabled={isSubmitting || !!phoneError}
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      className="py-3 px-6 bg-black text-white font-semibold rounded-lg hover:bg-black/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ml-auto"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Submitting...
                        </span>
                      ) : (
                        'Submit Enquiry'
                      )}
                    </motion.button>
                  )}
                </div>
              </form>
            </>
          ) : (
            <motion.div
              className="text-center text-black"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold mb-4">Success!</h2>
              <p>Details saved successfully on queue list.</p>
              <p>LonewolfFSD will soon contact you for further details.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ContactForm;