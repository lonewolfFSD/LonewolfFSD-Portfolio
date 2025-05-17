import React, { useState, useEffect } from 'react';
import { Users, Bell, Server, UserPlus, Trash2, PlusCircle } from 'lucide-react';
import DashboardLayout from './Dash Components/layout/DashboardLayout';
import StatCard from './Dash Components/StatCard';
import MembersListCard from './Dash Components/MemberListCard';
import NotificationCard from './Dash Components/NotificationCard';
import MonitoringCard from './Dash Components/MonitoringCard';
import SystemHealthCard from './Dash Components/SystemHealthCard';
import ActiveUsersCard from './Dash Components/ActiveUsersCard';
import { collection, getDocs, query, where, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

// Interface for project data
interface ProjectInput {
  id?: string; // Optional for new projects, set when fetching existing
  name: string;
  progress: number;
  startDate: string;
  deadline: string;
  price: number;
  paymentStatus: string;
  link?: string; // Discord link for the project
  [key: string]: any;
}

const AdminPanel: React.FC = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [systems, setSystems] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [phoneNo, setPhoneNo] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [currentProject, setCurrentProject] = useState<string>('');
  const [projects, setProjects] = useState<ProjectInput[]>([{
    name: '',
    progress: 0,
    startDate: '',
    deadline: '',
    price: 0,
    paymentStatus: 'Unpaid',
    link: '',
  }]);
  const [existingProjects, setExistingProjects] = useState<ProjectInput[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch members, active users, and systems
  useEffect(() => {
    const fetchData = async () => {
      const usersQuery = query(collection(db, 'users'));
      const usersSnapshot = await getDocs(usersQuery);
      const userList = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastActive: doc.data().lastActive || 'N/A',
        role: doc.data().role || 'user',
        status: doc.data().status || 'active',
      }));
      setMembers(userList);

      const activeQuery = query(collection(db, 'users'), where('status', '==', 'active'));
      const activeSnapshot = await getDocs(activeQuery);
      const activeList = activeSnapshot.docs.map(doc => ({
        name: doc.data().email.split('@')[0],
        avatar: doc.data().avatar || '',
        location: doc.data().location || 'Unknown',
        activity: 'Online',
        time: new Date().toLocaleTimeString(),
      }));
      setActiveUsers(activeList);

      setSystems([{ name: 'User System', status: 'operational', uptime: 99 }]);
    };
    fetchData();
  }, []);

  // Fetch existing projects for the selected user
  useEffect(() => {
    const fetchUserProjects = async () => {
      if (selectedUserId) {
        try {
          const projectsRef = collection(db, 'users', selectedUserId, 'projects');
          const projectsSnapshot = await getDocs(projectsRef);
          const projectsData = projectsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            startDate: doc.data().startDate?.toDate?.()
              ? doc.data().startDate.toDate().toISOString().split('T')[0]
              : '',
            deadline: doc.data().deadline?.toDate?.()
              ? doc.data().deadline.toDate().toISOString().split('T')[0]
              : '',
            progress: Number(doc.data().progress) || 0,
            price: Number(doc.data().price) || 0,
            paymentStatus: doc.data().paymentStatus || 'Unpaid',
            link: doc.data().link || '', // Fetch link field
          })) as ProjectInput[];
          setExistingProjects(projectsData);
          // Reset new projects input to avoid duplicates
          setProjects([{
            name: '',
            progress: 0,
            startDate: '',
            deadline: '',
            price: 0,
            paymentStatus: 'Unpaid',
            link: '',
          }]);
        } catch (err) {
          console.error('Error fetching projects:', err);
          setError('Failed to fetch user projects.');
          setExistingProjects([]);
        }
      } else {
        setExistingProjects([]);
        setProjects([{
          name: '',
          progress: 0,
          startDate: '',
          deadline: '',
          price: 0,
          paymentStatus: 'Unpaid',
          link: '',
        }]);
      }
    };
    fetchUserProjects();
  }, [selectedUserId]);

  // Add a new project input field
  const handleAddProject = () => {
    setProjects([...projects, {
      name: '',
      progress: 0,
      startDate: '',
      deadline: '',
      price: 0,
      paymentStatus: 'Unpaid',
      link: '',
    }]);
  };

  // Update a project field
  const handleProjectChange = (index: number, field: keyof ProjectInput, value: string | number) => {
    const updatedProjects = [...projects];
    updatedProjects[index][field] = value;
    setProjects(updatedProjects);
  };

  // Remove a project input field
  const handleRemoveProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  // Assign data to the selected user
  const handleAssignData = async () => {
    if (!selectedUserId) {
      setError('Please select a user.');
      return;
    }

    try {
      const userDocRef = doc(db, 'users', selectedUserId);
      const updateData: any = {};

      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (companyName) updateData.companyName = companyName;
      if (phoneNo) updateData.phoneNo = phoneNo;
      if (role) updateData.role = role;
      if (currentProject) updateData.currentProject = currentProject;

      await updateDoc(userDocRef, updateData);

      // Add new projects
      const projectUpdates = projects.filter(project => project.name);
      for (const project of projectUpdates) {
        const projectDocRef = await addDoc(collection(db, 'users', selectedUserId, 'projects'), {
          name: project.name,
          progress: Number(project.progress),
          startDate: project.startDate ? new Date(project.startDate) : null,
          deadline: project.deadline ? new Date(project.deadline) : null,
          price: Number(project.price) || 0,
          paymentStatus: project.paymentStatus || 'Unpaid',
          link: project.link || '', // Save link field
        });
        // Update local existing projects
        setExistingProjects(prev => [...prev, {
          id: projectDocRef.id,
          ...project,
          startDate: project.startDate || '',
          deadline: project.deadline || '',
          link: project.link || '',
        }]);
      }

      // Update members list
      setMembers(members.map(member =>
        member.id === selectedUserId
          ? {
              ...member,
              name: name || member.name,
              email: email || member.email,
              companyName: companyName || member.companyName,
              phoneNo: phoneNo || member.phoneNo,
              role: role || member.role,
              currentProject: currentProject || member.currentProject,
            }
          : member
      ));

      setSuccess('Data assigned successfully!');
      setError(null);
      setName('');
      setEmail('');
      setCompanyName('');
      setPhoneNo('');
      setRole('');
      setCurrentProject('');
      setProjects([{
        name: '',
        progress: 0,
        startDate: '',
        deadline: '',
        price: 0,
        paymentStatus: 'Unpaid',
        link: '',
      }]);
    } catch (err) {
      setError('Failed to assign data. Please try again.');
      setSuccess(null);
      console.error(err);
    }
  };

  // Delete user data
  const handleDeleteData = async () => {
    if (!selectedUserId) {
      setError('Please select a user.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this user’s data? This action cannot be undone.')) {
      return;
    }

    try {
      const userDocRef = doc(db, 'users', selectedUserId);
      await deleteDoc(userDocRef);

      setMembers(members.filter(member => member.id !== selectedUserId));
      setActiveUsers(activeUsers.filter(user => user.name !== members.find(m => m.id === selectedUserId)?.email?.split('@')[0]));
      setSelectedUserId('');
      setName('');
      setEmail('');
      setCompanyName('');
      setPhoneNo('');
      setRole('');
      setCurrentProject('');
      setProjects([{
        name: '',
        progress: 0,
        startDate: '',
        deadline: '',
        price: 0,
        paymentStatus: 'Unpaid',
        link: '',
      }]);
      setExistingProjects([]);
      setSuccess('User data deleted successfully!');
      setError(null);
    } catch (err) {
      setError('Failed to delete user data. Please try again.');
      setSuccess(null);
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6 text-white">Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Members"
          value={members.length}
          icon={<Users className="h-5 w-5" />}
          change={{ value: 12, type: 'increase' }}
        />
        <StatCard
          title="Active Members"
          value={members.filter(m => m.status === 'active').length}
          icon={<Users className="h-5 w-5" />}
          change={{ value: 8, type: 'increase' }}
        />
        <StatCard
          title="New Notifications"
          value={0}
          icon={<Bell className="h-5 w-5" />}
          change={{ value: 4, type: 'decrease' }}
        />
        <StatCard
          title="System Health"
          value={`${((systems.filter(s => s.status === 'operational').length / systems.length) * 100).toFixed(0)}%`}
          icon={<Server className="h-5 w-5" />}
          change={{ value: 2, type: 'decrease' }}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <MembersListCard members={members} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MonitoringCard
              title="Server Load"
              data={{ value: 75, unit: '%', change: 5, dataset: [60, 65, 70, 75, 80] }}
            />
            <MonitoringCard
              title="Memory Usage"
              data={{ value: 60, unit: '%', change: -3, dataset: [50, 55, 58, 60, 62] }}
            />
            <MonitoringCard
              title="Requests/min"
              data={{ value: 120, unit: '', change: 10, dataset: [100, 105, 110, 115, 120] }}
            />
            <MonitoringCard
              title="Response Time"
              data={{ value: 150, unit: 'ms', change: -5, dataset: [160, 155, 152, 150, 148] }}
            />
          </div>

          {/* Manage Client Data Section */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Manage Client Data</h2>
            
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

            <div className="space-y-4">
              {/* Select User */}
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Select Client
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-3 bg-white/5 py-2 border border-gray-800 rounded-md outline-none text-white"
                >
                  <option value="">-- Select a client --</option>
                  {members.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.email} ({member.name || 'No Name'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Existing Projects */}
              {selectedUserId && existingProjects.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Assigned Projects
                  </label>
                  <div className="space-y-2">
                    {existingProjects.map(project => (
                      <div
                        key={project.id}
                        className="p-3 bg-zinc-800 rounded-md text-white text-sm"
                      >
                        <p><strong>Name:</strong> {project.name}</p>
                        <p><strong>Progress:</strong> {project.progress}%</p>
                        <p><strong>Start Date:</strong> {project.startDate || 'N/A'}</p>
                        <p><strong>Deadline:</strong> {project.deadline || 'N/A'}</p>
                        <p><strong>Price:</strong> ₹{project.price.toLocaleString()}</p>
                        <p><strong>Payment Status:</strong> {project.paymentStatus}</p>
                        {project.link && (
                          <p>
                            <strong>Discord Link:</strong>{' '}
                            <a
                              href={project.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 underline"
                            >
                              {project.link}
                            </a>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedUserId && existingProjects.length === 0 && (
                <p className="text-sm text-gray-400">No projects assigned to this user.</p>
              )}

              {/* Basic Client Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., John Doe"
                    className="w-full px-3 py-2 bg-white/5 border border-gray-800 rounded-md outline-none text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g., john.doe@example.com"
                    className="w-full px-3 py-2 bg-white/5 border border-gray-800 rounded-md outline-none text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g., Acme Corp"
                    className="w-full px-3 py-2 bg-white/5 border border-gray-800 rounded-md outline-none text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phoneNo}
                    onChange={(e) => setPhoneNo(e.target.value)}
                    placeholder="e.g., +1234567890"
                    className="w-full px-3 py-2 bg-white/5 border border-gray-800 rounded-md outline-none text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Role
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g., admin, user, moderator"
                    className="w-full px-3 py-2 bg-white/5 border border-gray-800 rounded-md outline-none text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Current Project
                  </label>
                  <input
                    type="text"
                    value={currentProject}
                    onChange={(e) => setCurrentProject(e.target.value)}
                    placeholder="e.g., Project Alpha"
                    className="w-full px-3 py-2 bg-white/5 border border-gray-800 rounded-md outline-none text-white"
                  />
                </div>
              </div>

              {/* Projects Assignment */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Add New Projects
                </label>
                {projects.map((project, index) => (
                  <div key={index} className="mb-4 p-4 bg-zinc-800 rounded-md space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Project Name
                        </label>
                        <input
                          type="text"
                          value={project.name}
                          onChange={(e) => handleProjectChange(index, 'name', e.target.value)}
                          placeholder="e.g., Project Beta"
                          className="w-full px-3 py-2 bg-white/5 border border-gray-800 rounded-md outline-none text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Progress (%)
                        </label>
                        <input
                          type="number"
                          value={project.progress}
                          onChange={(e) => handleProjectChange(index, 'progress', Number(e.target.value))}
                          placeholder="e.g., 50"
                          min="0"
                          max="100"
                          className="w-full px-3 py-2 bg-white/5 border border-gray-800 rounded-md outline-none text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={project.startDate}
                          onChange={(e) => handleProjectChange(index, 'startDate', e.target.value)}
                          className="w-full px-3 py-2 bg-white/5 border border-gray-800 rounded-md outline-none text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Deadline
                        </label>
                        <input
                          type="date"
                          value={project.deadline}
                          onChange={(e) => handleProjectChange(index, 'deadline', e.target.value)}
                          className="w-full px-3 py-2 bg-white/5 border border-gray-800 rounded-md outline-none text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Price (INR)
                        </label>
                        <input
                          type="number"
                          value={project.price}
                          onChange={(e) => handleProjectChange(index, 'price', Number(e.target.value))}
                          placeholder="e.g., 50000"
                          min="0"
                          className="w-full px-3 py-2 bg-white/5 border border-gray-800 rounded-md outline-none text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Payment Status
                        </label>
                        <select
                          value={project.paymentStatus}
                          onChange={(e) => handleProjectChange(index, 'paymentStatus', e.target.value)}
                          className="w-full px-3 py-2 bg-white/5 border border-gray-800 rounded-md outline-none text-white"
                        >
                          <option value="Unpaid">Unpaid</option>
                          <option value="Partially Paid">Partially Paid</option>
                          <option value="Paid">Paid</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Discord Link
                        </label>
                        <input
                          type="url"
                          value={project.link || ''}
                          onChange={(e) => handleProjectChange(index, 'link', e.target.value)}
                          placeholder="e.g., https://discord.gg/xyz"
                          className="w-full px-3 py-2 bg-white/5 border border-gray-800 rounded-md outline-none text-white"
                        />
                      </div>
                    </div>
                    {projects.length > 1 && (
                      <button
                        onClick={() => handleRemoveProject(index)}
                        className="text-red-500 hover:text-red-400 text-sm"
                      >
                        Remove Project
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={handleAddProject}
                  className="flex items-center gap-2 px-3 py-1 text-sm text-blue-400 hover:text-blue-300"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add Another Project
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleAssignData}
                  className="flex items-center gap-2 px-6 py-2 bg-white font-semibold text-[15px] text-black rounded-md hover:bg-gray-100"
                >
                  <UserPlus className="h-5 w-5" />
                  Assign Data
                </button>
                <button
                  onClick={handleDeleteData}
                  className="flex items-center gap-2 px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  <Trash2 className="h-5 w-5" />
                  Delete User Data
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column */}
        <div className="space-y-6">
          <NotificationCard />
          <SystemHealthCard systems={systems} />
          <ActiveUsersCard users={activeUsers} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminPanel;