import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDonors: 0,
    totalRequesters: 0,
    totalAdmins: 0,
    totalRequests: 0,
    pendingRequests: 0,
    fulfilledRequests: 0,
    totalDonations: 0,
    recentUsers: [],
    recentRequests: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [statsRes, usersRes, requestsRes, donationsRes] = await Promise.all([
        API.get('/admin/stats').catch(err => {
          console.warn('Stats fetch failed:', err.message);
          return { data: {} };
        }),
        API.get('/admin/users').catch(err => {
          console.warn('Users fetch failed:', err.message);
          return { data: { users: [] } };
        }),
        API.get('/requests').catch(err => {
          console.warn('Requests fetch failed:', err.message);
          return { data: { requests: [] } };
        }),
        API.get('/donations').catch(err => {
          console.warn('Donations fetch failed:', err.message);
          return { data: { donations: [] } };
        })
      ]);

      const users = usersRes?.data?.users || [];
      const requests = requestsRes?.data?.requests || [];
      const donations = donationsRes?.data?.donations || [];
      const dashStats = statsRes?.data?.stats || {};

      setStats({
        totalUsers: dashStats.totalUsers || users.length,
        totalDonors: dashStats.totalDonors || users.filter(u => u.role === 'donor').length,
        totalRequesters: dashStats.totalRequesters || users.filter(u => u.role === 'requester').length,
        totalAdmins: users.filter(u => u.role === 'admin').length,
        totalRequests: dashStats.totalRequests || requests.length,
        pendingRequests: dashStats.pendingRequests || requests.filter(r => r.status === 'Pending').length,
        fulfilledRequests: dashStats.fulfilledRequests || requests.filter(r => r.status === 'Fulfilled').length,
        totalDonations: dashStats.totalDonations || donations.length,
        recentUsers: users.slice(0, 5),
        recentRequests: requests.slice(0, 5)
      });
    } catch (err) {
      console.error('Admin dashboard fetch error:', err.message);
      setError('Failed to load admin stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen" style={{ backgroundColor: '#fdf6ec' }}>
      <Navbar />
      <div className="flex justify-center items-center h-96 text-gray-500">Loading dashboard...</div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fdf6ec' }}>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">📊 Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Manage users, requests, and system metrics</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 text-sm text-red-700">
            ⚠️ {error}
          </div>
        )}

        {/* Key Metrics - Top Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users', value: stats.totalUsers, color: '#3b82f6', icon: '👥' },
            { label: 'Active Donors', value: stats.totalDonors, color: '#ef4444', icon: '🩸' },
            { label: 'Requesters', value: stats.totalRequesters, color: '#f59e0b', icon: '🏥' },
            { label: 'Admins', value: stats.totalAdmins, color: '#8b5cf6', icon: '⚙️' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-4 border-l-4" style={{ borderLeftColor: stat.color }}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl">{stat.icon}</div>
                <div className="text-xs text-gray-400 font-medium">this month</div>
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
              <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Blood Requests Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Requests', value: stats.totalRequests, color: '#7f0000', icon: '📋' },
            { label: 'Pending', value: stats.pendingRequests, color: '#b45309', icon: '⏳' },
            { label: 'Fulfilled', value: stats.fulfilledRequests, color: '#16a34a', icon: '✅' },
          ].map((metric, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-5 border-l-4" style={{ borderLeftColor: metric.color }}>
              <div className="text-2xl mb-2">{metric.icon}</div>
              <div className="text-sm text-gray-600 mb-1">{metric.label}</div>
              <div className="text-3xl font-bold" style={{ color: metric.color }}>{metric.value}</div>
            </div>
          ))}
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* User Management */}
          <Link
            to="/admin/users"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-lg transition border-l-4"
            style={{ borderLeftColor: '#3b82f6', cursor: 'pointer' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl mb-2">👥</div>
                <div className="font-bold text-gray-800">Manage Users</div>
                <div className="text-sm text-gray-500 mt-1">View and manage all users</div>
              </div>
              <div className="text-3xl text-gray-300">→</div>
            </div>
          </Link>

          {/* Blood Requests */}
          <Link
            to="/requester"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-lg transition border-l-4"
            style={{ borderLeftColor: '#7f0000', cursor: 'pointer' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl mb-2">📋</div>
                <div className="font-bold text-gray-800">View All Requests</div>
                <div className="text-sm text-gray-500 mt-1">Monitor blood requests</div>
              </div>
              <div className="text-3xl text-gray-300">→</div>
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>👥</span> Recent Users
            </h2>
            {stats.recentUsers.length === 0 ? (
              <div className="text-center text-gray-400 py-8 text-sm">No users yet</div>
            ) : (
              <div className="space-y-3">
                {stats.recentUsers.map(user => (
                  <div key={user._id} className="pb-3 border-b border-gray-100 last:border-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-800">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                      <span className="text-xs font-medium px-2 py-1 rounded-full" 
                        style={{
                          backgroundColor: user.role === 'donor' ? '#fee2e2' : user.role === 'requester' ? '#fef3c7' : '#f3e8ff',
                          color: user.role === 'donor' ? '#7f0000' : user.role === 'requester' ? '#b45309' : '#8b5cf6'
                        }}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Requests */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>📋</span> Recent Requests
            </h2>
            {stats.recentRequests.length === 0 ? (
              <div className="text-center text-gray-400 py-8 text-sm">No requests yet</div>
            ) : (
              <div className="space-y-3">
                {stats.recentRequests.map(req => (
                  <div key={req._id} className="pb-3 border-b border-gray-100 last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium text-gray-800">{req.patient_name}</div>
                      <span className="text-xs font-medium px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: req.status === 'Pending' ? '#fef3c7' : req.status === 'Fulfilled' ? '#dcfce7' : '#f3f4f6',
                          color: req.status === 'Pending' ? '#b45309' : req.status === 'Fulfilled' ? '#16a34a' : '#6b7280'
                        }}>
                        {req.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <span className="font-bold" style={{ color: '#7f0000' }}>{req.blood_group}</span>
                      <span>•</span>
                      <span>{req.location?.city || 'N/A'}</span>
                      <span>•</span>
                      <span>{req.units_needed} unit(s)</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
