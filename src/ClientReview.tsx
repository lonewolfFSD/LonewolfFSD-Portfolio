import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, SubmitHandler } from 'react-hook-form';
import { collection, addDoc, getDocs, doc, getDoc, query, where, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Assuming firebase.ts exports db
import { toast, Toaster } from 'react-hot-toast';
import TailwindSpinner from './Components/TailwindSpinner'; // Custom spinner component
import DOMPurify from 'dompurify'; // For input sanitization
import { Dialog, Transition } from '@headlessui/react'; // For modals
import { Fragment } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import Helmet from 'react-helmet';

interface Review {
  id: string;
  name: string;
  project: string;
  rating: number;
  feedback: string;
  timestamp: Date;
  showOnHomepage: boolean;
  status: 'pending' | 'approved' | 'rejected' | null;
  fsdId: string;
}

interface ReviewFormInputs {
  fsdId: string;
  projectId: string;
  rating: number;
  feedback: string;
  showOnHomepage: boolean;
}

interface Project {
  id: string;
  name: string;
}

const ClientReview: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [fetchingUser, setFetchingUser] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [sortOption, setSortOption] = useState<'date' | 'rating' | 'project'>('date');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<ReviewFormInputs>({
    defaultValues: {
      fsdId: '',
      projectId: '',
      rating: 0,
      feedback: '',
      showOnHomepage: false,
    },
  });

  const fsdId = watch('fsdId');
  const projectId = watch('projectId');

  // Sanitize feedback input
  const sanitizeInput = (input: string) => DOMPurify.sanitize(input);

  // Fetch user name and projects based on FSD ID
  const fetchUserData = useCallback(async () => {
    if (!fsdId) {
      setUserName(null);
      setProjects([]);
      setValue('projectId', '');
      return;
    }

    setFetchingUser(true);
    try {
      const userDocRef = doc(db, 'users', fsdId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setUserName(userDoc.data().name || 'Unknown User');
      } else {
        setUserName(null);
        toast.error('Invalid FSD ID');
      }

      const projectsCollection = collection(db, `users/${fsdId}/projects`);
      const projectSnapshot = await getDocs(projectsCollection);
      const projectData = projectSnapshot.docs
        .filter(doc => doc.data().progress === 100)
        .map(doc => ({
          id: doc.id,
          name: doc.data().name,
        }));
      const reviewQuery = query(collection(db, 'reviews'), where('fsdId', '==', fsdId));
      const reviewSnapshot = await getDocs(reviewQuery);
      const reviewedProjects = reviewSnapshot.docs.map(doc => doc.data().project);
      const availableProjects = projectData.filter(project => !reviewedProjects.includes(project.name));
      setProjects(availableProjects);
      setValue('projectId', availableProjects.length > 0 ? availableProjects[0].id : '');
    } catch (error: any) {
      toast.error(`Failed to fetch user data: ${error.message || 'Unknown error'}`);
      setUserName(null);
      setProjects([]);
      setValue('projectId', '');
    } finally {
      setFetchingUser(false);
    }
  }, [fsdId, setValue]);

  useEffect(() => {
    const debounce = setTimeout(fetchUserData, 500);
    return () => clearTimeout(debounce);
  }, [fetchUserData]);

  // Fetch reviews from Firestore
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'reviews'));
        const reviewData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp.toDate(),
          showOnHomepage: doc.data().showOnHomepage || false,
          status: doc.data().status || null,
          fsdId: doc.data().fsdId || '',
        })) as Review[];
        setReviews(reviewData);
        setLoading(false);
      } catch (error: any) {
        toast.error(`Failed to load reviews: ${error.message || 'Unknown error'}`);
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  // Check if a review exists for the selected project
  const checkExistingReview = async (fsdId: string, projectName: string): Promise<boolean> => {
    try {
      const reviewsQuery = query(
        collection(db, 'reviews'),
        where('fsdId', '==', fsdId),
        where('project', '==', projectName)
      );
      const querySnapshot = await getDocs(reviewsQuery);
      return !querySnapshot.empty;
    } catch (error: any) {
      console.error('Error checking existing reviews:', error);
      toast.error(`Failed to check existing reviews: ${error.message || 'Unknown error'}`);
      return false;
    }
  };

  // Handle form submission
  const onSubmit: SubmitHandler<ReviewFormInputs> = async (data) => {
    if (!userName) {
      toast.error('Please enter a valid FSD ID');
      return;
    }

    const selectedProject = projects.find(p => p.id === data.projectId);
    if (!selectedProject) {
      toast.error('Please select a valid project');
      return;
    }

    const reviewExists = await checkExistingReview(data.fsdId, selectedProject.name);
    if (reviewExists) {
      toast.error('You have already submitted a review for this project');
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        name: userName,
        project: selectedProject.name,
        rating: data.rating,
        feedback: sanitizeInput(data.feedback),
        timestamp: new Date(),
        showOnHomepage: data.showOnHomepage,
        status: data.showOnHomepage ? 'pending' : null,
        fsdId: data.fsdId,
      });
      toast.success('Review submitted successfully!');
      reset({
        fsdId: '',
        projectId: '',
        rating: 0,
        feedback: '',
        showOnHomepage: false,
      });
      setUserName(null);
      setProjects([]);
      const querySnapshot = await getDocs(collection(db, 'reviews'));
      const reviewData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
        showOnHomepage: doc.data().showOnHomepage || false,
        status: doc.data().status || null,
        fsdId: doc.data().fsdId || '',
      })) as Review[];
      setReviews(reviewData);
      setIsConfirmModalOpen(false);
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast.error(`Failed to submit review: ${error.message || 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle review editing
  const handleEditReview = async (data: ReviewFormInputs) => {
    if (!editingReview || !userName) return;

    const selectedProject = projects.find(p => p.id === data.projectId);
    if (!selectedProject) {
      toast.error('Please select a valid project');
      return;
    }

    setSubmitting(true);
    try {
      const reviewRef = doc(db, 'reviews', editingReview.id);
      await updateDoc(reviewRef, {
        project: selectedProject.name,
        rating: data.rating,
        feedback: sanitizeInput(data.feedback),
        showOnHomepage: data.showOnHomepage,
        status: data.showOnHomepage ? 'pending' : null,
      });
      toast.success('Review updated successfully!');
      setIsEditModalOpen(false);
      setEditingReview(null);
      reset();
      const querySnapshot = await getDocs(collection(db, 'reviews'));
      const reviewData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
        showOnHomepage: doc.data().showOnHomepage || false,
        status: doc.data().status || null,
        fsdId: doc.data().fsdId || '',
      })) as Review[];
      setReviews(reviewData);
    } catch (error: any) {
      console.error('Error updating review:', error);
      toast.error(`Failed to update review: ${error.message || 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle review deletion
  const handleDeleteReview = async () => {
    if (!reviewToDelete) return;

    setSubmitting(true);
    try {
      await deleteDoc(doc(db, 'reviews', reviewToDelete));
      toast.success('Review deleted successfully!');
      setReviews(reviews.filter(review => review.id !== reviewToDelete));
      setIsDeleteModalOpen(false);
      setReviewToDelete(null);
    } catch (error: any) {
      console.error('Error deleting review:', error);
      toast.error(`Failed to delete review: ${error.message || 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle star rating selection
  const handleStarClick = (rating: number) => {
    setValue('rating', rating);
  };

  // Open edit modal
  const openEditModal = (review: Review) => {
    setEditingReview(review);
    setValue('projectId', projects.find(p => p.name === review.project)?.id || '');
    setValue('rating', review.rating);
    setValue('feedback', review.feedback);
    setValue('showOnHomepage', review.showOnHomepage);
    setIsEditModalOpen(true);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
  };

  const starVariants = {
    filled: { scale: 1.2, color: '#FFD700' },
    empty: { scale: 1, color: '#D1D5DB' },
    hover: { scale: 1.3, color: '#FFCA28' },
  };

  // Status indicator component
  const StatusIndicator: React.FC<{ status: Review['status'] }> = ({ status }) => {
    const statusConfig = {
      pending: { color: 'text-yellow-500', symbol: '⏳', text: 'Under Review' },
      approved: { color: 'text-green-500', symbol: '✔', text: 'Added to Homepage' },
      rejected: { color: 'text-red-500', symbol: '✖', text: 'Rejected' },
    };

    if (!status) return null;

    const { color, symbol, text } = statusConfig[status];
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={`flex items-center space-x-2 ${color}`}
        role="status"
        aria-label={text}
      >
        <span className="text-lg">{symbol}</span>
        <span className="text-sm font-medium">{text}</span>
      </motion.div>
    );
  };

  // Memoized sorted and filtered reviews
  const sortedAndFilteredReviews = useMemo(() => {
    let filtered = reviews;
    if (filterStatus !== 'all') {
      filtered = reviews.filter(review => review.status === filterStatus);
    }
    return filtered.sort((a, b) => {
      if (sortOption === 'date') return b.timestamp.getTime() - a.timestamp.getTime();
      if (sortOption === 'rating') return b.rating - a.rating;
      return a.project.localeCompare(b.project);
    });
  }, [reviews, sortOption, filterStatus]);

  // Retry mechanism for failed fetches
  const retryFetch = async (fn: () => Promise<void>, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        await fn();
        return;
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <Toaster position="top-right" />
      <Helmet>
         <title>LonewolfFSD Client Review Portal</title>
      </Helmet>

      <main className="max-w-6xl mx-auto p-4 sm:p-6">
        <motion.h1
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-3xl sm:text-4xl font-bold tracking-tight mb-10 mt-20"
          style={{ fontFamily: 'Poppins' }}
        >
          LonewolfFSD Client Review Portal
        </motion.h1>

        {/* Review Form */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <h2 className="text-lg sm:text-xl font-semibold mb-6" style={{ fontFamily: 'Poppins' }}>
            Submit Your Review
          </h2>
          <form
            onSubmit={handleSubmit(() => setIsConfirmModalOpen(true))}
            className="space-y-6"
            aria-label="Review submission form"
          >
            <div>
              <label htmlFor="fsdId" className="block text-sm font-medium mb-1">
                FSD ID
              </label>
              <div className="relative">
                <input
                  id="fsdId"
                  {...register('fsdId', { required: 'FSD ID is required' })}
                  className="w-full p-3 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-black transition-all"
                  placeholder="Enter your FSD ID"
                  aria-invalid={!!errors.fsdId}
                  aria-describedby="fsdId-error"
                />
                {fetchingUser && (
                  <span className="absolute right-3 top-3 text-gray-500 animate-pulse">🔄</span>
                )}
                {userName && !fetchingUser && (
                  <span className="absolute right-3 top-3 text-green-500">✔</span>
                )}
              </div>
              {errors.fsdId && (
                <p id="fsdId-error" className="text-red-500 text-sm mt-1" role="alert">
                  {errors.fsdId.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Name
              </label>
              <div className="w-full p-3 bg-gray-100 rounded-md text-gray-600">
                {fetchingUser ? (
                  <span className="animate-pulse">Fetching...</span>
                ) : userName || 'Please enter a valid FSD ID'}
              </div>
            </div>

            <div>
              <label htmlFor="projectId" className="block text-sm font-medium mb-1">
                Project
              </label>
              <select
                id="projectId"
                {...register('projectId', { required: 'Project is required' })}
                className="w-full p-3 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-black transition-all"
                disabled={!userName || projects.length === 0}
                aria-invalid={!!errors.projectId}
                aria-describedby="projectId-error"
              >
                {projects.length === 0 ? (
                  <option value="">No completed projects available</option>
                ) : (
                  projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))
                )}
              </select>
              {errors.projectId && (
                <p id="projectId-error" className="text-red-500 text-sm mt-1" role="alert">
                  {errors.projectId.message}
                </p>
              )}
            </div>

            <fieldset className="border p-4 sm:p-6 md:p-6 rounded-xl">
              <legend className="text-base font-medium mb-1" style={{ fontFamily: 'Poppins' }}>
                Rating
              </legend>
              <div className="flex space-x-2 -mt-4" role="radiogroup" aria-label="Rating selection">
                {[1, 2, 3, 4, 5].map(star => (
                  <motion.button
                    key={star}
                    type="button"
                    className="text-3xl sm:text-4xl cursor-pointer focus:outline-none"
                    variants={starVariants}
                    animate={watch('rating') >= star ? 'filled' : 'empty'}
                    whileHover="hover"
                    onClick={() => handleStarClick(star)}
                    role="radio"
                    aria-checked={watch('rating') >= star}
                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  >
                    ★
                  </motion.button>
                ))}
              </div>
              {errors.rating && (
                <p className="text-red-500 text-sm mt-1" role="alert">
                  {errors.rating.message}
                </p>
              )}
            </fieldset>

            <div>
              <label htmlFor="feedback" className="block text-sm font-medium mb-1">
                Feedback
              </label>
              <textarea
                id="feedback"
                {...register('feedback', { required: 'Feedback is required' })}
                className="w-full p-3 bg-gray-50 text-sm rounded-md border outline-none transition-all"
                placeholder="Your Feedback"
                rows={4}
                aria-invalid={!!errors.feedback}
                aria-describedby="feedback-error"
              />
              {errors.feedback && (
                <p id="feedback-error" className="text-red-error text-sm mt-2 animate-pulse" role="alert">
                  {errors.feedback.message}
                </p>
              )}
            </div>

            <div className="relative flex items-center group">
              <input
                id="showOnHomepage"
                {...register('showOnHomepage')}
                type="checkbox"
                className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                aria-describedby="showOnHomepage-tooltip"
              />
              <label htmlFor="showOnHomepage" className="ml-2 text-sm font-medium">
                Display my review on the LonewolfFSD homepage
              </label>
              <div className="hidden group-hover:block absolute z-10 p-2 bg-gray-800 text-white text-xs rounded shadow-lg -mt-20">
                Your review will be submitted for approval before appearing on the homepage.
              </div>


            </div>
                            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="px-4 py-4 sm:px-6 sm:py-3 bg-black text-white rounded-md font-medium cursor-pointer w-full sm:w-auto disabled:bg-gray-500 disabled:cursor-not-allowed"
                disabled={fetchingUser || !userName || submitting}
                aria-disabled={fetchingUser || !userName || submitting}
                >
                {submitting ? 'Submitting...' : 'Submit Review'}
                </motion.button>
          </form>
        </motion.section>

        {/* Confirmation Modal */}
        <Transition show={isConfirmModalOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={() => setIsConfirmModalOpen(false)}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75" />
            </Transition.Child>

            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
                  <Dialog.Title className="text-lg font-semibold mb-4">
                    Confirm Submission
                  </Dialog.Title>
                  <p className="text-sm text-gray-600 mb-6">
                    Are you sure you want to submit your review? This action cannot be undone unless edited later.
                  </p>
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-200 rounded-md"
                      onClick={() => setIsConfirmModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 bg-black text-white rounded-md"
                      onClick={handleSubmit(onSubmit)}
                      disabled={submitting}
                    >
                      {submitting ? 'Submitting...' : 'Confirm'}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>

        {/* Edit Modal */}
        <Transition show={isEditModalOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={() => {
            setIsEditModalOpen(false);
            setEditingReview(null);
            reset();
          }}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75" />
            </Transition.Child>

            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full">
                  <Dialog.Title className="text-lg font-semibold mb-4">
                    Edit Review
                  </Dialog.Title>
                  <form onSubmit={handleSubmit(handleEditReview)} className="space-y-6">
                    <div>
                      <label htmlFor="editProjectId" className="block text-sm font-medium mb-1">
                        Project
                      </label>
                      <select
                        id="editProjectId"
                        {...register('projectId', { required: 'Project is required' })}
                        className="w-full p-3 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      >
                        {projects.map(project => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <fieldset className="border p-6 rounded-xl">
                      <legend className="block text-base font-medium mb-1">
                        Rating
                      </legend>
                      <div className="flex space-x-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <motion.span
                            key={star}
                            className="text-4xl cursor-pointer"
                            variants={starVariants}
                            animate={watch('rating') >= star ? 'filled' : 'empty'}
                            whileHover="hover"
                            onClick={() => handleStarClick(star)}
                          >
                            ★
                          </motion.span>
                        ))}
                      </div>
                    </fieldset>

                    <div>
                      <label htmlFor="editFeedback" className="block text-sm font-medium mb-1">
                        Feedback
                      </label>
                      <textarea
                        id="editFeedback"
                        {...register('feedback', { required: 'Feedback is required' })}
                        className="w-full p-3 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                        rows={4}
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        id="editShowOnHomepage"
                        {...register('showOnHomepage')}
                        type="checkbox"
                        className="h-4 w-4 text-black focus:ring-black border-gray-300"
                      />
                      <label htmlFor="editShowOnHomepage" className="ml-2 text-sm font-medium">
                        Display on homepage
                      </label>
                    </div>

                    <div className="flex justify-end space-x-4">
                      <button
                        type="button"
                        className="px-4 py-2 bg-gray-200 rounded-md"
                        onClick={() => {
                          setIsEditModalOpen(false);
                          setEditingReview(null);
                          reset();
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-black text-white rounded-md"
                        onClick={() => {
                          handleEditReview
                        }}
                        disabled={submitting}
                      >
                        {submitting ? 'Updating...' : 'Update Review'}
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>

        {/* Delete Modal */}
        <Transition show={isDeleteModalOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={() => {
            return setIsDeleteModalOpen(false);
            setReviewToDelete(null);
          }}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75" />
            </Transition.Child>

            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel
                  as="div" className="bg-white rounded-md p-6 max-w-sm w-full"
                >
                  <Dialog.Title>
                    Delete Review
                  </Dialog.Title>
                  <p className="text-sm text-gray-600 mb-6">
                    Are you sure you want to delete this review? This action cannot be undone.
                  </p>
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-200 rounded-md"
                      onClick={() => {
                        setIsDeleteModalOpen(false);
                        setReviewToDelete(null);
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 bg-red-600 text-white rounded-md"
                      onClick={handleDeleteReview}
                      disabled={submitting}
                    >
                      {submitting ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>

        <hr className="mb-14 mt-20" />

        {/* Reviews List */}
        <motion.section variants={containerVariants} initial="hidden" animate="visible">
          <div className="flex flex-col sm:flex-row justify-between items-left space-y-4 sm:space-y-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold" style={{ fontFamily: 'Poppins' }}>
              Your Reviews
            </h2>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <select
                onChange={(e) => setSortOption(e.target.value as typeof sortOption)}
                className="p-2 border rounded-md"
                aria-label="Sort reviews"
              >
                <option value="date">Sort by Date</option>
                <option value="rating">Sort by Rating</option>
                <option value="project">Sort by Name</option>
              </select>
              <select
                onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                className="p-2 border rounded-md"
                aria-label="Filter by status"
              >
                <option value="all">All Reviews</option>
                <option value="pending">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {loading ? (
            <TailwindSpinner />
          ) : sortedAndFilteredReviews.length === 0 ? (
              <p className="text-gray-500 mb-10">No reviews yet.</p>
              ) : (
                <AnimatePresence>
                  {sortedAndFilteredReviews.map(review => (
                    <motion.div
                      key={review.id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, y: 50 }}
                      className="mb-4 p-4 sm:p-6 bg-gray-50 rounded-lg shadow-sm border border-gray-200 grid sm:grid-cols-1 md:grid-cols-3 gap-4"
                    >
                      <div className="md:col-span-3">
                        <div className="flex justify-between mb-2 items-center">
                          <h3 className="text-lg sm:text-xl font-semibold">{review.project}</h3>
                          <span className="text-sm text-gray-500">
                            {review.timestamp.toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-base text-gray-600 mb-2 -mt-2">
                          <span className="text-yellow-400 text-xl">{'★'.repeat(review.rating)}</span>
                        </p>
                        <hr className="divider" />
                        <p className="text-sm font-semibold text-gray-600 underline mb-2 mt-4">Issuer: {review.name}</p>
                        <p className="text-sm text-gray-600 italic mt-4">{review.feedback}</p>
                        <br />
                        {review.showOnHomepage && (
                          <StatusIndicator status={review.status} />
                        )}
                        <hr className='mb-4 mt-4 ' />
                                              {review.status === 'pending' && (
                        <div className="flex flex-row space-x-2 md:space-x-2 justify-end">
                          <button
                            type="submit"
                            className="px-4 py-2 sm:bg-red- bg-red-600 text-sm text-white rounded-md flex gap-2"
                            onClick={() => {
                              setReviewToDelete(review.id);
                              setIsDeleteModalOpen(true);
                            }}
                            aria-label="Delete review for {review.project}"
                          >
                            <Trash2 size={17} /> Delete Review
                          </button>
                        </div>
                      )}
                      </div>

                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </motion.section>
        </main>
      </div>
    );
  };
  
export default ClientReview;
