import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import NotificationList from './Components/NotificationList';
import NotificationModal from './Components/NotificationModal';
import { Notification } from './types/Notification';

const NotificationPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, 'notifications'), where('recipient', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate() // Convert Firestore timestamp to JS Date
      })) as Notification[];
      setNotifications(notifs);
    });

    return () => unsubscribe();
  }, []);

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
  };

  const handleCloseModal = () => {
    setSelectedNotification(null);
  };

  const handleMarkAsRead = async (id: string) => {
    const notificationRef = doc(db, 'notifications', id);
    await updateDoc(notificationRef, { read: true });
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'notifications', id));
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const handleReport = async (id: string) => {
    console.log(`Reported notification ${id}`); // Placeholder—add custom report logic (e.g., Firestore log)
  };

  return (
    <div className="min-h-screen md:bg-gray-50 text-black flex flex-col items-center justify-start md:p-6">
      <motion.h1
        className="text-4xl font-bold text-center mb-8 tracking-wide text-gray-800"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >

      </motion.h1>

      <NotificationList
        notifications={notifications}
        onNotificationClick={handleNotificationClick}
      />

      <NotificationModal
        notification={selectedNotification}
        onClose={handleCloseModal}
        onMarkAsRead={handleMarkAsRead}
        onDelete={handleDelete}
        onReport={handleReport}
      />
    </div>
  );
};

export default NotificationPage;