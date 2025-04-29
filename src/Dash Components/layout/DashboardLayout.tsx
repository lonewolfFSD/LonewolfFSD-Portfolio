import React, { useState, useEffect } from 'react';
import { Bell, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../../firebase';
import { User } from 'lucide-react'; // Assuming you want to use User icon as fallback

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    auth.signOut().then(() => navigate('/auth'));
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
      <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight">AdminPanel</h1>
          <div className="relative ml-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-zinc-100 dark:bg-zinc-800 pl-10 pr-4 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400 w-64"
            />
          </div>
        </div>
        <div className="flex items-center">

          <div className="ml-1 flex items-center">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover bg-gray-200 p-1"
              />
            ) : (
              <User className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
            )}
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {/* Removed Settings icon, using logout action instead */}
          </button>
        </div>
      </header>
      <main className="p-6">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;