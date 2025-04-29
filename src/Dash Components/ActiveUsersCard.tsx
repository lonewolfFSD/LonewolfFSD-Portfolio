import React from 'react';

interface ActiveUser {
  name: string;
  avatar?: string;
  location: string;
  activity: string;
  time: string;
}

interface ActiveUsersCardProps {
  users: ActiveUser[];
}

const ActiveUsersCard: React.FC<ActiveUsersCardProps> = ({ users }) => {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
        <h3 className="text-lg font-semibold">Active Users Now</h3>
        <div className="flex items-center gap-1 mt-1">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {users.length} users currently active
          </p>
        </div>
      </div>
      
      <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {users.map((user, index) => (
          <div key={index} className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center relative">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-full" />
                ) : (
                  <span className="text-sm font-medium">{user.name.charAt(0)}</span>
                )}
                <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-zinc-900 bg-emerald-500"></div>
              </div>
              
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{user.location}</p>
              </div>
              
              <div className="text-right">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{user.time}</p>
                <p className="text-xs font-medium mt-1">{user.activity}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveUsersCard;