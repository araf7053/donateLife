import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const DonorDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, eligibilityRes, notifRes, donationRes] = await Promise.all([
        API.get('/donors/profile').catch(err => {
          console.warn('Profile fetch failed:', err.message);
          return null;
        }),
        API.get('/donors/eligibility').catch(err => {
          console.warn('Eligibility fetch failed:', err.message);
          return null;
        }),
        API.get('/notifications').catch(err => {
          console.warn('Notifications fetch failed:', err.message);
          return { data: { notifications: [] } };
        }),
        API.get('/donations/my').catch(err => {
          console.warn('Donations fetch failed:', err.message);
          return null;
        })
      ]);

      if (profileRes?.data) setProfile(profileRes.data.profile);
      if (eligibilityRes?.data) setEligibility(eligibilityRes.data);
      if (notifRes?.data) setNotifications(notifRes.data.notifications || []);
      if (donationRes?.data) setDonations(donationRes.data.donations || []);
    } catch (err) {
      console.error('Dashboard fetch error:', err.message);
      // Continue loading even if fetch fails
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

  if (loading) return (
    <div className="min-h-screen" style={{ backgroundColor: '#fdf6ec' }}>
      <Navbar />
      <div className="flex justify-center items-center h-96">
        <div className="text-gray-500">Loading...</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fdf6ec' }}>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">Here's your donor overview</p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

          {/* Eligibility */}
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4"
            style={{ borderLeftColor: eligibility?.eligible ? '#16a34a' : '#7f0000' }}>
            <div className="text-sm text-gray-500 mb-1">Eligibility Status</div>
            <div className={`text-xl font-bold ${eligibility?.eligible ? 'text-green-600' : 'text-red-800'}`}>
              {eligibility?.eligible ? '✅ Eligible' : '⏳ Not Eligible'}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {eligibility?.message}
            </div>
          </div>

          {/* Total donations */}
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4" style={{ borderLeftColor: '#7f0000' }}>
            <div className="text-sm text-gray-500 mb-1">Total Donations</div>
            <div className="text-3xl font-bold" style={{ color: '#7f0000' }}>
              {donations?.length || 0}
            </div>
            <div className="text-xs text-gray-400 mt-1">Lifetime donations</div>
          </div>

          {/* Blood group */}
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4" style={{ borderLeftColor: '#7f0000' }}>
            <div className="text-sm text-gray-500 mb-1">Blood Group</div>
            <div className="text-3xl font-bold" style={{ color: '#7f0000' }}>
              {profile?.blood_group || '—'}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {profile ? `${profile.location.city}` : 'Profile not set up'}
            </div>
          </div>
        </div>

        {/* No profile warning */}
        {!profile && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div>
              <div className="font-medium text-yellow-800">Profile Incomplete</div>
              <div className="text-sm text-yellow-600">Set up your donor profile to appear in search results</div>
            </div>
            <Link
              to="/donor/profile"
              className="text-white text-sm px-4 py-2 rounded-lg font-medium"
              style={{ backgroundColor: '#7f0000' }}
            >
              Setup Profile
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Notifications */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800">🔔 Notifications</h2>
              <span className="text-xs text-gray-400">{notifications.filter(n => !n.is_read).length} unread</span>
            </div>

            {notifications.length === 0 ? (
              <div className="text-center text-gray-400 py-8 text-sm">No notifications yet</div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
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

          {/* Recent donations */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-bold text-gray-800 mb-4">🩸 Recent Donations</h2>

            {donations?.length === 0 ? (
              <div className="text-center text-gray-400 py-8 text-sm">No donations recorded yet</div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {donations?.slice(0, 5).map(d => (
                  <div key={d._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-gray-700">
                        {d.request_id?.patient_name || 'Patient'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(d.donation_date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-sm font-bold" style={{ color: '#7f0000' }}>
                      {d.units_given} unit{d.units_given > 1 ? 's' : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <Link
            to="/donor/profile"
            className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition"
          >
            <div className="text-3xl">👤</div>
            <div>
              <div className="font-medium text-gray-800">Manage Profile</div>
              <div className="text-sm text-gray-500">Update your blood group and location</div>
            </div>
          </Link>
          <Link
            to="/donor/requests"
            className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition"
          >
            <div className="text-3xl">📋</div>
            <div>
              <div className="font-medium text-gray-800">View Requests</div>
              <div className="text-sm text-gray-500">See blood requests needing your type</div>
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default DonorDashboard;