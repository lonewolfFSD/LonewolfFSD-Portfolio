import React, { useState, useEffect } from 'react';
import { Bell, BellOff, BellRing } from 'lucide-react';
import NotificationCard from './NotificationCard';
import { Notification } from '../types/Notification';
import { onAuthStateChanged, User as FirebaseUser, signOut } from "firebase/auth";
import { auth } from '../../firebase'; // Import your Firebase auth instance

interface NotificationListProps {
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
}

type FilterType = 'all' | 'unread' | 'read';

const NotificationList: React.FC<NotificationListProps> = ({ 
  notifications, 
  onNotificationClick 
}) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [user, setUser] = useState<FirebaseUser | null>(null); // State for Firebase user
  
  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Update user state when auth changes
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []); // Empty dependency array for one-time setup

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });
  
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="bg-white shadow-sm rounded-lg w-full max-w-4xl">
      <div className="border-b border-gray-200 px-5 pb-4 md:pb-3 md:p-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[21px] md:text-xl font-semibold text-black" style={{
            fontFamily: 'Poppins'
          }}>
            {user?.displayName ? `${user.displayName}'s Notifications` : 'Notifications'}
          </h2>
          {unreadCount > 0 && (
            <span className="bg-black text-white text-xs font-medium px-2.5 py-1 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        
        <div className="flex space-x-2 pb-1">
        <button
          className={`px-4 md:px-4 py-2 md:py-1.5 text-sm rounded-md transition-all duration-200
            ${filter === 'all' 
              ? 'bg-black text-white font-medium' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          onClick={() => setFilter('all')}
        >
          <span className="flex items-center gap-1.5">
            <Bell className={`h-4 w-4 ${filter === 'all' ? 'text-white fill-white' : 'text-gray-500'}`} />
            All
          </span>
        </button>

        <button
          className={`px-4 md:px-4 py-2 md:py-1.5 text-sm rounded-md transition-all duration-200
            ${filter === 'unread' 
              ? 'bg-black text-white font-medium' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          onClick={() => setFilter('unread')}
        >
          <span className="flex items-center gap-1.5">
            <BellRing className={`h-4 w-4 ${filter === 'unread' ? 'text-white fill-white' : 'text-gray-500'}`} />
            Unread
          </span>
        </button>

        <button
          className={`px-4 md:px-4 py-2 md:py-1.5 text-sm rounded-md transition-all duration-200
            ${filter === 'read' 
              ? 'bg-black text-white font-medium' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          onClick={() => setFilter('read')}
        >
          <span className="flex items-center gap-1.5">
            <BellOff className={`h-4 w-4 ${filter === 'read' ? 'text-white fill-white' : 'text-gray-500'}`} />
            Read
          </span>
        </button>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map(notification => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onClick={onNotificationClick}
            />
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            {filter === 'all' && (
              <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            )}
            {filter === 'unread' && (
              <BellRing className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            )}
            {filter === 'read' && (
              <BellOff className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            )}

            <p className="text-lg font-medium mb-1">No notifications</p>
            <p className="text-sm">
              {filter === 'all' 
                ? "You don't have any notifications yet" 
                : filter === 'unread' 
                  ? "You don't have any unread notifications" 
                  : "You don't have any read notifications"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationList;