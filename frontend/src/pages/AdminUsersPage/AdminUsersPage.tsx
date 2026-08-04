import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CreateUserModal } from './CreateUserModal';
import { UserRoomAssignmentPanel } from './UserRoomAssignmentPanel';

interface RoomAssignment {
  roomId: number;
  roomName: string;
}

interface UserItem {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  assignedRoomCount: number;
  assignedRooms: RoomAssignment[];
}

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get('/api/v1/admin/users');
      setUsers(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch user list');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase();
    const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
    return (
      u.username.toLowerCase().includes(query) ||
      (u.email && u.email.toLowerCase().includes(query)) ||
      fullName.includes(query)
    );
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'platform_admin':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Platform Admin
          </span>
        );
      case 'dc_manager':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            DC Manager
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
            NOC Viewer
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 ml-[var(--spacing-sidebar,240px)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">User Administration</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage system users, assign access roles, and set room visibility boundaries.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm rounded-lg shadow-lg shadow-sky-600/20 transition-all duration-150 flex items-center gap-2 cursor-pointer self-start md:self-auto"
        >
          <span className="text-lg font-bold">+</span> Create User
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by username, name, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
          />
          <svg
            className="absolute left-3 top-2.5 w-4 h-4 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Showing <span className="text-slate-200 font-semibold">{filteredUsers.length}</span> of{' '}
          <span className="text-slate-200 font-semibold">{users.length}</span> users
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 mb-6 bg-rose-500/10 border border-rose-500/30 rounded-lg text-sm text-rose-400">
          {error}
        </div>
      )}

      {/* Table Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading users from Keycloak...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Assigned Rooms</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {filteredUsers.map((user) => {
                  const isExpanded = expandedUserId === user.id;
                  const initials = (
                    (user.firstName?.[0] || user.username[0] || 'U') +
                    (user.lastName?.[0] || '')
                  ).toUpperCase();

                  return (
                    <React.Fragment key={user.id}>
                      <tr className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-sky-400 shrink-0">
                              {initials}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-100">{user.username}</div>
                              <div className="text-xs text-slate-400">
                                {user.firstName || user.lastName
                                  ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                                  : 'No name set'}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-slate-300">{user.email || '—'}</td>

                        <td className="px-6 py-4">{getRoleBadge(user.role)}</td>

                        <td className="px-6 py-4">
                          {user.role === 'platform_admin' ? (
                            <span className="text-xs text-slate-400 italic">All Rooms (Unrestricted)</span>
                          ) : (
                            <span className="text-xs font-medium text-slate-300">
                              {user.assignedRoomCount} {user.assignedRoomCount === 1 ? 'room' : 'rooms'}
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right">
                          {user.role !== 'platform_admin' && (
                            <button
                              onClick={() => setExpandedUserId(isExpanded ? null : user.id)}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-md border border-slate-700 transition-colors cursor-pointer"
                            >
                              {isExpanded ? 'Hide Rooms' : 'Manage Rooms'}
                            </button>
                          )}
                        </td>
                      </tr>

                      {isExpanded && user.role !== 'platform_admin' && (
                        <tr className="bg-slate-900/90">
                          <td colSpan={5} className="px-6 py-2">
                            <UserRoomAssignmentPanel
                              userId={user.id}
                              assignedRooms={user.assignedRooms}
                              onAssignmentsUpdated={fetchUsers}
                            />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <CreateUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUserCreated={fetchUsers}
      />
    </div>
  );
};

export default AdminUsersPage;
