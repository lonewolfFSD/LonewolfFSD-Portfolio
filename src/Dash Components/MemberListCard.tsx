import React, { useState, useEffect } from 'react';
import { MoreHorizontal, Search, ChevronLeft, ChevronRight, UserX, Trash2, Copy, Trash, Plus, UserPlus } from 'lucide-react';
import { Member } from '../types/index';
import { doc, updateDoc, deleteDoc, setDoc, getDoc, getDocs, collection } from 'firebase/firestore';
import { db } from '../../firebase';
import { getAuth } from 'firebase/auth';

interface MembersListCardProps {
  members: Member[];
  onMemberUpdate?: () => void;
}

const MembersListCard: React.FC<MembersListCardProps> = ({ members, onMemberUpdate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({ uid: '', name: '', email: '', role: 'user' });
  const [formError, setFormError] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const itemsPerPage = 5;

  // Fetch current user's role
  useEffect(() => {
    const fetchUserRole = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role || 'user');
          } else {
            setUserRole('user');
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          setUserRole('user');
        }
      }
    };
    fetchUserRole();
  }, []);

  // Filter members based on search query
  const filteredMembers = members.filter(member => {
    const name = member.name || (member.email?.split('@')[0] || 'Unknown');
    const email = member.email || 'No email';
    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Suspend account
  const suspendAccount = async (uid: string) => {
    const member = filteredMembers.find(m => m.id === uid);
    const email = member?.email || 'Unknown';
    if (!window.confirm(`Suspend ${email}? This will mark their account as suspended.`)) {
      return;
    }

    try {
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        alert(`Error: No user found with UID ${uid}.`);
        return;
      }

      await updateDoc(userRef, { status: 'suspended' });
      alert(`${email} has been suspended successfully.`);
      if (typeof onMemberUpdate === 'function') {
        onMemberUpdate();
      }
    } catch (error) {
      console.error('Error suspending account:', error);
      alert(`Failed to suspend ${email}. ${error.message.includes('permission-denied') ? 'You must be an admin to perform this action.' : error.message}`);
    }
  };

  // Delete account
  const deleteAccount = async (uid: string) => {
    const member = filteredMembers.find(m => m.id === uid);
    const email = member?.email || 'Unknown';
    if (!window.confirm(`Permanently delete ${email}? This action cannot be undone.`)) {
      return;
    }

    try {
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        alert(`Error: No user found with UID ${uid}.`);
        return;
      }

      await deleteDoc(userRef);
      alert(`${email} has been deleted successfully.`);
      if (typeof onMemberUpdate === 'function') {
        onMemberUpdate();
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert(`Failed to delete ${email}. ${error.message.includes('permission-denied') ? 'You must be an admin to perform this action.' : error.message}`);
    }
  };

  // Copy UID to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('UID copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy: ', err);
      alert('Failed to copy UID.');
    });
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewMember(prev => ({ ...prev, [name]: value }));
  };

  // Add new member
  const addMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newMember.uid || !newMember.email || !newMember.name) {
      setFormError('UID, name, and email are required.');
      return;
    }

    try {
      const userRef = doc(db, 'users', newMember.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        setFormError('This UID is already in use.');
        return;
      }

      await setDoc(userRef, {
        name: newMember.name,
        email: newMember.email,
        role: newMember.role,
        status: 'active',
        lastActive: new Date().toISOString(),
      });
      alert('Member added successfully!');
      setNewMember({ uid: '', name: '', email: '', role: 'user' });
      setIsAddModalOpen(false);
      if (typeof onMemberUpdate === 'function') {
        onMemberUpdate();
      }
    } catch (error) {
      console.error('Error adding member:', error);
      setFormError(`Failed to add member: ${error.message.includes('permission-denied') ? 'You must be an admin to add members.' : error.message}`);
    }
  };

  const isAdmin = userRole === 'admin';

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">All Members</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              disabled={!isAdmin}
              className={`p-2 rounded-md transition-colors ${isAdmin ? 'hover:bg-zinc-100 dark:hover:bg-zinc-800' : 'opacity-50 cursor-not-allowed'}`}
              title={isAdmin ? 'Add new member' : 'Admin access required'}
            >
              <Plus size={18} />
            </button>
            <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search members..."
            className="w-full bg-zinc-100 dark:bg-zinc-800 pl-10 pr-4 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Add Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-hidden flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Add New Member</h3>
            <form onSubmit={addMember}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">UID</label>
                <input
                  type="text"
                  name="uid"
                  value={newMember.uid}
                  onChange={handleInputChange}
                  className="w-full mt-1 bg-zinc-100 dark:bg-zinc-700 p-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
                  placeholder="Enter unique UID"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Name</label>
                <input
                  type="text"
                  name="name"
                  value={newMember.name}
                  onChange={handleInputChange}
                  className="w-full mt-1 bg-zinc-100 dark:bg-zinc-700 p-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
                  placeholder="Enter name"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</label>
                <input
                  type="email"
                  name="email"
                  value={newMember.email}
                  onChange={handleInputChange}
                  className="w-full mt-1 bg-zinc-100 dark:bg-zinc-700 p-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
                  placeholder="Enter email"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Role</label>
                <select
                  name="role"
                  value={newMember.role}
                  onChange={handleInputChange}
                  className="w-full mt-1 bg-zinc-100 dark:bg-zinc-700 p-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderator</option>
                </select>
              </div>
              {formError && (
                <p className="text-sm text-red-500 mb-4">{formError}</p>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 flex gap-2 py-2.5 text-[14px] bg-zinc-800 dark:bg-zinc-700 text-white rounded-md hover:bg-zinc-700 dark:hover:bg-zinc-600"
                >
                  <UserPlus size={18} strokeWidth={3} className='mt-[1px]' />
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-800">
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Member</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Last Active</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">UID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {paginatedMembers.length > 0 ? (
              paginatedMembers.map((member) => (
                <tr key={member.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                        {member.avatar ? (
                          <img src={member.avatar} alt={member.name || member.email} className="h-10 w-10 rounded-full" />
                        ) : (
                          <span className="text-sm font-medium">{(member.name || member.email?.split('@')[0] || 'U').charAt(0)}</span>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium">{member.name || member.email?.split('@')[0] || 'Unknown'}</div>
                        <div className="text-sm text-zinc-500 dark:text-zinc-400">{member.email || 'No email'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      member.status === 'active' 
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400' 
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300'
                    }`}>
                      {member.status || 'unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{member.role || 'user'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">{member.lastActive || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                    {member.id}
                    <button
                      onClick={() => copyToClipboard(member.id)}
                      className="ml-2.5 mb-1.5 text-zinc-500 cursor-custom-pointer hover:bg-zinc-400/10 p-1.5 rounded-md dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
                      title="Copy UID"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </td>          
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  No members found matching your search
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-6 py-4 flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800">
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredMembers.length)}</span> of <span className="font-medium">{filteredMembers.length}</span> results
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembersListCard;