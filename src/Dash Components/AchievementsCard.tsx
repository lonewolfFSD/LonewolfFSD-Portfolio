import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { collection, onSnapshot, setDoc, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase'; // Adjust path to your firebase.ts
import { Tilt } from 'react-tilt';
import { motion } from 'framer-motion';

// Interface for Achievement
interface Achievement {
  achievementId: string;
  name: string;
  description: string;
  badgeImage: string; // URL to badge image
  earnedDate?: string; // ISO date string or undefined if locked
  status: 'earned' | 'locked';
}

interface AchievementsCardProps {
  isDark: boolean; // Prop to handle light/dark mode
  isAdmin?: boolean; // Prop to enable admin features
}

const AchievementsCard: React.FC<AchievementsCardProps> = ({ isDark, isAdmin = false }) => {
  const auth = getAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [success, setSuccess] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [newAchievement, setNewAchievement] = useState({
    name: '',
    description: '',
    badgeImage: '',
    status: 'earned' as 'earned' | 'locked',
  });
  const [userIdInput, setUserIdInput] = useState<string>('');
  const [achievementStats, setAchievementStats] = useState<Record<string, number>>({});

  // Fetch user's achievements
  useEffect(() => {
    const user = auth.currentUser;
    if (!user || !user.uid) {
      console.log('No user or UID for achievements');
      return;
    }

    const achievementsRef = collection(db, 'users', user.uid, 'achievements');
    const unsubscribe = onSnapshot(
      achievementsRef,
      (snapshot) => {
        const achievementList: Achievement[] = snapshot.docs.map((doc) => ({
          achievementId: doc.id,
          ...doc.data(),
        } as Achievement));
        setAchievements(achievementList);
      },
      (err) => {
        console.error('Achievements fetch error:', err);
        setError('Failed to load achievements.');
      }
    );

    return () => unsubscribe();
  }, []);

  // Fetch achievement stats (how many users have each achievement) for admins
  useEffect(() => {
    if (!isAdmin) return;

    const fetchStats = async () => {
      try {
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        const stats: Record<string, number> = {};

        for (const userDoc of usersSnapshot.docs) {
          const achievementsRef = collection(db, 'users', userDoc.id, 'achievements');
          const achievementsSnapshot = await getDocs(query(achievementsRef, where('status', '==', 'earned')));
          achievementsSnapshot.forEach((doc) => {
            const achievementId = doc.id;
            stats[achievementId] = (stats[achievementId] || 0) + 1;
          });
        }
        setAchievementStats(stats);
      } catch (err) {
        console.error('Achievement stats fetch error:', err);
        setError('Failed to load achievement stats.');
      }
    };

    fetchStats();
  }, [isAdmin]);

  // Create new achievement for all users
  const handleCreateAchievement = async () => {
    if (!isAdmin) return;
    if (!newAchievement.name || !newAchievement.description || !newAchievement.badgeImage) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      const achievementId = newAchievement.name.toLowerCase().replace(/\s+/g, '-');
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      const promises = usersSnapshot.docs.map((userDoc) => {
        const achievementRef = doc(db, 'users', userDoc.id, 'achievements', achievementId);
        return setDoc(achievementRef, {
          achievementId,
          name: newAchievement.name,
          description: newAchievement.description,
          badgeImage: newAchievement.badgeImage,
          status: newAchievement.status,
          ...(newAchievement.status === 'earned' ? { earnedDate: new Date().toISOString() } : {}),
        });
      });
      await Promise.all(promises);
      setNewAchievement({ name: '', description: '', badgeImage: '', status: 'earned' });
      setError('');
      setSuccess('Achievement created for all users successfully!');
    } catch (err) {
      console.error('Create achievement error:', err);
      setError('Failed to create achievement.');
    }
  };

  // Delete achievement
  const handleDeleteAchievement = async (achievementId: string) => {
    if (!isAdmin) return;
    try {
      const achievementRef = doc(db, 'users', auth.currentUser!.uid, 'achievements', achievementId);
      await deleteDoc(achievementRef);
    } catch (err) {
      console.error('Delete achievement error:', err);
      setError('Failed to delete achievement.');
    }
  };

  // Assign achievement to specific user
  const handleAssignToUser = async (achievementId: string, userId: string) => {
    if (!isAdmin) return;
    try {
      const achievement = achievements.find((a) => a.achievementId === achievementId);
      if (!achievement) {
        setError('Achievement not found.');
        return;
      }
      const userAchievementRef = doc(db, 'users', userId, 'achievements', achievementId);
      await setDoc(userAchievementRef, {
        ...achievement,
        earnedDate: new Date().toISOString(),
        status: 'earned',
      });
      setError('');
      setSuccess(`Achievement assigned to user ${userId} successfully!`);
    } catch (err) {
      console.error('Assign achievement error:', err);
      setError('Failed to assign achievement.');
    }
  };

  // Assign achievement to all users
  const handleAssignToAll = async (achievementId: string) => {
    if (!isAdmin) return;
    try {
      const achievement = achievements.find((a) => a.achievementId === achievementId);
      if (!achievement) {
        setError('Achievement not found.');
        return;
      }
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      const promises = usersSnapshot.docs.map((userDoc) => {
        const userAchievementRef = doc(db, 'users', userDoc.id, 'achievements', achievementId);
        return setDoc(userAchievementRef, {
          ...achievement,
          earnedDate: new Date().toISOString(),
          status: 'earned',
        });
      });
      await Promise.all(promises);
      setError('');
      setSuccess('Achievement assigned to all users successfully!');
    } catch (err) {
      console.error('Assign to all error:', err);
      setError('Failed to assign achievement to all users.');
    }
  };

  // CSS for shine effect
  const styles = `
    .badge-container {
      position: relative;
      display: inline-block;
    }
    .badge-image {
      width: 2.5rem; /* Matches h-10 w-10 (40px) */
      height: 2.5rem;
      border-radius: 50%;
      object-fit: cover;
      pointer-events: none;
    }
    .shine-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: linear-gradient(
        45deg,
        rgba(255, 255, 255, 0) 30%,
        rgba(255, 255, 255, 0.4) 50%,
        rgba(255, 255, 255, 0) 70%
      );
      background-size: 200% 200%;
      animation: shine 2s linear infinite;
      pointer-events: none;
    }
    @keyframes shine {
      0% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
      }
      100% {
        background-position: 0% 50%;
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div
        className={`border rounded-xl overflow-hidden ${
          isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
        }`}
      >
        <div
          className={`p-6 border-b ${
            isDark ? 'border-zinc-800' : 'border-zinc-200'
          }`}
        >
          <h3 className="text-lg font-semibold">Achievements</h3>
          <div className="flex items-center gap-1 mt-1">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <p
              className={`text-sm ${
                isDark ? 'text-zinc-400' : 'text-zinc-500'
              }`}
            >
              {achievements.filter((a) => a.status === 'earned').length} of{' '}
              {achievements.length} achievements earned
            </p>
          </div>
        </div>

        {isAdmin && (
          <div
            className={`p-6 border-b ${
              isDark ? 'border-zinc-800' : 'border-zinc-200'
            }`}
          >
            <h4 className="text-md font-semibold mb-4">Admin: Manage Achievements</h4>
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                {success}
              </div>
            )}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Achievement Name"
                  value={newAchievement.name}
                  onChange={(e) => setNewAchievement({ ...newAchievement, name: e.target.value })}
                  className={`p-2 border rounded-md ${
                    isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-zinc-200'
                  }`}
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={newAchievement.description}
                  onChange={(e) => setNewAchievement({ ...newAchievement, description: e.target.value })}
                  className={`p-2 border rounded-md ${
                    isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-zinc-200'
                  }`}
                />
                <input
                  type="text"
                  placeholder="Badge Image URL"
                  value={newAchievement.badgeImage}
                  onChange={(e) => setNewAchievement({ ...newAchievement, badgeImage: e.target.value })}
                  className={`p-2 border rounded-md ${
                    isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-zinc-200'
                  }`}
                />
                <select
                  value={newAchievement.status}
                  onChange={(e) =>
                    setNewAchievement({ ...newAchievement, status: e.target.value as 'earned' | 'locked' })
                  }
                  className={`p-2 border rounded-md ${
                    isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-zinc-200'
                  }`}
                >
                  <option value="earned">Earned</option>
                  <option value="locked">Locked</option>
                </select>
                <button
                  onClick={handleCreateAchievement}
                  className="p-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600"
                >
                  Create Achievement for All Users
                </button>
              </div>
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="User ID for Assignment"
                  value={userIdInput}
                  onChange={(e) => setUserIdInput(e.target.value)}
                  className={`p-2 border rounded-md ${
                    isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-zinc-200'
                  }`}
                />
              </div>
            </div>
          </div>
        )}

        <div
          className={`divide-y ${
            isDark ? 'divide-zinc-800' : 'divide-zinc-200'
          }`}
        >
          {achievements.length > 0 ? (
            achievements.map((achievement) => (
              <Tilt
                key={achievement.achievementId}
                options={{
                  max: achievement.status === 'earned' ? 25 : 0,
                  perspective: 1000,
                  scale: 1.02,
                  speed: 300,
                  easing: 'cubic-bezier(.03,.98,.52,.99)',
                }}
              >
                <motion.div
                  className={`p-4 transition-colors ${
                    isDark ? 'hover:bg-zinc-800/50' : 'hover:bg-zinc-50'
                  } ${achievement.status === 'locked' ? 'opacity-50' : ''}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center">
                    <div className="badge-container">
                      <img
                        src={achievement.badgeImage}
                        alt={achievement.name}
                        className="badge-image"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/40';
                        }}
                      />
                      {achievement.status === 'earned' && (
                        <div className="shine-overlay" />
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium">{achievement.name}</p>
                      <p
                        className={`text-xs ${
                          isDark ? 'text-zinc-400' : 'text-zinc-500'
                        }`}
                      >
                        {achievement.description}
                      </p>
                      {isAdmin && (
                        <div className="mt-2 flex gap-2">
                          <p
                            className={`text-xs ${
                              isDark ? 'text-zinc-400' : 'text-zinc-500'
                            }`}
                          >
                            Users with this: {achievementStats[achievement.achievementId] || 0}
                          </p>
                          <button
                            onClick={() => handleDeleteAchievement(achievement.achievementId)}
                            className="text-xs text-red-500 hover:underline"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => handleAssignToUser(achievement.achievementId, userIdInput)}
                            className="text-xs text-emerald-500 hover:underline"
                            disabled={!userIdInput}
                          >
                            Assign to User
                          </button>
                          <button
                            onClick={() => handleAssignToAll(achievement.achievementId)}
                            className="text-xs text-emerald-500 hover:underline"
                          >
                            Assign to All Users
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </Tilt>
            ))
          ) : (
            <div
              className={`p-4 text-sm ${
                isDark ? 'text-zinc-400' : 'text-zinc-500'
              }`}
            >
              No achievements yet. Keep exploring!
            </div>
          )}
        </div>
        {error && (
          <div
            className={`p-4 text-sm text-red-500 border-t ${
              isDark ? 'border-zinc-800' : 'border-zinc-200'
            }`}
          >
            {error}
          </div>
        )}
      </div>
    </>
  );
};

export default AchievementsCard;