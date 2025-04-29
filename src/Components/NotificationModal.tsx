import React, { useEffect, useState } from 'react';
import { X, CheckCheck, Trash2, Flag } from 'lucide-react';
import { Notification } from '../types/Notification';
import { formatTimeAgo } from '../utils/formatTime';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface NotificationModalProps {
  notification: Notification | null;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onReport: (id: string) => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  notification,
  onClose,
  onMarkAsRead,
  onDelete,
  onReport
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showReportConfirm, setShowReportConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [notification]);

  if (!notification) return null;

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
      setShowReportConfirm(false);
      setShowDeleteConfirm(false);
      setPreviewImage(null);
    }, 300);
  };

  const handleMarkAsRead = () => {
    if (notification.id) {
      onMarkAsRead(notification.id);
    }
  };

  const handleDelete = () => {
    if (notification.id) {
      setShowDeleteConfirm(false);
      onDelete(notification.id);
      handleClose();
    }
  };

  const handleReport = () => {
    if (notification.id) {
      setShowReportConfirm(false);
      onReport(notification.id);
      handleClose();
    }
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewImage(notification.image);
  };

  const handlePreviewClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewImage(null);
  };

  // Custom components for Markdown rendering
  const markdownComponents = {
    p: ({ node, ...props }) => <p className="text-gray-700 leading-relaxed mb-4" {...props} />,
    h1: ({ node, ...props }) => <h1 className="text-3xl font-bold text-black mt-6 mb-4" {...props} />,
    h2: ({ node, ...props }) => <h2 className="text-2xl font-semibold text-gray-800 mt-5 mb-3" {...props} />,
    a: ({ node, ...props }) => <a className="text-blue-500 underline hover:text-blue-700" {...props} />,
    ul: ({ node, ...props }) => <ul className="list-disc list-inside text-gray-700 mb-4" {...props} />,
    ol: ({ node, ...props }) => <ol className="list-decimal list-inside text-gray-700 mb-4" {...props} />,
    li: ({ node, ...props }) => <li className="mb-2" {...props} />,
    code: ({ node, ...props }) => (
      <code className="bg-gray-100 text-red-600 px-1 rounded" {...props} />
    ),
    pre: ({ node, ...props }) => (
      <pre className="bg-gray-800 text-white p-3 rounded overflow-x-auto mb-4" {...props} />
    ),
    table: ({ node, ...props }) => (
      <table className="w-full border-collapse border border-gray-300 mb-4" {...props} />
    ),
    th: ({ node, ...props }) => (
      <th className="border border-gray-300 p-2 bg-gray-200 font-semibold" {...props} />
    ),
    td: ({ node, ...props }) => (
      <td className="border border-gray-300 p-2" {...props} />
    ),
  };

  return (
    <div 
      className={`fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={handleClose}
    >
      <div 
        className={`bg-white w-screen h-screen overflow-y-auto shadow-xl transition-transform duration-300 ${
          isVisible ? 'translate-y-0' : 'translate-y-8'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between fixed w-full bg-white z-10">
          <h3 className="text-lg font-semibold text-black">Notification</h3>
          <button 
            className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
            onClick={handleClose}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <div className="pt-20 px-6 pb-6 overflow-y-auto" style={{ maxHeight: '100vh' }}>
          <div className="max-w-[72rem] mx-auto">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-black mb-2">{notification.title}</h2>
              <div className="text-sm text-gray-500 mb-4">
                {formatTimeAgo(notification.timestamp)}
                {notification.type && (
                  <span className={`ml-3 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    notification.type === 'info' ? 'bg-blue-500 text-white' :
                    notification.type === 'success' ? 'bg-emerald-500 text-white' :
                    notification.type === 'warning' ? 'bg-amber-500 text-white' :
                    notification.type === 'error' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-800'
                  }`}>
                    {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                  </span>
                )}
              </div>
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
              >
                {notification.message}
              </ReactMarkdown>
              <br />
            </div>
            
            {notification.image && (
              <div className="mb-6">
                <img 
                  src={notification.image} 
                  alt="Notification"
                  className="w-full md:max-w-xl mt-2 h-auto object-cover max-h-[60vh] cursor-pointer border border-black/20"
                  onClick={handleImageClick}
                />
              </div>
            )}
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 fixed bottom-0 w-full flex justify-end">
          {showDeleteConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Are you sure you want to delete this notification?</span>
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 rounded bg-black text-white text-sm"
              >
                Yes, delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 rounded bg-gray-200 text-gray-700 text-sm"
              >
                Cancel
              </button>
            </div>
          ) : showReportConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Report this notification as inappropriate?</span>
              <button
                onClick={handleReport}
                className="px-3 py-1.5 rounded bg-black text-white text-sm"
              >
                Yes, report
              </button>
              <button
                onClick={() => setShowReportConfirm(false)}
                className="px-3 py-1.5 rounded bg-gray-200 text-gray-700 text-sm"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className='flex gap-3'>
              <button
                onClick={() => {
                  if (notification.id && !notification.read) {
                    handleMarkAsRead();
                    notification.read = true;
                  }
                }}
                disabled={notification.read}
                className={`inline-flex justify-center items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium ${
                  notification.read 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors duration-200'
                }`}
              >
                <CheckCheck className="h-4 w-4" />
                {notification.read ? 'Already read' : 'Mark as read'}
              </button>
              
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex justify-center items-center gap-1.5 px-3 py-2 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors duration-200"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
              
              <button
                onClick={() => setShowReportConfirm(true)}
                className="inline-flex justify-center items-center gap-1.5 px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors duration-200"
              >
                <Flag className="h-4 w-4" />
                Report
              </button>
            </div>
          )}
        </div>

        {/* Image Preview Overlay */}
        {previewImage && (
          <div 
            className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center"
            onClick={handlePreviewClose}
          >
            <div 
              className="relative w-full sm:max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-800/60 text-white hover:bg-gray-600 transition-colors duration-200"
                onClick={handlePreviewClose}
              >
                <X className="h-5 w-5" />
              </button>
              <img 
                src={previewImage} 
                alt="Preview"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationModal;