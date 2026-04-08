import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'donor'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/auth/register', formData);
      login(res.data.token, res.data.user);
      navigate(`/${res.data.user.role}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center items-center text-white p-12" style={{ backgroundColor: '#7f0000' }}>
        <div className="text-center">
          <div className="text-8xl mb-6">🩸</div>
          <h1 className="text-4xl font-bold mb-4">DonateLife</h1>
          <p className="text-red-200 text-lg max-w-sm text-center">
            Be a hero. Register today and help save lives in your community.
          </p>
          <div className="mt-10 space-y-4 text-left w-full max-w-xs">
            {[
              { icon: '✅', text: 'Get matched with nearby patients' },
              { icon: '🔔', text: 'Real-time blood request alerts' },
              { icon: '📍', text: 'Location-based donor search' },
              { icon: '🏥', text: 'Connected to local hospitals' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg px-4 py-3" style={{ backgroundColor: '#6b0000' }}>
                <span>{item.icon}</span>
                <span className="text-sm text-red-200">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8" style={{ backgroundColor: '#fdf6ec' }}>
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <span className="text-5xl">🩸</span>
            <h1 className="text-2xl font-bold mt-2" style={{ color: '#7f0000' }}>DonateLife</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8" style={{ borderTop: '4px solid #7f0000' }}>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Create account</h2>
            <p className="text-gray-500 text-sm mb-6">Join the DonateLife community</p>

            {error && (
              <div className="border p-3 rounded-lg mb-4 text-sm flex items-center gap-2" style={{ backgroundColor: '#fff5f5', borderColor: '#7f0000', color: '#7f0000' }}>
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none transition"
                  onFocus={e => e.target.style.borderColor = '#7f0000'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none transition"
                  onFocus={e => e.target.style.borderColor = '#7f0000'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none transition"
                  onFocus={e => e.target.style.borderColor = '#7f0000'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  placeholder="Min 6 characters"
                />
              </div>

              {/* Role selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">I want to</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'donor' })}
                    className="p-3 rounded-lg border-2 text-sm font-medium transition"
                    style={{
                      borderColor: formData.role === 'donor' ? '#7f0000' : '#e5e7eb',
                      backgroundColor: formData.role === 'donor' ? '#fff5f5' : 'white',
                      color: formData.role === 'donor' ? '#7f0000' : '#6b7280'
                    }}
                  >
                    🩸 Donate Blood
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'requester' })}
                    className="p-3 rounded-lg border-2 text-sm font-medium transition"
                    style={{
                      borderColor: formData.role === 'requester' ? '#7f0000' : '#e5e7eb',
                      backgroundColor: formData.role === 'requester' ? '#fff5f5' : 'white',
                      color: formData.role === 'requester' ? '#7f0000' : '#6b7280'
                    }}
                  >
                    🏥 Request Blood
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full text-white py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                style={{ backgroundColor: '#7f0000' }}
                onMouseEnter={e => e.target.style.backgroundColor = '#6b0000'}
                onMouseLeave={e => e.target.style.backgroundColor = '#7f0000'}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Creating account...
                  </span>
                ) : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold hover:underline" style={{ color: '#7f0000' }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;