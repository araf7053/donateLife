import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
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
      const res = await API.post('/auth/login', formData);
      login(res.data.token, res.data.user);
      try {
        const profileRes = await API.get('/auth/me');
        login(res.data.token, profileRes.data.user);
      } catch (profileErr) {
        console.warn('Failed to refresh user after login:', profileErr.message || profileErr);
      }
      navigate(`/${res.data.user.role}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
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
            Every drop counts. Join thousands of donors saving lives every day.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-6 text-center">
            <div className="rounded-lg p-4" style={{ backgroundColor: '#6b0000' }}>
              <div className="text-2xl font-bold">500+</div>
              <div className="text-red-300 text-sm">Donors</div>
            </div>
            <div className="rounded-lg p-4" style={{ backgroundColor: '#6b0000' }}>
              <div className="text-2xl font-bold">300+</div>
              <div className="text-red-300 text-sm">Lives Saved</div>
            </div>
            <div className="rounded-lg p-4" style={{ backgroundColor: '#6b0000' }}>
              <div className="text-2xl font-bold">8</div>
              <div className="text-red-300 text-sm">Blood Types</div>
            </div>
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
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Welcome back</h2>
            <p className="text-gray-500 text-sm mb-6">Sign in to your account</p>

            {error && (
              <div className="border p-3 rounded-lg mb-4 text-sm flex items-center gap-2" style={{ backgroundColor: '#fff5f5', borderColor: '#7f0000', color: '#7f0000' }}>
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none transition"
                  style={{ focusBorderColor: '#7f0000' }}
                  onFocus={e => e.target.style.borderColor = '#7f0000'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none transition"
                  onFocus={e => e.target.style.borderColor = '#7f0000'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full text-white py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
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
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold hover:underline" style={{ color: '#7f0000' }}>
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;