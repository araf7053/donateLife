import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetchUnreadCount();
  }, [location]);

  const fetchUnreadCount = async () => {
    try {
      const res = await API.get('/notifications/unread-count');
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      console.error(err);
    }
  };

  const donorLinks = [
    { label: 'Dashboard', path: '/donor' },
    { label: 'My Profile', path: '/donor/profile' },
    { label: 'Available Requests', path: '/donor/requests' },
    { label: 'My Donations', path: '/donor/donations' },
  ];

  const requesterLinks = [
    { label: 'Dashboard', path: '/requester' },
    { label: 'Create Request', path: '/requester/create' },
    { label: 'My Requests', path: '/requester/requests' },
    { label: 'Find Donors', path: '/requester/donors' },
  ];

  const adminLinks = [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Manage Users', path: '/admin/users' },
  ];

  const links =
    user?.role === 'donor' ? donorLinks :
    user?.role === 'requester' ? requesterLinks :
    user?.role === 'admin' ? adminLinks : [];

  return (
    <nav className="text-white shadow-md" style={{ backgroundColor: '#7f0000' }}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Logo */}
        <Link to={`/${user?.role}`} className="text-xl font-bold flex items-center gap-2">
          🩸 DonateLife
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition hover:text-red-200 ${
                location.pathname === link.path ? 'border-b-2 border-white pb-0.5' : ''
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-4">

          {/* Notification bell */}
          <button
            onClick={() => navigate(`/${user?.role}`)}
            className="relative text-white hover:text-red-200 transition"
          >
            🔔
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User info */}
          <div className="text-sm text-red-200">
            {user?.name} <span className="bg-red-900 px-2 py-0.5 rounded text-xs ml-1 capitalize">{user?.role}</span>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="text-sm bg-white font-medium px-3 py-1.5 rounded-lg transition hover:bg-red-100"
            style={{ color: '#7f0000' }}
          >
            Logout
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-white text-2xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2" style={{ backgroundColor: '#6b0000' }}>
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMenuOpen(false)}
              className="block text-sm text-white py-2 border-b border-red-800"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-red-200">{user?.name}</span>
            <button
              onClick={logout}
              className="text-sm bg-white px-3 py-1.5 rounded-lg font-medium"
              style={{ color: '#7f0000' }}
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;