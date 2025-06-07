import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Plus, Edit2, Trash2, Briefcase, Rocket, ChevronLeft, ChevronRight, Search, Circle, Users, Music } from 'lucide-react';
import { Tilt } from 'react-tilt';
import { db, auth } from '../firebase';
import { collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, setDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Tooltip } from 'react-tooltip';
import axios from 'axios';

// Interface for timeline events
interface TimelineEvent {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  time: string;
  icon: string;
  status: 'Active' | 'Completed';
}

// Interface for holidays
interface Holiday {
  date: string;
  name: string;
}

// Interface for stats
interface Stats {
  totalProjects: number;
  activeProjects: number;
  nextDeadline: string;
}

// Interface for user
 interface User {
   role: 'admin' | 'user';
   name: string;
   availability: 'Available' | 'Busy' | 'On Leave' | 'Offline';
   uid: string;
 }

// Interface for Spotify track
interface SpotifyTrack {
  name: string;
  artist: string;
  albumArt: string;
  durationMs: number;
  progressMs: number;
  externalUrl: string;
}

const ModernCalendar: React.FC = () => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [stats, setStats] = useState<Stats>({ totalProjects: 0, activeProjects: 0, nextDeadline: '' });
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [displayedDate, setDisplayedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalEvent, setModalEvent] = useState<Partial<TimelineEvent>>({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [userRole, setUserRole] = useState<User | null>(null);
  const [filter, setFilter] = useState<'All' | 'Active' | 'Completed'>('All');
  const [sortBy, setSortBy] = useState<'startDate' | 'endDate' | 'title'>('startDate');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDateEvents, setSelectedDateEvents] = useState<(TimelineEvent | Holiday)[]>([]);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [spotifyTrack, setSpotifyTrack] = useState<SpotifyTrack | null>(null);
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Fetch user role and Spotify auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            setUserRole(doc.data() as User);
          }
        });
        // Check Spotify auth
        const spotifyDocRef = doc(db, `users/${user.uid}/spotify`, 'auth');
        const spotifyDoc = await getDoc(spotifyDocRef);
        if (spotifyDoc.exists()) {
          const { access_token, expires_at } = spotifyDoc.data();
          if (Date.now() < expires_at) {
            setIsSpotifyConnected(true);
            fetchSpotifyTrack(access_token);
          } else {
            await refreshSpotifyToken(user.uid);
            const updatedDoc = await getDoc(spotifyDocRef);
            if (updatedDoc.exists()) {
              setIsSpotifyConnected(true);
              fetchSpotifyTrack(updatedDoc.data().access_token);
            }
          }
        } else {
          setIsSpotifyConnected(false);
          setSpotifyTrack(null);
        }
      } else {
        setUserRole(null);
        setIsSpotifyConnected(false);
        setSpotifyTrack(null);
      }
    });
    return () => unsubscribe();
  }, []);

useEffect(() => {
  async function handleSpotifyCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code && auth.currentUser) {
      await exchangeSpotifyCode(code, auth.currentUser.uid);
      setIsSpotifyConnected(true);
      window.history.replaceState({}, document.title, '/calendar');
    }
  }

  handleSpotifyCallback();
}, []);

  // Fetch team members
  useEffect(() => {
   const unsubscribe = onSnapshot(collection(db, 'team'), (snapshot) => {
      const members = snapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as User));
      setTeamMembers(members.slice(0, 4)); // Limit to 4 for display
    }, (error) => {
      console.error('Error fetching team members:', error.message);
    });
    return () => unsubscribe();
  }, []);

  // Fetch data from Firebase
  useEffect(() => {
    const unsubscribeEvents = onSnapshot(collection(db, 'events'), (snapshot) => {
      const fetchedEvents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TimelineEvent));
      setEvents(fetchedEvents);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching events:', error.message);
      setLoading(false);
    });

    const unsubscribeHolidays = onSnapshot(collection(db, 'holidays'), (snapshot) => {
      const fetchedHolidays = snapshot.docs.map(doc => doc.data() as Holiday);
      setHolidays(fetchedHolidays);
    }, (error) => {
      console.error('Error fetching holidays:', error.message);
    });

    const unsubscribeStats = onSnapshot(doc(db, 'stats', 'info'), (doc) => {
      if (doc.exists()) {
        setStats(doc.data() as Stats);
      }
    }, (error) => {
      console.error('Error fetching stats:', error.message);
    });

    return () => {
      unsubscribeEvents();
      unsubscribeHolidays();
      unsubscribeStats();
    };
  }, []);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Poll Spotify track every 10 seconds if connected
  useEffect(() => {
    if (isSpotifyConnected && userRole) {
      const interval = setInterval(() => {
        const spotifyDocRef = doc(db, `users/${auth.currentUser?.uid}/spotify`, 'auth');
        getDoc(spotifyDocRef).then((doc) => {
          if (doc.exists()) {
            fetchSpotifyTrack(doc.data().access_token);
          }
        });
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [isSpotifyConnected, userRole]);

  // Connect to Spotify
const connectSpotify = () => {
   const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
   const redirectUri = encodeURIComponent(import.meta.env.VITE_SPOTIFY_REDIRECT_URI);
   const scope = 'user-read-playback-state';
   const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${scope}`;
   window.location.href = authUrl;
 };

  // Exchange Spotify auth code for tokens
  const exchangeSpotifyCode = async (code: string, uid: string) => {
    try {
      const response = await axios.post('https://accounts.spotify.com/api/token', new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
        client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
        client_secret: import.meta.env.VITE_SPOTIFY_CLIENT_SECRET,
      }), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      const { access_token, refresh_token, expires_in } = response.data;
      const expires_at = Date.now() + expires_in * 1000;
      await setDoc(doc(db, `users/${uid}/spotify`, 'auth'), { access_token, refresh_token, expires_at });
      setIsSpotifyConnected(true);
      fetchSpotifyTrack(access_token);
    } catch (error) {
      console.error('Error exchanging Spotify code:', error);
    }
  };

  // Refresh Spotify token
  const refreshSpotifyToken = async (uid: string) => {
    try {
      const spotifyDoc = await getDoc(doc(db, `users/${uid}/spotify`, 'auth'));
      if (spotifyDoc.exists()) {
        const { refresh_token } = spotifyDoc.data();
        const response = await axios.post('https://accounts.spotify.com/api/token', new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token,
          client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
          client_secret: import.meta.env.VITE_SPOTIFY_CLIENT_SECRET,
        }), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
        const { access_token, expires_in } = response.data;
        const expires_at = Date.now() + expires_in * 1000;
        await updateDoc(doc(db, `users/${uid}/spotify`, 'auth'), { access_token, expires_at });
        setIsSpotifyConnected(true);
        fetchSpotifyTrack(access_token);
      }
    } catch (error) {
      console.error('Error refreshing Spotify token:', error);
      setIsSpotifyConnected(false);
    }
  };

  // Fetch current Spotify track
  const fetchSpotifyTrack = async (accessToken: string) => {
    try {
      const response = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (response.status === 200 && response.data) {
        const item = response.data.item;
        setSpotifyTrack({
          name: item.name,
          artist: item.artists[0].name,
          albumArt: item.album.images[2]?.url || '',
          durationMs: item.duration_ms,
          progressMs: response.data.progress_ms,
          externalUrl: item.external_urls.spotify,
        });
      } else {
        setSpotifyTrack(null);
      }
    } catch (error) {
      console.error('Error fetching Spotify track:', error);
      setSpotifyTrack(null);
    }
  };

  // Handle event form submission
  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userRole || userRole.role !== 'admin') return;
    try {
      if (isEditMode && modalEvent.id) {
        await updateDoc(doc(db, 'events', modalEvent.id), modalEvent);
      } else {
        await addDoc(collection(db, 'events'), modalEvent);
      }
      setIsModalOpen(false);
      setModalEvent({});
      setIsEditMode(false);
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  // Handle event deletion
  const handleDeleteEvent = async (id: string) => {
    if (!userRole || userRole.role !== 'admin') return;
    try {
      await deleteDoc(doc(db, 'events', id));
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  // Handle status update
  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userRole || userRole.role !== 'admin' || !selectedUser) return;
    try {
      await updateDoc(doc(db, 'team', selectedUser.uid), {
        availability: selectedUser.availability,
      });
      setIsStatusModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Calculate event progress
  const calculateProgress = (startDate: string, endDate: string) => {
    const today = new Date('2025-06-07');
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (today < start) return 0;
    if (today > end) return 100;
    const total = end.getTime() - start.getTime();
    const elapsed = today.getTime() - start.getTime();
    return Math.round((elapsed / total) * 100);
  };

  // Calculate Spotify track progress
  const calculateSpotifyProgress = (progressMs: number, durationMs: number) => {
    return Math.round((progressMs / durationMs) * 100);
  };

  // Filter and sort events
  const filteredEvents = events
    .filter(event => filter === 'All' || event.status === filter)
    .filter(event =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.startDate.includes(searchQuery) ||
      event.endDate.includes(searchQuery)
    )
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return new Date(a[sortBy]).getTime() - new Date(b[sortBy]).getTime();
    });

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  const timelineVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.3 } }
  };

  const eventVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
  };

  const yearVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const clockDigitVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { duration: 0.3 } },
    exit: { y: -20, opacity: 0, transition: { duration: 0.3 } }
  };

  // Custom calendar grid
  const renderCalendar = () => {
    const year = displayedDate.getFullYear();
    const month = displayedDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const weeks = [];
    let week = Array(7).fill(null);

    for (let i = 0; i < firstDay; i++) {
      week[i] = null;
    }

    days.forEach((day, index) => {
      const dayIndex = (index + firstDay) % 7;
      week[dayIndex] = day;
      if (dayIndex === 6 || index === days.length - 1) {
        weeks.push([...week]);
        week = Array(7).fill(null);
      }
    });

    return (
      <div ref={calendarRef} className="grid grid-cols-7 gap-1 text-xs" tabIndex={0}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center font-semibold text-black/60">{day}</div>
        ))}
        {weeks.map((week, weekIndex) => (
          <React.Fragment key={weekIndex}>
            {week.map((day, dayIndex) => {
              const currentDate = new Date(year, month, day || 1);
              const isPastDate = day && currentDate < new Date(2025, 5, 7);
              const isHoliday = holidays.some(h => h.date === `${year}-${(month + 1).toString().padStart(2, '0')}-${day?.toString().padStart(2, '0')}`);
              const isCurrentDate = day && new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;
              const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day?.toString().padStart(2, '0')}`;
              const dateEvents = [
                ...holidays.filter(h => h.date === dateStr).map(h => ({ ...h, type: 'holiday' })),
                ...events.filter(e => e.startDate === dateStr || e.endDate === dateStr).map(e => ({ ...e, type: 'event' }))
              ];
              return (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={`p-2.5 text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-black ${
                    day
                      ? isPastDate || isHoliday
                        ? 'text-gray-500'
                        : isCurrentDate
                        ? 'text-black font-bold'
                        : 'text-black'
                      : 'text-transparent'
                  }`}
                  data-tooltip-id={`tooltip-${dateStr}`}
                  data-tooltip-content={dateEvents.map(e => e.type === 'holiday' ? e.name : `${e.title} (${e.startDate === dateStr ? 'Starts' : 'Ends'})`).join(', ') || 'No events'}
                  onClick={() => {
                    setSelectedDateEvents(dateEvents);
                    setIsDateModalOpen(true);
                  }}
                  tabIndex={0}
                >
                  {day || ''}
                  <Tooltip id={`tooltip-${dateStr}`} className="bg-black text-white text-xs rounded p-2" />
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    );
  };

  // Animated digital clock
  const renderDigitalClock = () => {
    const hours = currentTime.getHours().toString().padStart(2, '0');
    const minutes = currentTime.getMinutes().toString().padStart(2, '0');
    const seconds = currentTime.getSeconds().toString().padStart(2, '0');
    const ampm = currentTime.getHours() >= 12 ? 'PM' : 'AM';
    return (
      <div className="text-2xl font-mono text-black tracking-wider flex gap-1">
        {hours.split('').map((digit, i) => (
          <motion.span key={`h${i}-${digit}`} variants={clockDigitVariants} initial="initial" animate="animate" exit="exit">{digit}</motion.span>
        ))}
        <span>:</span>
        {minutes.split('').map((digit, i) => (
          <motion.span key={`m${i}-${digit}`} variants={clockDigitVariants} initial="initial" animate="animate" exit="exit">{digit}</motion.span>
        ))}
        <span>:</span>
        {seconds.split('').map((digit, i) => (
          <motion.span key={`s${i}-${digit}`} variants={clockDigitVariants} initial="initial" animate="animate" exit="exit">{digit}</motion.span>
        ))}
        <span className="ml-1">{ampm}</span>
      </div>
    );
  };

  // Render icon
  const renderIcon = (icon: string) => {
    const iconMap: { [key: string]: React.ComponentType } = { briefcase: Briefcase, rocket: Rocket };
    const IconComponent = iconMap[icon] || Briefcase;
    return <IconComponent className="w-5 h-5 mr-2" />;
  };

  // Render status dot
  const renderStatusDot = (status: string) => {
    const statusColors: { [key: string]: string } = {
      Available: 'text-green-500',
      Busy: 'text-red-500',
      'On Leave': 'text-orange-500',
      Offline: 'text-gray-500',
    };
    return <Circle className={`w-3 h-3 ${statusColors[status]}`} fill="currentColor" />;
  };

  return (
    <div className="min-h-screen bg-white flex justify-center items-start p-4 md:p-8" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="relative w-full max-w-7xl flex flex-col md:flex-row gap-8">
        {/* Left Floating Cards */}
        <div className="md:w-1/5 space-y-4 md:fixed md:left-8 flex flex-col">
          <Tilt options={{ max: 25, scale: 1.05 }}>
            <motion.div className="bg-white border border-black/20 rounded-xl p-4 shadow-md" variants={cardVariants} initial="hidden" animate="visible">
              <h3 className="text-base font-semibold text-black mb-2">Project Stats</h3>
              <p className="text-black/80 text-sm">Total: <span className="font-bold">{stats.totalProjects}</span></p>
              <p className="text-black/80 text-sm">Completed: <span className="font-bold">{stats.totalProjects - stats.activeProjects}</span></p>
            </motion.div>
          </Tilt>
          <Tilt options={{ max: 25, scale: 1.05 }}>
            <motion.div className="bg-white border border-black/20 rounded-xl p-4 shadow-md" variants={cardVariants} initial="hidden" animate="visible">
              <h3 className="text-base font-semibold text-black mb-2">Current Work</h3>
              <p className="text-black/80 text-sm">Active: <span className="font-bold">{stats.activeProjects}</span></p>
              <p className="text-black/80 text-sm">Deadline: <span className="font-bold">{stats.nextDeadline || 'N/A'}</span></p>
            </motion.div>
          </Tilt>
          <Tilt options={{ max: 25, scale: 1.05 }}>
            <motion.div className="bg-white border border-black/20 rounded-xl p-4 shadow-md" variants={cardVariants} initial="hidden" animate="visible">
              <h3 className="text-base font-semibold text-black mb-2">Holiday List</h3>
              <p className="text-black/80 text-sm">{holidays[0]?.name || 'None'}: <span className="font-bold">{holidays[0]?.date || 'N/A'}</span></p>
            </motion.div>
          </Tilt>
          <Tilt options={{ max: 25, scale: 1.05 }}>
            <motion.div className="bg-white border border-black/20 rounded-xl p-4 shadow-md" variants={cardVariants} initial="hidden" animate="visible">
              <h3 className="text-base font-semibold text-black mb-2 flex items-center">
                <Users className="w-4 h-4 mr-2" /> Team Availability
              </h3>
              {teamMembers.length === 0 ? (
                <p className="text-black/80 text-sm">No team members found</p>
              ) : (
                <ul className="space-y-2">
                  {teamMembers.map((member, index) => (
                    <li
                       key={member.uid}
                       className="flex items-center justify-between text-sm text-black/80"
                       data-tooltip-id={`tooltip-team-${member.uid}`}
                       data-tooltip-content={`Role: ${member.role}, Status: ${member.availability}`}
                    >
                      <div className="flex items-center">
                        {renderStatusDot(member.availability)}
                        <span className="ml-2">{member.name}</span>
                      </div>
                      {userRole?.role === 'admin' && (
                        <button
                          onClick={() => {
                            setSelectedUser({ ...member, uid: teamMembers[index].uid || '' });
                            setIsStatusModalOpen(true);
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      )}
                      <Tooltip id={`tooltip-team-${member.uid}`} className="bg-black text-white text-xs rounded p-2" />
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          </Tilt>
        </div>

        {/* Center Timeline */}
        <div className="md:w-3/5 max-w-4xl mx-auto">
          <div className="mb-4">
            <div className="flex justify-start gap-2 mb-4">
              <select
                className="border border-black/20 rounded-lg p-2 text-sm w-48"
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'All' | 'Active' | 'Completed')}
              >
                <option value="All">All</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
              </select>
              <select
                className="border border-black/20 rounded-lg p-2 text-sm w-60"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'startDate' | 'endDate' | 'title')}
              >
                <option value="startDate">Start Date</option>
                <option value="endDate">End Date</option>
                <option value="title">Title</option>
              </select>
            </div>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black/60" />
              <input
                type="text"
                placeholder="Search events..."
                className="border border-black/20 rounded p-3 outline-none pl-10 text-sm w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <motion.div className="flex flex-col items-start" variants={timelineVariants} initial="hidden" animate="visible">
            <div className="relative w-full mb-16">
              <br />
              <motion.div
                className="text-6xl font-bold text-black mb-6"
                style={{ WebkitTextStroke: '2px black', color: 'transparent', textShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}
                variants={yearVariants}
              >
                2025
              </motion.div>
              <div className="w-full h-px bg-gradient-to-b from-black/20 to-transparent mb-4" />
              {loading ? (
                <div className="text-black/60">Loading events...</div>
              ) : filteredEvents.length === 0 ? (
                <div className="text-black/60">No projects available to display</div>
              ) : (
                filteredEvents.map((event, index) => (
                  <Tilt key={event.id} options={{ max: 25, scale: 1.05 }}>
                    <motion.div
                      className="relative bg-white border border-black/10 rounded-xl p-5 shadow-lg mb-6 flex justify-between items-start"
                      variants={eventVariants}
                    >
                      <div>
                        <div className="flex items-center">
                          {renderIcon(event.icon)}
                          <h3 className="text-lg font-semibold text-black mb-2">{event.title}</h3>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:gap-4 text-sm text-black/70">
                          <p>Start: {event.startDate}</p>
                          <p>End: {event.endDate}</p>
                          <p>Time: {event.time}</p>
                          <p>Status: {event.status}</p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                          <div
                            className="bg-black h-2.5 rounded-full"
                            style={{ width: `${calculateProgress(event.startDate, event.endDate)}%` }}

                          ></div>
                        </div>
                      </div>
                      {userRole?.role === 'admin' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setModalEvent(event);
                              setIsEditMode(true);
                              setIsModalOpen(true);
                            }}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  </Tilt>
                )))}
            </div>
          </motion.div>
        </div>

        {/* Right Floating Cards */}
        <div className="md:w-1/5 space-y-4 md:fixed md:right-8 flex flex-col">
          <Tilt options={{ max: 25, scale: 1.05 }}>
            <motion.div className="bg-white border border-black/20 rounded-xl p-4 shadow-md" variants={cardVariants} initial="hidden" animate="visible">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-base font-semibold text-black flex items-center">
                  <Calendar className="w-4 h-4 mr-2" /> {displayedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDisplayedDate(new Date(displayedDate.getFullYear(), displayedDate.getMonth() - 1, 1))}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDisplayedDate(new Date(displayedDate.getFullYear(), displayedDate.getMonth() + 1, 1))}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {renderCalendar()}
            </motion.div>
          </Tilt>
          <Tilt options={{ max: 25, scale: 1.05 }}>
            <motion.div
              className="bg-white border border-black/20 rounded-xl p-4 shadow-md flex justify-center"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
            >
              <div>
                <h3 className="text-base font-semibold text-black mb-2 flex items-center">
                  <Clock className="w-4 h-4 mr-2" /> Current Time
                </h3>
                {renderDigitalClock()}
              </div>
            </motion.div>
          </Tilt>
          <Tilt options={{ max: 25, scale: 1.05 }}>
            <motion.div
              className="bg-white border border-black/20 rounded-xl p-4 shadow-md"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
            >
              <h3 className="text-base font-semibold text-black mb-2 flex items-center">
                <Music className="w-4 h-4 mr-2" /> Now Playing
              </h3>
              {isSpotifyConnected ? (
                spotifyTrack && spotifyTrack.name ? (
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <a href={spotifyTrack.externalUrl} target="_blank" rel="noopener noreferrer">
                        <img
                          src={spotifyTrack.albumArt}
                          alt="Album Art"
                          className="w-12 h-12 rounded filter grayscale"
                        />
                      </a>
                      <div>
                        <p
                          className="text-sm text-black/80 truncate max-w-[150px]"
                          data-tooltip-id="tooltip-spotify"
                          data-tooltip-content={`${spotifyTrack.name} by ${spotifyTrack.artist}`}
                        >
                          {spotifyTrack.name}
                        </p>
                        <p className="text-xs text-black/60">{spotifyTrack.artist}</p>
                        <Tooltip id="tooltip-spotify" className="bg-black text-white text-xs rounded p-2" />
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                      <div
                        className="bg-black h-1.5 rounded-full"
                        style={{ width: `${calculateSpotifyProgress(spotifyTrack.progressMs, spotifyTrack.durationMs)}%` }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-black/80">Not listening to anything</p>
                )
              ) : (
                <button
                  onClick={connectSpotify}
                  className="px-4 py-2 bg-black text-white rounded text-sm hover:bg-gray-800"
                >
                  Connect Spotify
                </button>
              )}
            </motion.div>
          </Tilt>
        </div>

        {/* Floating Action Button (Admin Only) */}
        {userRole?.role === 'admin' && (
          <button
            className="fixed bottom-8 right-8 bg-black text-white rounded-full p-4 shadow-lg hover:bg-gray-800"
            onClick={() => {
              setModalEvent({});
              setIsEditMode(false);
              setIsModalOpen(true);
            }}
          >
            <Plus className="w-6 h-6" />
          </button>
        )}

        {/* Event Modal */}
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl p-6 w-full max-w-md"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <h2 className="text-lg font-semibold mb-4">{isEditMode ? 'Edit Event' : 'Add Event'}</h2>
              <form onSubmit={handleEventSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Title"
                  className="w-full border border-black/20 rounded p-2 text-sm"
                  value={modalEvent.title || ''}
                  onChange={(e) => setModalEvent({ ...modalEvent, title: e.target.value })}
                  required
                />
                <input
                  type="date"
                  className="w-full border border-black/20 rounded p-2 text-sm"
                  value={modalEvent.startDate || ''}
                  onChange={(e) => setModalEvent({ ...modalEvent, startDate: e.target.value })}
                  required
                />
                <input
                  type="date"
                  className="w-full border border-black/20 rounded p-2 text-sm"
                  value={modalEvent.endDate || ''}
                  onChange={(e) => setModalEvent({ ...modalEvent, endDate: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Time (e.g., 09:00 AM - 05:00 PM)"
                  className="w-full border border-black/20 rounded p-2 text-sm"
                  value={modalEvent.time || ''}
                  onChange={(e) => setModalEvent({ ...modalEvent, time: e.target.value })}
                  required
                />
                <select
                  className="w-full border border-black/20 rounded p-2 text-sm"
                  value={modalEvent.icon || 'briefcase'}
                  onChange={(e) => setModalEvent({ ...modalEvent, icon: e.target.value })}
                >
                  <option value="briefcase">Briefcase</option>
                  <option value="rocket">Rocket</option>
                </select>
                <select
                  className="w-full border border-black/20 rounded p-2 text-sm"
                  value={modalEvent.status || 'Active'}
                  onChange={(e) => setModalEvent({ ...modalEvent, status: e.target.value as 'Active' | 'Completed' })}
                >
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                </select>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="px-4 py-2 border border-black/20 rounded text-sm"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-black text-white rounded text-sm">
                    {isEditMode ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Date Events Modal */}
        {isDateModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl p-6 w-full max-w-md"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <h2 className="text-lg font-semibold mb-4">Events on {selectedDateEvents[0]?.date || 'Selected Date'}</h2>
              {selectedDateEvents.length === 0 ? (
                <p className="text-black/70 text-sm">No events or holidays on this date.</p>
              ) : (
                <ul className="space-y-2">
                  {selectedDateEvents.map((item, index) => (
                    <li key={index} className="text-black/70 text-sm">
                      {item.type === 'holiday' ? item.name : `${item.title} (${item.startDate === item.date ? 'Starts' : 'Ends'})`}
                    </li>
                  ))}
                </ul>
              )}
              <button
                className="mt-4 px-4 py-2 border border-black/20 rounded text-sm"
                onClick={() => setIsDateModalOpen(false)}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* Status Update Modal */}
        {isStatusModalOpen && selectedUser && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl p-6 w-full max-w-md"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <h2 className="text-lg font-semibold mb-4">Update Status for {selectedUser.name}</h2>
              <form onSubmit={handleStatusSubmit} className="space-y-4">
                <select
                  className="w-full border border-black/20 rounded p-2 text-sm"
                  value={selectedUser.availability}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      availability: e.target.value as 'Available' | 'Busy' | 'On Leave' | 'Offline',
                    })
                  }
                >
                  <option value="Available">Available</option>
                  <option value="Busy">Busy</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Offline">Offline</option>
                </select>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="px-4 py-2 border border-black/20 rounded text-sm"
                    onClick={() => {
                      setSelectedUser(member);
                      setIsStatusModalOpen(true);
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-black text-white rounded text-sm">
                    Update
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ModernCalendar;