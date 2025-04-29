import React, { useEffect, useState } from 'react';
import { getRemoteConfig, fetchAndActivate, getBoolean, getString, getAll } from 'firebase/remote-config';
import { remoteConfig } from '../firebase'; // Adjust path to your firebase.ts
import logo from './mockups/logo.png';

// Set to 0 for testing to bypass caching
remoteConfig.settings.minimumFetchIntervalMillis = 0;

const MaintenanceOverlay: React.FC = () => {
  const [showMaintenance, setShowMaintenance] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Prevent scrolling when overlay is active
  useEffect(() => {
    if (showMaintenance || loading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = ''; // Cleanup on unmount
    };
  }, [showMaintenance, loading]);

  // Fetch Remote Config
  useEffect(() => {
    console.log('Remote Config initialized:', remoteConfig);
    const fetchMaintenanceStatus = async () => {
      try {
        console.log('Fetching Remote Config...');
        const activated = await fetchAndActivate(remoteConfig);
        console.log('Fetch and activate successful:', activated);
        const allConfig = getAll(remoteConfig);
        console.log('All Remote Config parameters:', allConfig);
        const isMaintenance = getBoolean(remoteConfig, 'show_maintenance');
        const endTime = getString(remoteConfig, 'maintenance_end_time');
        console.log('show_maintenance value:', isMaintenance);
        console.log('maintenance_end_time value:', endTime);
        setShowMaintenance(isMaintenance);
        if (endTime) {
          // Start countdown if endTime is valid
          const endDate = new Date(endTime);
          if (!isNaN(endDate.getTime())) {
            updateCountdown(endDate);
          }
        }
      } catch (error) {
        console.error('Error fetching Remote Config:', error);
        setShowMaintenance(false);
      } finally {
        setLoading(false);
      }
    };
    fetchMaintenanceStatus();
  }, []);

  // Update countdown every second
  useEffect(() => {
    if (!showMaintenance) return;
    const endTime = getString(remoteConfig, 'maintenance_end_time');
    if (!endTime) return;
    const endDate = new Date(endTime);
    if (isNaN(endDate.getTime())) return;

    const interval = setInterval(() => {
      updateCountdown(endDate);
    }, 1000);

    return () => clearInterval(interval);
  }, [showMaintenance]);

  const updateCountdown = (endDate: Date) => {
    const now = new Date();
    const timeLeft = endDate.getTime() - now.getTime();
    if (timeLeft <= 0) {
      setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    setCountdown({ days, hours, minutes, seconds });
  };

  console.log('MaintenanceOverlay rendered, showMaintenance:', showMaintenance, 'loading:', loading, 'countdown:', countdown);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-100 bg-opacity-75 backdrop-blur-md flex items-center justify-center z-50"></div>
    );
  }

  if (!showMaintenance) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white h-full md:h-auto md:rounded-2xl md:border md:border-black md:border-2 shadow-2xl p-4 md:p-10 md:max-w-2xl w-full md:mx-4 text-center border border-gray-200">
        <img src={logo} alt="Company Logo" className="h-28 mx-auto mb-6 mt-28 md:mt-0" />
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Poppins' }}>
          Under Maintenance
        </h1>
        <p className="text-md md:text-[16px] text-gray-600 mb-8 leading-relaxed" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          LonewolfFSD is performing scheduled maintenance to enhance your experience. I’m working hard to bring you the best service. Please check back soon.
        </p>
        <div className="flex justify-center mb-6">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <span className="block text-2xl md:text-3xl font-bold text-gray-900">{countdown.days}</span>
              <span className="block text-sm text-gray-500">Days</span>
            </div>
            <div>
              <span className="block text-2xl md:text-3xl font-bold text-gray-900">{countdown.hours}</span>
              <span className="block text-sm text-gray-500">Hours</span>
            </div>
            <div>
              <span className="block text-2xl md:text-3xl font-bold text-gray-900">{countdown.minutes}</span>
              <span className="block text-sm text-gray-500">Minutes</span>
            </div>
            <div>
              <span className="block text-2xl md:text-3xl font-bold text-gray-900">{countdown.seconds}</span>
              <span className="block text-sm text-gray-500">Seconds</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-500 italic">This duration may increase or decrease.</p>
      </div>
    </div>
  );
};

export default MaintenanceOverlay;