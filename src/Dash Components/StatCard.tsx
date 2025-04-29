import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  bgClass?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  change,
  bgClass = 'bg-white dark:bg-zinc-900'
}) => {
  return (
    <div className={`${bgClass} border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 transition-all duration-200 hover:shadow-md`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          
          {change && (
            <div className="flex items-center mt-2">
              <span className={`flex items-center text-xs font-medium ${
                change.type === 'increase' 
                  ? 'text-emerald-500' 
                  : 'text-red-500'
              }`}>
                {change.type === 'increase' ? (
                  <ArrowUp className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDown className="h-3 w-3 mr-1" />
                )}
                {Math.abs(change.value)}%
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-1">vs last month</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;