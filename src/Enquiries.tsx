import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase'; // Adjust based on your Firebase setup
import { signOut } from 'firebase/auth';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Timestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { debounce } from 'lodash';
import { Search, Trash2, User, Building, Mail, Phone, MessageSquare, Clock, Briefcase, Calendar, Tag, Skull } from 'lucide-react';
import Logo from './mockups/logo.png';
import { Skeleton } from 'three';

interface Enquiry {
  id: string;
  company: string;
  contactMethod: string;
  contactTime: string;
  createdAt: Timestamp | string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  workType: string;
  remarks: string;
  status: 'new' | 'read';
}

const Enquiries: React.FC = () => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [filteredEnquiries, setFilteredEnquiries] = useState<Enquiry[]>([]);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [enquiryToDelete, setEnquiryToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Icon mapping for modal
  const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
    User,
    Building,
    Mail,
    Phone,
    MessageSquare,
    Clock,
    Briefcase,
    Calendar,
    Tag,
  };

  // Check admin role
  useEffect(() => {
    const checkAdminRole = async () => {
      const user = auth.currentUser;
      if (!user) {
        setIsAdmin(false);
        return;
      }
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists() && userDoc.data().role === 'admin') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    };
    checkAdminRole();
  }, []);

  // Fetch enquiries from Firestore
  useEffect(() => {
    if (!isAdmin) return;
    const fetchEnquiries = async () => {
      setIsLoading(true);
      const querySnapshot = await getDocs(collection(db, 'enquiries'));
      const enquiryData: Enquiry[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        status: doc.data().status || 'new', // Use Firestore status if available
        remarks: doc.data().remarks || '', // Use empty string if remarks missing
        ...doc.data(),
      } as Enquiry));
      setEnquiries(
        enquiryData.sort((a, b) => {
          const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toDate() : new Date(a.createdAt);
          const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toDate() : new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        })
      );
      setFilteredEnquiries(enquiryData);
      setIsLoading(false);
    };
    fetchEnquiries();
  }, [isAdmin]);

  // Debounced search
  const handleSearch = useCallback(
    debounce((term: string) => {
      const lowerTerm = term.toLowerCase();
      setFilteredEnquiries(
        enquiries.filter(
          enquiry =>
            enquiry.firstName.toLowerCase().includes(lowerTerm) ||
            enquiry.lastName.toLowerCase().includes(lowerTerm) ||
            enquiry.company.toLowerCase().includes(lowerTerm) ||
            enquiry.remarks.toLowerCase().includes(lowerTerm) ||
            enquiry.email.toLowerCase().includes(lowerTerm)
        )
      );
    }, 300),
    [enquiries]
  );

  useEffect(() => {
    handleSearch(searchTerm);
  }, [searchTerm, handleSearch]);

  // Handle drag and drop
  const onDragEnd = (result: DropResult) => {
    setIsDragging(false);
    if (!result.destination) return;
    const reorderedEnquiries = [...filteredEnquiries];
    const [movedEnquiry] = reorderedEnquiries.splice(result.source.index, 1);
    reorderedEnquiries.splice(result.destination.index, 0, movedEnquiry);
    setFilteredEnquiries(reorderedEnquiries);
  };

  // Handle drag start
  const onDragStart = () => {
    setIsDragging(true);
  };

  // Handle delete enquiry
  const handleDelete = async () => {
    if (enquiryToDelete) {
      await deleteDoc(doc(db, 'enquiries', enquiryToDelete));
      setEnquiries(enquiries.filter(enquiry => enquiry.id !== enquiryToDelete));
      setFilteredEnquiries(filteredEnquiries.filter(enquiry => enquiry.id !== enquiryToDelete));
      setIsConfirmModalOpen(false);
      setEnquiryToDelete(null);
      setIsModalOpen(false);
      setIsDragging(false); // Reset dragging state
    }
  };

  // Toggle status (new/read)
  const toggleStatus = async (enquiry: Enquiry) => {
    const newStatus = enquiry.status === 'new' ? 'read' : 'new';
    await updateDoc(doc(db, 'enquiries', enquiry.id), { status: newStatus });
    setEnquiries(
      enquiries.map(e => (e.id === enquiry.id ? { ...e, status: newStatus } : e))
    );
    setFilteredEnquiries(
      filteredEnquiries.map(e => (e.id === enquiry.id ? { ...e, status: newStatus } : e))
    );
    if (selectedEnquiry?.id === enquiry.id) {
      setSelectedEnquiry({ ...enquiry, status: newStatus });
    }
  };

  // Open enquiry details modal
  const openModal = (enquiry: Enquiry) => {
    if (isDragging) return; // Prevent modal open during drag
    setSelectedEnquiry(enquiry);
    setIsModalOpen(true);
    if (enquiry.status === 'new') {
      toggleStatus(enquiry);
    }
  };

  // Open confirm delete modal
  const openConfirmModal = (id: string) => {
    setEnquiryToDelete(id);
    setIsConfirmModalOpen(true);
  };

  // Copy email to clipboard
  const copyEmail = (email: string) => {
    navigator.clipboard.write(email);
    alert('Email copied to clipboard!');
  };

  // Format date safely
  const formatDate = (createdAt: Timestamp | string) => {
    const date = createdAt instanceof Timestamp ? createdAt.toDate() : new Date(createdAt);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Handle logout
  const handleLogout = async () => {
    await signOut(auth);
    setIsAdmin(false);
  };

  // Access Denied Screen
  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <motion.div
          className="w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl font-extrabold text-black mb-4">Access Denied</h1>
          <p className="text-lg text-gray-600 mb-6">You need admin privileges to access this page.</p>
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200"
          >
            Logout
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <br /><br />
        <h1 style={{ fontFamily: 'Poppins' }} className="text-4xl font-semibold flex text-black mb-6 tracking-tight">
          <img src={Logo} className='w-16 h-16' alt='LonewolfFSD Logo' /> 
          <span className='md:mt-3 mt-4 ml-1 text-3xl md:text-4xl'>Enquiry Listing</span>
        </h1>
        
        {/* Search Bar with Icon */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, company, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-black rounded-lg text-sm bg-white text-black placeholder-gray-400 focus:outline-none transition-all duration-200"
          />
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <motion.div
              className="w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        ) : filteredEnquiries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
            <div className="bg-gray-100 rounded-full p-4 mb-4">
              <Skull className="w-10 h-10 text-gray-400" />
            </div>
            <p
              className="text-base uppercase tracking-wide font-bold"
              style={{ fontFamily: 'Poppins' }}
            >
              No enquiries found.
            </p>
            <p className='text-sm mt-1'>No one has submitted any enquires yet. <br /> Once submitted will appear here</p>
          </div>

        ) : (
          <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
            <Droppable droppableId="enquiries">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-5"
                >
                  {filteredEnquiries.map((enquiry, index) => (
                    <Draggable key={enquiry.id} draggableId={enquiry.id} index={index}>
                      {(provided, snapshot) => (
                        <motion.div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`p-5 border border-black rounded-xl bg-white bg-opacity-90 backdrop-blur-sm transition-all duration-300 cursor-pointer ${
                            snapshot.isDragging ? 'shadow-xl scale-105 bg-blue-50' : ''
                          }`}
                          onClick={() => openModal(enquiry)}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center">
                                <h2 className="text-lg font-semibold text-black">
                                  Enquiry from <span className='uppercase'>"{enquiry.firstName} {enquiry.lastName}"</span>
                                </h2>
                              </div>
                              <hr className='w-full max-w-5xl' />
                              <p className="text-sm text-gray-500 font-medium mt-1"><i>{enquiry.remarks || "not defined"}</i></p>
                              <br />
                              <span className='space-y-1'>
                                <p className="text-sm text-gray-600 text-xs"><span className='text-black font-semibold'>Email:</span> {enquiry.email}</p>
                                <p className="text-sm text-gray-600 text-xs"><span className='text-black font-semibold'>Phone no:</span> {enquiry.phone}</p> 
                                <p className="text-sm text-gray-600 text-xs"><span className='text-black font-semibold'>Company Name:</span> {enquiry.company}</p>
                              </span>
                              <span className='flex gap-2'>
                                <p className="text-xs text-gray-600 font-medium border-r pr-2 border-black"><b className='text-black'>Work Type:</b> {enquiry.workType}</p>  
                                <p className="text-xs text-gray-600 font-medium"><b className='text-black'>Contact Timing:</b> {enquiry.contactTime}</p>
                              </span>
                            </div>
                            <div className="text-right space-y-2.5 -mt-7">
                              <span
                                className={`px-4 py-1 text-xs font-medium rounded-full ${
                                  enquiry.status === 'new'
                                    ? 'bg-blue-100 text-blue-600'
                                    : 'bg-black/95 text-white'
                                }`}
                              >
                                {enquiry.status === 'new' ? 'New' : 'Marked As Read'}
                              </span>
                              <p className="text-sm text-gray-500 font-medium">{formatDate(enquiry.createdAt)}</p>
                              <p className="text-xs text-gray-600 font-semibold" style={{ fontFamily: 'Poppins' }}>
                                Contact Preferred: {enquiry.contactMethod}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}

        {/* Enquiry Details Modal */}
        <AnimatePresence>
          {isModalOpen && selectedEnquiry && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="bg-white bg-opacity-90 backdrop-blur-lg p-3 md:p-9 md:rounded-3xl h-screen md:h-auto shadow-2xl max-w-2xl w-full border border-gray-300 hover:border-blue-400 transition-all duration-300"
              >
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-7 md:p-6 md:rounded-t-3xl -m-8 mb-4 shadow-md">
                  <h2
                    className="text-2xl ml-5 mt-6 md:mt-auto font-bold uppercase tracking-tight"
                    style={{ fontFamily: 'Poppins' }}
                  >
                    Enquiry for "{selectedEnquiry.firstName} {selectedEnquiry.lastName}"
                  </h2>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Name', value: `${selectedEnquiry.firstName} ${selectedEnquiry.lastName}`, icon: 'User' },
                    { label: 'Company', value: selectedEnquiry.company, icon: 'Building' },
                    {
                      label: 'Email',
                      value: (
                        <div className="flex items-center space-x-2">
                          <span>{selectedEnquiry.email}</span>
                          <button
                            onClick={() => copyEmail(selectedEnquiry.email)}
                            className="text-blue-500 hover:text-blue-600 text-xs font-medium"
                          >
                            Copy
                          </button>
                        </div>
                      ),
                      icon: 'Mail',
                    },
                    { label: 'Phone', value: selectedEnquiry.phone, icon: 'Phone' },
                    { label: 'Contact Method', value: selectedEnquiry.contactMethod, icon: 'MessageSquare' },
                    { label: 'Contact Time', value: selectedEnquiry.contactTime, icon: 'Clock' },
                    { label: 'Work Type', value: selectedEnquiry.workType, icon: 'Briefcase' },
                    { label: 'Created At', value: formatDate(selectedEnquiry.createdAt), icon: 'Calendar' },
                    {
                      label: 'Status',
                      value: (
                        <button
                          onClick={() => toggleStatus(selectedEnquiry)}
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            selectedEnquiry.status === 'new'
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {selectedEnquiry.status === 'new' ? 'Mark as Read' : 'Mark as New'}
                        </button>
                      ),
                      icon: 'Tag',
                    },
                    { label: 'Remarks', value: selectedEnquiry.remarks || 'Not provided', icon: 'MessageSquare' },
                  ].map((item, index) => {
                    const Icon = iconMap[item.icon];
                    return (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.2 }}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 hover:scale-[1.01] transition-all duration-200"
                      >
                        <Icon className="h-5 w-5 text-gray-500" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-black">{item.label}:</p>
                        </div>
                        <div className="text-sm text-gray-600">{item.value}</div>
                      </motion.div>
                    );
                  })}
                </div>
                <div className="mt-8 flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openConfirmModal(selectedEnquiry.id)}
                    className="px-6 py-2 flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg border border-red-400 hover:border-red-600 shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <Trash2 size={18} className="text-red-200" />
                    Delete Enquiry
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2 bg-gradient-to-r from-gray-200 to-gray-300 text-black rounded-lg border border-gray-400 hover:border-gray-600 shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    Close Enquiry
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confirm Delete Modal */}
        <AnimatePresence>
          {isConfirmModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-white bg-opacity-95 backdrop-blur-md p-6 rounded-2xl shadow-2xl max-w-sm w-full border border-gray-200"
              >
                <h2 className="text-xl font-bold text-black mb-4 tracking-tight">Confirm Deletion</h2>
                <p className="text-gray-600">Are you sure you want to delete this enquiry?</p>
                <div className="mt-6 flex justify-between">
                  <button
                    onClick={handleDelete}
                    className="px-5 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200"
                  >
                    SURE
                  </button>
                  <button
                    onClick={() => setIsConfirmModalOpen(false)}
                    className="px-5 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-black rounded-lg hover:from-gray-200 hover:to-gray-300 transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Enquiries;