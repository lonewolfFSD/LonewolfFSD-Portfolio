import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MonitoringCardProps {
  title: string;
  data: {
    value: number;
    unit?: string;
    change?: number;
    dataset: number[];
  };
}

const MonitoringCard: React.FC<MonitoringCardProps> = ({ title, data }) => {
  const min = Math.min(...data.dataset);
  const max = Math.max(...data.dataset);
  const range = max - min || 1;
  const isUpward = data.change && data.change >= 0;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</h3>
        {data.change !== undefined && (
          <span className={`flex items-center text-xs font-medium ${
            isUpward ? 'text-emerald-500' : 'text-red-500'
          }`}>
            {isUpward ? (
              <ArrowUpRight className="h-3 w-3 mr-1" />
            ) : (
              <ArrowDownRight className="h-3 w-3 mr-1" />
            )}
            {Math.abs(data.change)}%
          </span>
        )}
      </div>
      
      <div className="mt-2 mb-4">
        <div className="text-2xl font-bold">
          {data.value}
          {data.unit && <span className="text-sm font-normal ml-1">{data.unit}</span>}
        </div>
      </div>
      
      <div className="h-16">
        <div className="flex items-end h-full gap-1">
          {data.dataset.map((value, index) => {
            const heightPercentage = ((value - min) / range) * 100;
            return (
              <div 
                key={index} 
                className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-sm transition-all duration-300 hover:bg-zinc-900 dark:hover:bg-white hover:scale-y-105"
                style={{ height: `${Math.max(5, heightPercentage)}%` }}
              >
                <div 
                  className={`w-full h-full rounded-sm ${
                    index === data.dataset.length - 1 ? 'bg-zinc-900 dark:bg-white' : ''
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MonitoringCard;