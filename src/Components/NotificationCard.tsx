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
  const [notificationTypes] = useState([
    { id: 'info', label: 'Informative', icon: Bell, color: 'bg-blue-500', textColor: 'text-blue-500' },
    { id: 'success', label: 'Standard', icon: Bell, color: 'bg-emerald-500', textColor: 'text-emerald-500' },
    { id: 'warning', label: 'Critical', icon: Bell, color: 'bg-amber-500', textColor: 'text-amber-500' },
    { id: 'error', label: 'Imperative', icon: Bell, color: 'bg-red-500', textColor: 'text-red-500' },
  ]);

  // Find the notification type config, default to 'info' if type is invalid
  const typeConfig = notificationTypes.find(t => t.id === type) || notificationTypes[0];

  return (
    <div 
      className={`border-b border-gray-200 p-4 transition-all duration-200 cursor-pointer 
        ${read ? 'bg-white' : 'bg-gray-50'} 
        hover:bg-gray-100`}
      onClick={() => onClick(notification)}
    >
      <div className="flex items-start gap-2">
      <div className="mt-1 relative">
        <div className={`p-0.5 rounded-full ${!read ? 'ring-2 ring-black' : ''}`}>
          <div className={`h-2 w-2 rounded-full ${typeConfig.textColor.replace('text-', 'bg-')}`} />
        </div>
        {!read && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-black transform translate-x-1/4 -translate-y-1/4" />
        )}
      </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <h3 className={`text-sm font-semibold truncate ${!read ? 'text-black' : 'text-gray-700'}`}>
              {title}
            </h3>
            <br />
            <div className="flex items-center gap-1 ml-2">

              <span className="text-xs text-gray-500 whitespace-nowrap">
                {formatTimeAgo(timestamp)} by LonewolfFSD
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