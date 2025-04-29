export interface Member {
    id: string;
    name: string;
    email: string;
    status: 'active' | 'inactive' | 'pending';
    role: string;
    lastActive: string;
    avatar?: string;
  }
  
  export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  }
  
  export interface SystemStatus {
    name: string;
    status: 'operational' | 'degraded' | 'outage';
    uptime: number;
  }