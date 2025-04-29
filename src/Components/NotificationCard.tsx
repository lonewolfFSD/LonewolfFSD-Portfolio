import React, { useEffect, useState } from 'react';
import { Bell, Clock } from 'lucide-react';
import { Notification } from '../types/Notification';
import { formatTimeAgo } from '../utils/formatTime';

interface NotificationCardProps {
  notification: Notification;
  onClick: (notification: Notification) => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ notification, onClick }) => {
  const { title, message, timestamp, read, type } = notification;
  const [notificationTypes, setNotificationTypes] = useState([
    { id: 'info', label: 'Information', icon: Bell, color: 'bg-blue-500' },
    { id: 'success', label: 'Success', icon: Bell, color: 'bg-emerald-500' },
    { id: 'warning', label: 'Warning', icon: Bell, color: 'bg-amber-500' },
    { id: 'error', label: 'Error', icon: Bell, color: 'bg-red-500' },
  ]);

  // Map type to text color (using 600 shade for consistency with Tailwind)
  const getBellColor = () => {
    const typeConfig = notificationTypes.find(t => t.id === type) || notificationTypes[0]; // Default to info if type missing
    return typeConfig.color.replace('bg-', 'text-').replace('500', '600'); // e.g., bg-blue-500 -> text-blue-600
  };

  return (
    <div 
      className={`border-b border-gray-200 p-4 transition-all duration-200 cursor-pointer 
        ${read ? 'bg-white' : 'bg-gray-50'} 
        hover:bg-gray-100`}
      onClick={() => onClick(notification)}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1 relative">
          <div className={`p-2 rounded-full bg-gray-100 ${!read ? 'ring-2 ring-black' : ''}`}>
            <Bell fill='currentColor' className={`h-5 w-5 ${getBellColor()}`} />
          </div>
          {!read && (
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-black transform translate-x-1/4 -translate-y-1/4"></span>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <h3 className={`text-sm font-semibold truncate ${!read ? 'text-black' : 'text-gray-700'}`}>
              {title}
            </h3>
            <div className="flex items-center gap-1 ml-2">
              <div className={`h-2 w-2 rounded-full ${
                type === 'info' ? 'bg-blue-500' :
                type === 'success' ? 'bg-emerald-500' :
                type === 'warning' ? 'bg-amber-500' :
                type === 'error' ? 'bg-red-500' : 'bg-gray-400'
              } flex-shrink-0`}></div>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {formatTimeAgo(timestamp)}
              </span>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 line-clamp-2">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;