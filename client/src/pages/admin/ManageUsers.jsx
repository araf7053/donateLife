import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import API from '../../api/axios';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get('/admin/users');
      setUsers(res.data.users || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    setActionLoading(userId);
    try {
      await API.patch(`/admin/users/${userId}/toggle-status`, { 
        is_active: !currentStatus 
      });
      setUsers(users.map(u => 
        u._id === userId ? { ...u, is_active: !currentStatus } : u
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user');
    } finally {
      setActionLoading(null);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    setActionLoading(userId);
    try {
      await API.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  // Filter and search logic
  let filteredUsers = users;
  if (filter !== 'all') {
    filteredUsers = filteredUsers.filter(u => u.role === filter);
  }
  if (searchTerm) {
    filteredUsers = filteredUsers.filter(u => 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  const stats = {
    total: users.length,
    donors: users.filter(u => u.role === 'donor').length,
    requesters: users.filter(u => u.role === 'requester').length,
    admins: users.filter(u => u.role === 'admin').length,
    active: users.filter(u => u.is_active).length,
    inactive: users.filter(u => !u.is_active).length,
  };

  const getRoleBadgeColor = (role) => {
    if (role === 'donor') return { bg: '#fee2e2', color: '#7f0000' };
    if (role === 'requester') return { bg: '#fef3c7', color: '#b45309' };
    return { bg: '#f3e8ff', color: '#8b5cf6' };
  };

  if (loading) return (
    <div className="min-h-screen" style={{ backgroundColor: '#fdf6ec' }}>
      <Navbar />
      <div className="flex justify-center items-center h-96 text-gray-500">Loading users...</div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fdf6ec' }}>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">👥 Manage Users</h1>
          <p className="text-gray-500 text-sm mt-1">View, filter, and manage all system users</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 text-sm text-red-700">
            ⚠️ {error}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total', value: stats.total, color: '#3b82f6' },
            { label: 'Donors', value: stats.donors, color: '#ef4444' },
            { label: 'Requesters', value: stats.requesters, color: '#f59e0b' },
            { label: 'Active', value: stats.active, color: '#16a34a' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-3 border-l-4" style={{ borderLeftColor: s.color }}>
              <div className="text-xs text-gray-500 mb-1">{s.label}</div>
              <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-col md:flex-row gap-4">
          {/* Search */}
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none"
            style={{ borderColor: searchTerm ? '#7f0000' : '#e5e7eb' }}
          />

          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none"
            style={{ borderColor: filter !== 'all' ? '#7f0000' : '#e5e7eb' }}
          >
            <option value="all">All Roles</option>
            <option value="donor">Donors</option>
            <option value="requester">Requesters</option>
            <option value="admin">Admins</option>
          </select>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <div className="text-3xl mb-2">👥</div>
              <div className="text-sm">No users found</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <tr>
                    <th className="text-left px-6 py-3 font-semibold text-gray-700">Name</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-700">Email</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-700">Role</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-700">Status</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-700">Joined</th>
                    <th className="text-center px-6 py-3 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    const roleBadge = getRoleBadgeColor(user.role);
                    return (
                      <tr key={user._id} style={{ borderBottom: '1px solid #e5e7eb' }} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-800">{user.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-600 text-xs">{user.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-medium px-3 py-1 rounded-full" 
                            style={{ backgroundColor: roleBadge.bg, color: roleBadge.color }}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-medium px-3 py-1 rounded-full"
                            style={{
                              backgroundColor: user.is_active ? '#dcfce7' : '#fee2e2',
                              color: user.is_active ? '#16a34a' : '#7f0000'
                            }}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => toggleUserStatus(user._id, user.is_active)}
                              disabled={actionLoading === user._id}
                              className="text-xs px-3 py-1 rounded-lg border transition disabled:opacity-50"
                              style={{
                                borderColor: user.is_active ? '#ef4444' : '#16a34a',
                                color: user.is_active ? '#ef4444' : '#16a34a',
                                backgroundColor: user.is_active ? '#fef2f2' : '#f0fdf4'
                              }}
                              title={user.is_active ? 'Deactivate' : 'Activate'}
                            >
                              {actionLoading === user._id ? '...' : (user.is_active ? '🔒' : '🔓')}
                            </button>
                            <button
                              onClick={() => deleteUser(user._id)}
                              disabled={actionLoading === user._id}
                              className="text-xs px-3 py-1 rounded-lg text-white bg-red-600 hover:bg-red-700 transition disabled:opacity-50"
                              title="Delete"
                            >
                              {actionLoading === user._id ? '...' : '🗑️'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="mt-4 text-xs text-gray-500 text-center">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
