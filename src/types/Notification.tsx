export interface Notification {
    id: string;
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    priority?: 'high' | 'medium' | 'low';
    image?: string;
  }