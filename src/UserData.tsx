import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '../firebase'; // Adjust path to your Firebase config
import { doc, getDoc, collection, getDocs, setDoc, addDoc } from 'firebase/firestore';
import { Search, Mail, Phone, Briefcase, Calendar, FileText, HelpCircle, Earth, CreditCard, Code2, Paperclip, Lightbulb, Package, Package2, PackageOpen, PackageCheck, AlertTriangle, StarHalf, Sparkle, Sparkles } from 'lucide-react';
import Helmet from 'react-helmet';

// Define interfaces for your data
interface UserData {
  name: string;
  email: string;
  companyName?: string;
  phoneNo?: string;
  startDate?: string;
  currentProject?: string;
  [key: string]: any;
}

interface PaymentLog {
  id: string;
  amount: number;
  date: string;
  status: string;
  razorpayOrderId?: string;
}

interface Project {
  id: string;
  name: string;
  progress: number;
  startDate?: string;
  deadline?: string;
  description?: string;
  paymentStatus: string; // e.g., "Paid", "Unpaid", "Partially Paid"
  price: number; // Project price in INR
  paymentLogs?: PaymentLog[];
  [key: string]: any;
}

const UserDataPage: React.FC = () => {
  const [uid, setUid] = useState<string>('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Initialize Lucide icons and load Razorpay script
  useEffect(() => {
    // Load Razorpay Checkout script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleFetchData = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Fetch user data
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        setError('User not found with the provided FSD ID. Try checking for any typo mistake.');
        setUserData(null);
        setProjects([]);
        setLoading(false);
        return;
      }

      const userData = userDoc.data() as UserData;
      if (userData.startDate && userData.startDate.toDate) {
        userData.startDate = userData.startDate.toDate().toLocaleDateString();
      }
      setUserData(userData);

      // Fetch projects and their payment logs
      const projectsRef = collection(db, 'users', uid, 'projects');
      const projectsSnapshot = await getDocs(projectsRef);
      const projectsData = await Promise.all(
        projectsSnapshot.docs.map(async doc => {
          const projectData = doc.data() as Project;
          // Fetch payment logs for this project
          const paymentLogsRef = collection(db, 'users', uid, 'projects', doc.id, 'paymentLogs');
          const paymentLogsSnapshot = await getDocs(paymentLogsRef);
          const paymentLogsData = paymentLogsSnapshot.docs.map(logDoc => ({
            id: logDoc.id,
            ...logDoc.data(),
            date: logDoc.data().date?.toDate
              ? logDoc.data().date.toDate().toLocaleDateString()
              : 'N/A',
          })) as PaymentLog[];

          return {
            id: doc.id,
            ...projectData,
            startDate: projectData.startDate?.toDate
              ? projectData.startDate.toDate().toLocaleDateString()
              : 'N/A',
            deadline: projectData.deadline?.toDate
              ? projectData.deadline.toDate().toLocaleDateString()
              : 'N/A',
            paymentLogs: paymentLogsData,
          };
        })
      );
      setProjects(projectsData);
    } catch (err) {
      setError('Failed to fetch data. Please check the UID and try again.');
      console.error(err);
      setUserData(null);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  // Razorpay payment handler
  const handlePayAdvance = async (project: Project) => {
    const options = {
      key: 'rzp_test_qFMlNVzbfLAP7P', // Your Razorpay Key ID
      amount: project.price * 100, // Convert INR to paise
      currency: 'INR',
      name: 'LonewolfFSD',
      description: `Advance payment for ${project.name}`,
      handler: async function (response: any) {
        try {
          // Add payment log
          await addDoc(collection(db, 'users', uid, 'projects', project.id, 'paymentLogs'), {
            amount: project.price,
            date: new Date(),
            status: 'Success',
            razorpayOrderId: response.razorpay_payment_id,
          });

          // Update project payment status
          await setDoc(
            doc(db, 'users', uid, 'projects', project.id),
            { paymentStatus: 'Paid' },
            { merge: true }
          );

          // Update local state
          setProjects(prev =>
            prev.map(p =>
              p.id === project.id ? { ...p, paymentStatus: 'Paid' } : p
            )
          );

          setToast({ message: `Payment of ₹${project.price} successful! Payment ID: ${response.razorpay_payment_id}`, type: 'success' });
        } catch (err) {
          console.error('Failed to update Firestore:', err);
          setToast({ message: 'Failed to save payment details.', type: 'error' });
        }
      },
      modal: {
        ondismiss: () => {
          setToast({ message: 'Payment cancelled.', type: 'error' });
        },
      },
      prefill: {
        name: userData?.name || 'Client',
        email: userData?.email || '',
        contact: userData?.phoneNo || '',
      },
      theme: {
        color: '#000000',
      },
    };

    try {
      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response.error);
        setToast({ message: `Payment failed: ${response.error.description}`, type: 'error' });
      });
      rzp.open();
    } catch (err) {
      console.error('Razorpay error:', err);
      setToast({ message: 'Failed to initiate payment.', type: 'error' });
    }
  };

  const defaultUserData = {
    name: 'N/A',
    email: 'N/A',
    companyName: 'N/A',
    phoneNo: 'N/A',
    startDate: 'N/A',
    currentProject: 'N/A',
  };

  const displayUserData = userData || defaultUserData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 p-8 font-inter">
      <Helmet>
        <title>Client Dashboard | LonewolfFSD</title>
      </Helmet>
      <div className="max-w-7xl mx-auto relative">
        {/* Toast Notification */}
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
              toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {toast.message}
          </motion.div>
        )}

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <br /><br />
          <h1 className="text-5xl font-bold text-gray-900 mb-6 flex items-center gap-3" style={{ fontFamily: 'Poppins'}}>
            
            LonewolfFSD Client Dashboard
          </h1>
            <p className='font-semibold mb-1' style={{ fontFamily: 'Poppins'}}>FSD ID</p>
          <form onSubmit={handleFetchData} className="flex items-center gap-2">
            <motion.input
              type="text"
              value={uid}
              onChange={(e) => setUid(e.target.value.trim())}
              placeholder="Enter Firebase UID"
              className="w-full max-w-md px-5 py-3 text-sm border-2 rounded-xl border border-black bg-white/80 backdrop-blur-sm  outline-none transition-all"
              required
            />
            <motion.button
              type="submit"
              disabled={loading}
              className={`px-10 py-3 rounded-lg text-white font-semibold flex items-center gap-2 ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-black/90'
              } transition-colors`}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.95 }}
              >
              {loading ? 'Loading...' : 'Fetch Details'}
            </motion.button>
          </form>
          <p className="mt-3 text-xs text-gray-600">
            Enter your <a href="/profile" className='underline font-semibold' title='An unique ID given to each member of LonewolfFSD to identify them' style={{ fontFamily: 'Poppins'}}>FSD ID</a> to securely access the details of your orders.
          </p>
          {error && (
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-4 flex bg-red-100 border border-2 border-red-700 font-semibold text-sm text-red-800 gap-2 rounded-lg w-full max-w-md"
            >
              <AlertTriangle size={18} className='mt-0' /> {error}
            </motion.div>
          )}
        </motion.div>

        {/* Tabs Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <div className="flex border-b border-gray-300">
            {['overview', 'All Projects', 'Client Helpdesk'].map(tab => (
              <button
                key={tab}
                className={`px-6 py-3 font-semibold text-sm relative ${
                  activeTab === tab
                    ? 'text-black after:absolute after:bottom-0 after:left-0 after:w-full after:h-1 after:bg-black'
                    : 'text-gray-600 hover:text-black'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
          >
            {/* Client Details */}
            <div className="bg-white shadow-xl rounded-2xl border border-black border-2 p-8 transform transition-all hover:shadow-2xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <FileText className="h-7 w-7 text-gray-700" />
                Client Details
              </h2>
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-600">Name:</span>
                  <span className="text-gray-900">{displayUserData.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-600">Email:</span>
                  <span className="text-gray-900">{displayUserData.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-600">Company Name:</span>
                  <span className="text-gray-900">{displayUserData.companyName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-600">Phone Number:</span>
                  <span className="text-gray-900">{displayUserData.phoneNo}</span>
                </div>
                {userData &&
                  Object.entries(userData).map(([key, value]) => {
                    if (['name', 'email', 'companyName', 'phoneNo', 'startDate', 'currentProject'].includes(key))
                      return null;
                    return (
                      <div key={key} className="flex justify-between items-center">
                        <span className="font-medium text-gray-600">
                          {key.charAt(0).toUpperCase() + key.slice(1)}:
                        </span>
                        <span className="text-gray-900">
                          {typeof value === 'string' || typeof value === 'number'
                            ? value
                            : JSON.stringify(value)}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Current Project Details */}
            <div className="bg-white shadow-xl rounded-xl p-8 transform border border-black border-2 transition-all hover:shadow-2xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <PackageOpen className="h-7 w-7 text-gray-700" />
                Current Order Details
              </h2>
              {displayUserData.currentProject === 'N/A' ? (
                <p className="text-gray-600">No current project assigned.</p>
              ) : (
                projects
                  .filter(project => project.name === displayUserData.currentProject)
                  .map(project => (
                    <div key={project.id} className="space-y-5">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-600">Project Name:</span>
                        <span className="text-gray-900">{project.name}</span>
                      </div>
                      <div className="flex items-center justify-between w-full">
                      <span className="font-medium text-gray-600 mr-4">Progress:</span>
                      
                      <div className="flex justify-end gap-3 w-full">
                        <div className="w-full max-w-xs bg-gray-200 rounded-full h-[7px] overflow-hidden">
                          <motion.div
                            className="bg-black h-[7px] rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${project.progress}%` }}
                            transition={{ duration: 1 }}
                          />
                        </div>
                        
                        <span className="text-sm -mt-1.5 font-semibold text-gray-700 whitespace-nowrap">
                          {project.progress}%
                        </span>
                      </div>
                    </div>

                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-600">Price:</span>
                        <span className="text-gray-900">₹{project.price.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-600">Payment Status:</span>
                        <span
                          className={`${
                            project.paymentStatus === 'Paid'
                              ? 'text-green-600'
                              : project.paymentStatus === 'Unpaid'
                              ? 'text-red-600'
                              : 'text-yellow-600'
                          } font-semibold`}
                        >
                          {project.paymentStatus}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-600">Start Date:</span>
                        <span className="text-gray-900">{project.startDate || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-600">Deadline:</span>
                        <span className="text-gray-900">{project.deadline || 'N/A'}</span>
                      </div>
                      {project.description && (
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-600">Description:</span>
                          <span className="text-gray-900">{project.description}</span>
                        </div>
                      )}
                      {project.paymentLogs && project.paymentLogs.length > 0 && (
                        <div className="mt-6">
                          <h3 className="text-lg font-medium text-gray-600 mb-3">Payment Logs</h3>
                          <div className="space-y-3">
                            {project.paymentLogs.map(log => (
                              <div
                                key={log.id}
                                className="flex justify-between items-center text-sm text-gray-600"
                              >
                                <span>
                                  {log.date} - ₹{log.amount.toLocaleString()} ({log.status})
                                </span>
                                {log.razorpayOrderId && (
                                  <span className="text-blue-600">Order ID: {log.razorpayOrderId}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <hr className="py-2" />

                      {project.paymentStatus !== 'Paid' && project.progress < 100 ? (
                        <>
                          <h2 className="text-xl font-semibold" style={{ fontFamily: 'Poppins' }}>
                            Wanna pay in advance?
                          </h2>
                          
                          <p className="text-sm text-gray-600 block" style={{
                            marginTop: '8px'
                          }}>
                            Paying a part of the amount now gives your project a serious boost. Here’s what you get:
                          </p>

                          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 mb-4">
                            <li>Priority delivery</li>
                            <li>Early access to progress updates</li>
                            <li>Better support & communication</li>
                            <li>Secures your project slot</li>
                          </ul>

                          <motion.button
                            onClick={() => handlePayAdvance(project)}
                            className="mt-2 px-5 py-2 bg-black text-white rounded-lg flex items-center gap-2 font-semibold"
                            whileTap={{ scale: 0.99 }}
                          >
                            <CreditCard className="h-5 w-5" />
                            Pay Advance (₹{project.price.toLocaleString()})
                          </motion.button>
                        </>
                      ) : (
                        <>
                          <h2 className="text-lg font-semibold mb-2 text-green-700">
                            Payment received. Thanks for trusting the process 🙌
                          </h2>
                          <button
                            disabled
                            className="mt-2 px-5 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 font-semibold cursor-not-allowed"
                          >
                            <CreditCard className="h-5 w-5" />
                            Paid
                          </button>
                        </>
                      )}


                      {Object.entries(project).map(([key, value]) => {
                        if (['id', 'name', 'progress', 'startDate', 'deadline', 'description', 'paymentStatus', 'paymentLogs', 'price'].includes(key))
                          return null;
                        return (
                          <div key={key} className="flex justify-between items-center">
                            <span className="font-medium text-gray-600">
                              {key.charAt(0).toUpperCase() + key.slice(1)}:
                            </span>
                            <span className="text-gray-900">
                              {typeof value === 'string' || typeof value === 'number'
                                ? value
                                : JSON.stringify(value)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ))
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'All Projects' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white shadow-xl rounded-2xl p-8 border border-black border-2"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2.5">
              <Package2 className="h-8 w-8 text-gray-700" style={{transform: 'rotate(0deg)' }}/>
              All Orders
            </h2>
            {projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
                {projects.map(project => (
                  <motion.div
                    key={project.id}
                    className="p-8 bg-gray-50 border border-black rounded-lg transition-shadow"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <span className='flex'>
                      <Sparkles size={22} className='mt-1 mr-2'/>
                    <h3 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Poppins'}}>{project.name}</h3>
                    </span>
                    <hr />
                    <br />
                    <div className="space-y-3 text-md">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-600">Progress:</span>
                        <div className="flex justify-end gap-3 w-full">
                        <div className="w-full max-w-xs bg-gray-200 rounded-full h-[7px] overflow-hidden">
                          <motion.div
                            className="bg-black h-[7px] rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${project.progress}%` }}
                            transition={{ duration: 1 }}
                          />
                        </div>
                        
                        <span className="text-sm -mt-1.5 font-semibold text-gray-700 whitespace-nowrap">
                          {project.progress}%
                        </span>
                      </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-600">Price:</span>
                        <span className="text-gray-900">₹{project.price.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-600">Payment Status:</span>
                        <span
                          className={`${
                            project.paymentStatus === 'Paid'
                              ? 'text-green-600'
                              : project.paymentStatus === 'Unpaid'
                              ? 'text-red-600'
                              : 'text-yellow-600'
                          } font-semibold`}
                        >
                          {project.paymentStatus}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-600">Start Date:</span>
                        <span className="text-gray-900">{project.startDate || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-600">Deadline:</span>
                        <span className="text-gray-900">{project.deadline || 'N/A'}</span>
                      </div>
                      {project.description && (
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-600">Description:</span>
                          <span className="text-gray-900">{project.description}</span>
                        </div>
                      )}
                      {project.paymentLogs && project.paymentLogs.length > 0 && (
                        <div className="mt-6">
                          <h3 className="text-lg font-medium text-gray-600 mb-3">Payment Logs</h3>
                          <div className="space-y-3">
                            {project.paymentLogs.map(log => (
                              <div
                                key={log.id}
                                className="flex justify-between items-center text-sm text-gray-600"
                              >
                                <span>
                                  {log.date} - ₹{log.amount.toLocaleString()} ({log.status})
                                </span>
                                {log.razorpayOrderId && (
                                  <span className="text-blue-600">Order ID: {log.razorpayOrderId}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <br />
                      <hr className='py-3' />
                      {project.paymentStatus !== 'Paid' && project.progress < 100 ? (
                        <>
                          <h2 className="text-xl font-semibold" style={{ fontFamily: 'Poppins' }}>
                            Wanna pay in advance?
                          </h2>
                          
                          <p className="text-sm text-gray-600 block" style={{
                            marginTop: '8px'
                          }}>
                            Paying a part of the amount now gives your project a serious boost. Here’s what you get:
                          </p>

                          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                            <li>Priority delivery</li>
                            <li>Early access to progress updates</li>
                            <li>Better support & communication</li>
                            <li>Secures your project slot</li>
                          </ul>

                          <motion.button
                            onClick={() => handlePayAdvance(project)}
                            className="mt-2 px-5 py-2 bg-black text-white rounded-lg flex items-center gap-2 font-semibold"
                            style={{ marginTop: '20px'}}
                            whileTap={{ scale: 0.99 }}
                          >
                            <CreditCard className="h-5 w-5" />
                            Pay Advance (₹{project.price.toLocaleString()})
                          </motion.button>
                        </>
                      ) : (
                        <>
                          <h2 className="text-lg font-semibold mb-2 text-green-700">
                            Payment received. Thanks for trusting the process 🙌
                          </h2>
                          <button
                            disabled
                            className="mt-2 px-5 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 font-semibold cursor-not-allowed"
                          >
                            <CreditCard className="h-5 w-5" />
                            Paid
                          </button>
                        </>
                      )}
                      {Object.entries(project).map(([key, value]) => {
                        if (['id', 'name', 'progress', 'startDate', 'deadline', 'description', 'paymentStatus', 'paymentLogs', 'price'].includes(key))
                          return null;
                        return (
                          <div key={key} className="flex justify-between items-center">
                            <span className="font-medium text-gray-600">
                              {key.charAt(0).toUpperCase() + key.slice(1)}:
                            </span>
                            <span className="text-gray-900">
                              {typeof value === 'string' || typeof value === 'number'
                                ? value
                                : JSON.stringify(value)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No orders available.</p>
            )}
          </motion.div>
        )}

        {activeTab === 'Client Helpdesk' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white shadow-xl rounded-2xl p-8 border border-black border-2"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <HelpCircle className="h-7 w-7 text-gray-700" />
              Client Helpdesk
            </h2>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Mail className="h-5 w-5 text-gray-700" />
                <div>
                  <p className="font-medium text-gray-600">Email</p>
                  <a href="mailto:support@lonewolffsd.in" className="text-gray-800 font-semibold underline hover:underline">
                    support@lonewolffsd.in
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Earth className="h-5 w-5 text-gray-700" />
                <div>
                  <p className="font-medium text-gray-600">Website</p>
                  <a
                    href="https://helpdesk.lonewolffsd.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-800 font-semibold underline"
                  >
                    https://helpdesk.lonewolffsd.in
                  </a>
                </div>
              </div>
              
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default UserDataPage;