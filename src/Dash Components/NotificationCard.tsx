import React, { useState } from 'react';
import { Send, Plus, Bell, Users, Info } from 'lucide-react';
import { collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { db, auth, storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'react-toastify';

const NotificationCard: React.FC = () => {
  const [notification, setNotification] = useState({
    title: '',
    message: '',
    type: 'info'
  });
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>(''); // New state for image URL
  const [recipients, setRecipients] = useState<string[]>([]);

  const notificationTypes = [
    { id: 'info', label: 'Information', icon: Info, color: 'bg-blue-500' },
    { id: 'success', label: 'Success', icon: Bell, color: 'bg-emerald-500' },
    { id: 'warning', label: 'Warning', icon: Bell, color: 'bg-amber-500' },
    { id: 'error', label: 'Error', icon: Bell, color: 'bg-red-500' },
  ];

  const fetchUsers = async () => {
    const usersQuery = query(collection(db, 'users'));
    const snapshot = await getDocs(usersQuery);
    return snapshot.docs.map(doc => ({ uid: doc.id, email: doc.data().email }));
  };

  const handleSelectAll = async () => {
    const users = await fetchUsers();
    setRecipients(users.map(u => u.uid));
  };

  const handleSelectMembers = async () => {
    const users = await fetchUsers();
    const selected = window.prompt('Enter UIDs separated by commas (e.g., uid1,uid2)');
    if (selected) {
      const uids = selected.split(',').map(uid => uid.trim()).filter(uid => users.some(u => u.uid === uid));
      setRecipients(uids);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let imageUrlToSend = '';
      if (image) {
        const imageRef = ref(storage, `notifications/${Date.now()}_${image.name}`);
        await uploadBytes(imageRef, image);
        imageUrlToSend = await getDownloadURL(imageRef);
      } else if (imageUrl) {
        imageUrlToSend = imageUrl; // Use the provided URL if no file uploaded
      }

      for (const recipient of recipients.length ? recipients : (await fetchUsers()).map(u => u.uid)) {
        await addDoc(collection(db, 'notifications'), {
          sender: auth.currentUser?.uid,
          recipient,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          image: imageUrlToSend,
          timestamp: serverTimestamp(),
          read: false,
        });
      }

      toast.success(`Notification "${notification.title}" sent to ${recipients.length || 'all'} users!`);
      setNotification({ title: '', message: '', type: 'info' });
      setImage(null);
      setImageUrl('');
      setRecipients([]);
    } catch (error) {
      toast.error('Failed to send notification');
      console.error(error);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
        <h3 className="text-lg font-semibold">Send Notification</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Send to all or specific members
        </p>
      </div>
      
      <div className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Notification Title
              </label>
              <input
                type="text"
                id="title"
                className="w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400"
                placeholder="Enter notification title"
                value={notification.title}
                onChange={(e) => setNotification({...notification, title: e.target.value})}
                required
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-1">
                Message
              </label>
              <textarea
                id="message"
                rows={3}
                className="w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400"
                placeholder="Enter notification message"
                value={notification.message}
                onChange={(e) => setNotification({...notification, message: e.target.value})}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Notification Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {notificationTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    className={`flex items-center gap-2 p-2 rounded-md border ${
                      notification.type === type.id
                        ? 'border-zinc-900 dark:border-white'
                        : 'border-zinc-200 dark:border-zinc-700'
                    } hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors`}
                    onClick={() => setNotification({...notification, type: type.id})}
                  >
                    <div className={`${type.color} p-1 rounded-md`}>
                      <type.icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Select Recipients
              </label>
              <div className="flex items-center gap-3 mb-3">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  <Users className="h-4 w-4" />
                  <span className="text-sm">All Members</span>
                </button>
                <button
                  type="button"
                  onClick={handleSelectMembers}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span className="text-sm">Select Members</span>
                </button>
              </div>
              {recipients.length > 0 && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Selected: {recipients.length} users</p>
              )}
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                  className="w-full mt-2 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400"
                />
                <input
                  type="text"
                  placeholder="Enter image URL"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400"
                />
              </div>
            </div>
            
            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex justify-center items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-2 px-4 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors font-medium"
              >
                <Send className="h-4 w-4" />
                Send Notification
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NotificationCard;