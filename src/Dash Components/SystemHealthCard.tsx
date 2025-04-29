import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Activity } from 'lucide-react';

interface SystemStatus {
  name: string;
  status: 'operational' | 'degraded' | 'outage';
  uptime: number;
}

interface SystemHealthCardProps {
  systems: SystemStatus[];
}

const SystemHealthCard: React.FC<SystemHealthCardProps> = ({ systems }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'outage':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-zinc-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'operational':
        return 'Operational';
      case 'degraded':
        return 'Degraded';
      case 'outage':
        return 'Outage';
      default:
        return 'Unknown';
    }
  };

  const totalSystems = systems.length;
  const operationalCount = systems.filter(s => s.status === 'operational').length;
  const degradedCount = systems.filter(s => s.status === 'degraded').length;
  const outageCount = systems.filter(s => s.status === 'outage').length;
  
  let overallStatus = 'operational';
  if (outageCount > 0) {
    overallStatus = 'outage';
  } else if (degradedCount > 0) {
    overallStatus = 'degraded';
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">System Health</h3>
          <div className="flex items-center gap-2">
            {getStatusIcon(overallStatus)}
            <span className="text-sm font-medium">
              {getStatusText(overallStatus)}
            </span>
          </div>
        </div>
      </div>
      
      <div className="px-6 py-4">
        <div className="flex justify-between mb-4">
          <div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Operational</span>
            <p className="text-lg font-semibold">{operationalCount}</p>
          </div>
          <div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Degraded</span>
            <p className="text-lg font-semibold">{degradedCount}</p>
          </div>
          <div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Outage</span>
            <p className="text-lg font-semibold">{outageCount}</p>
          </div>
        </div>
      </div>
      
      <div className="overflow-y-auto max-h-64">
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {systems.map((system, index) => (
            <li key={index} className="px-6 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-medium">{system.name}</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Uptime: {system.uptime}%
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(system.status)}
                  <span className="text-sm">
                    {getStatusText(system.status)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SystemHealthCard;