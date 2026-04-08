import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const RequesterDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [requestsRes, notifRes] = await Promise.all([
        API.get('/requests/my').catch(() => null),
        API.get('/notifications').catch(() => null),
      ]);
      if (requestsRes) setRequests(requestsRes.data.requests || []);
      if (notifRes) setNotifications(notifRes.data.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await API.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n =>
        n._id === id ? { ...n, is_read: true } : n
      ));
    } catch (err) {
      console.error(err);
    }
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'Pending').length,
    fulfilled: requests.filter(r => r.status === 'Fulfilled').length,
    cancelled: requests.filter(r => r.status === 'Cancelled').length,
  };

  const urgencyBadge = (urgency) => urgency === 'Critical'
    ? 'bg-red-100 text-red-700 border border-red-200'
    : 'bg-gray-100 text-gray-600 border border-gray-200';

  const statusBadge = (status) => {
    if (status === 'Pending') return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
    if (status === 'Fulfilled') return 'bg-green-100 text-green-700 border border-green-200';
    return 'bg-gray-100 text-gray-500 border border-gray-200';
  };

  if (loading) return (
    <div className="min-h-screen" style={{ backgroundColor: '#fdf6ec' }}>
      <Navbar />
      <div className="flex justify-center items-center h-96 text-gray-500">Loading...</div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fdf6ec' }}>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Welcome, {user?.name}! 👋</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your blood requests</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Requests', value: stats.total, color: '#7f0000' },
            { label: 'Pending', value: stats.pending, color: '#b45309' },
            { label: 'Fulfilled', value: stats.fulfilled, color: '#16a34a' },
            { label: 'Cancelled', value: stats.cancelled, color: '#6b7280' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-5 border-l-4" style={{ borderLeftColor: s.color }}>
              <div className="text-sm text-gray-500 mb-1">{s.label}</div>
              <div className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link
            to="/requester/create"
            className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition border-l-4"
            style={{ borderLeftColor: '#7f0000' }}
          >
            <div className="text-3xl">➕</div>
            <div>
              <div className="font-medium text-gray-800">Create New Request</div>
              <div className="text-sm text-gray-500">Post an urgent blood request</div>
            </div>
          </Link>
          <Link
            to="/requester/requests"
            className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition border-l-4"
            style={{ borderLeftColor: '#7f0000' }}
          >
            <div className="text-3xl">📋</div>
            <div>
              <div className="font-medium text-gray-800">My Requests</div>
              <div className="text-sm text-gray-500">View and manage all your requests</div>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Requests */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800">🩸 Recent Requests</h2>
              <Link to="/requester/requests" className="text-xs font-medium hover:underline" style={{ color: '#7f0000' }}>
                View all
              </Link>
            </div>

            {requests.length === 0 ? (
              <div className="text-center text-gray-400 py-8 text-sm">
                <div className="text-4xl mb-3">🩸</div>
                No requests yet.{' '}
                <Link to="/requester/create" className="underline" style={{ color: '#7f0000' }}>
                  Create one
                </Link>
              </div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto">
                {requests.slice(0, 5).map(r => (
                  <div key={r._id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium text-gray-800 text-sm">{r.patient_name}</div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(r.status)}`}>
                        {r.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="font-bold" style={{ color: '#7f0000' }}>{r.blood_group}</span>
                      <span>•</span>
                      <span>{r.location?.city}</span>
                      <span>•</span>
                      <span className={`px-2 py-0.5 rounded-full ${urgencyBadge(r.urgency)}`}>{r.urgency}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800">🔔 Notifications</h2>
              <span className="text-xs text-gray-400">{notifications.filter(n => !n.is_read).length} unread</span>
            </div>

            {notifications.length === 0 ? (
              <div className="text-center text-gray-400 py-8 text-sm">No notifications yet</div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto">
                {notifications.slice(0, 5).map(n => (
                  <div
                    key={n._id}
                    onClick={() => !n.is_read && markAsRead(n._id)}
                    className={`p-3 rounded-lg text-sm cursor-pointer transition ${
                      n.is_read ? 'bg-gray-50 text-gray-500' : 'text-white'
                    }`}
                    style={!n.is_read ? { backgroundColor: '#7f0000' } : {}}
                  >
                    <div>{n.message}</div>
                    <div className={`text-xs mt-1 ${n.is_read ? 'text-gray-400' : 'text-red-200'}`}>
                      {new Date(n.createdAt).toLocaleDateString()}
                      {!n.is_read && <span className="ml-2">• Click to mark as read</span>}
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

export default RequesterDashboard;