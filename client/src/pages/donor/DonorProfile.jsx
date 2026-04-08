import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import API from '../../api/axios';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const DonorProfile = () => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    blood_group: 'A+',
    city: '',
    pincode: '',
    contact_no: '',
    is_available: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get('/donors/profile');
      setProfile(res.data.profile);
      setFormData({
        blood_group: res.data.profile.blood_group,
        city: res.data.profile.location.city,
        pincode: res.data.profile.location.pincode,
        contact_no: res.data.profile.contact_no,
        is_available: res.data.profile.is_available
      });
    } catch (err) {
      // No profile yet
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSaving(true);
    try {
      if (profile) {
        await API.put('/donors/profile', formData);
        setMessage('Profile updated successfully!');
      } else {
        await API.post('/donors/profile', formData);
        setMessage('Profile created successfully!');
      }
      setIsEditing(false);
      fetchProfile();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
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

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">👤 Donor Profile</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your donor information</p>
        </div>

        {/* Success/Error messages */}
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg mb-4 text-sm">
            ✅ {message}
          </div>
        )}
        {error && (
          <div className="border p-3 rounded-lg mb-4 text-sm" style={{ backgroundColor: '#fff5f5', borderColor: '#7f0000', color: '#7f0000' }}>
            ⚠️ {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm p-6" style={{ borderTop: '4px solid #7f0000' }}>

          {/* Profile exists and not editing — show view mode */}
          {profile && !isEditing ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                    style={{ backgroundColor: '#7f0000' }}>
                    {profile.blood_group}
                  </div>
                  <div>
                    <div className="font-bold text-gray-800 text-lg">{profile.user_id?.name}</div>
                    <div className="text-sm text-gray-500">{profile.user_id?.email}</div>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-white text-sm px-4 py-2 rounded-lg font-medium"
                  style={{ backgroundColor: '#7f0000' }}
                >
                  Edit Profile
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Blood Group', value: profile.blood_group },
                  { label: 'City', value: profile.location.city },
                  { label: 'Pincode', value: profile.location.pincode },
                  { label: 'Contact', value: profile.contact_no },
                  { label: 'Last Donation', value: profile.last_donation ? new Date(profile.last_donation).toLocaleDateString() : 'Never' },
                  { label: 'Availability', value: profile.is_available ? '✅ Available' : '❌ Not Available' },
                ].map((item, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">{item.label}</div>
                    <div className="font-medium text-gray-800">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

          ) : (
            // Form mode
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-bold text-gray-800">
                  {profile ? 'Edit Profile' : 'Create Your Profile'}
                </h2>
                {profile && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {/* Blood group */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                <div className="grid grid-cols-4 gap-2">
                  {BLOOD_GROUPS.map(bg => (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => setFormData({ ...formData, blood_group: bg })}
                      className="py-2 rounded-lg text-sm font-bold border-2 transition"
                      style={{
                        borderColor: formData.blood_group === bg ? '#7f0000' : '#e5e7eb',
                        backgroundColor: formData.blood_group === bg ? '#7f0000' : 'white',
                        color: formData.blood_group === bg ? 'white' : '#374151'
                      }}
                    >
                      {bg}
                    </button>
                  ))}
                </div>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none transition"
                  onFocus={e => e.target.style.borderColor = '#7f0000'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  placeholder="e.g. Noida"
                />
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none transition"
                  onFocus={e => e.target.style.borderColor = '#7f0000'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  placeholder="e.g. 201301"
                />
              </div>

              {/* Contact */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                <input
                  type="text"
                  name="contact_no"
                  value={formData.contact_no}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none transition"
                  onFocus={e => e.target.style.borderColor = '#7f0000'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  placeholder="e.g. 9876543210"
                />
              </div>

              {/* Availability */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  name="is_available"
                  id="is_available"
                  checked={formData.is_available}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <label htmlFor="is_available" className="text-sm font-medium text-gray-700">
                  I am available to donate blood
                </label>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full text-white py-3 rounded-lg font-medium transition disabled:opacity-50"
                style={{ backgroundColor: '#7f0000' }}
              >
                {saving ? 'Saving...' : profile ? 'Update Profile' : 'Create Profile'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonorProfile;