import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import API from '../../api/axios';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const CreateRequest = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    patient_name: '',
    blood_group: 'A+',
    units_needed: 1,
    city: '',
    hospital: '',
    urgency: 'Normal',
    contact_no: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await API.post('/requests', {
        patient_name: formData.patient_name,
        blood_group: formData.blood_group,
        units_needed: Number(formData.units_needed),
        city: formData.city,
        hospital: formData.hospital,
        urgency: formData.urgency,
        contact_no: formData.contact_no,
      });
      console.log('Request created successfully:', response.data);
      navigate('/requester/requests');
    } catch (err) {
      console.error('Request creation error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fdf6ec' }}>
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">➕ Create Blood Request</h1>
          <p className="text-gray-500 text-sm mt-1">Fill in the details to post an urgent blood request</p>
        </div>

        {error && (
          <div className="border p-3 rounded-lg mb-4 text-sm flex items-center gap-2"
            style={{ backgroundColor: '#fff5f5', borderColor: '#7f0000', color: '#7f0000' }}>
            ⚠️ {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm p-6" style={{ borderTop: '4px solid #7f0000' }}>
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Patient Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
              <input
                type="text"
                name="patient_name"
                value={formData.patient_name}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none transition"
                onFocus={e => e.target.style.borderColor = '#7f0000'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                placeholder="e.g. John Doe"
              />
            </div>

            {/* Blood Group */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group Needed</label>
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
                      color: formData.blood_group === bg ? 'white' : '#374151',
                    }}
                  >
                    {bg}
                  </button>
                ))}
              </div>
            </div>

            {/* Units & Urgency */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Units Needed</label>
                <input
                  type="number"
                  name="units_needed"
                  value={formData.units_needed}
                  onChange={handleChange}
                  min={1}
                  required
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none transition"
                  onFocus={e => e.target.style.borderColor = '#7f0000'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Urgency Level</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Normal', 'Critical'].map(u => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setFormData({ ...formData, urgency: u })}
                      className="py-3 rounded-lg text-sm font-medium border-2 transition"
                      style={{
                        borderColor: formData.urgency === u ? (u === 'Critical' ? '#7f0000' : '#15803d') : '#e5e7eb',
                        backgroundColor: formData.urgency === u ? (u === 'Critical' ? '#7f0000' : '#15803d') : 'white',
                        color: formData.urgency === u ? 'white' : '#374151',
                      }}
                    >
                      {u === 'Critical' ? '🚨' : '📋'} {u}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* City & Hospital */}
            <div className="grid grid-cols-2 gap-4">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Name</label>
                <input
                  type="text"
                  name="hospital"
                  value={formData.hospital}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none transition"
                  onFocus={e => e.target.style.borderColor = '#7f0000'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  placeholder="e.g. Max Hospital"
                />
              </div>
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

            {/* Summary preview */}
            {formData.patient_name && formData.city && (
              <div className="rounded-lg p-4 text-sm" style={{ backgroundColor: '#fff5f5', borderLeft: '4px solid #7f0000' }}>
                <div className="font-medium text-gray-700 mb-1">Request Summary</div>
                <div className="text-gray-600 space-y-0.5">
                  <div>👤 <strong>{formData.patient_name}</strong> needs <strong>{formData.blood_group}</strong> ({formData.units_needed} unit{formData.units_needed > 1 ? 's' : ''})</div>
                  <div>📍 {formData.hospital ? `${formData.hospital}, ` : ''}{formData.city}</div>
                  <div>⚡ Urgency: <span style={{ color: formData.urgency === 'Critical' ? '#7f0000' : '#15803d' }} className="font-medium">{formData.urgency}</span></div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/requester')}
                className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 text-white py-3 rounded-lg font-medium transition disabled:opacity-50"
                style={{ backgroundColor: '#7f0000' }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Submitting...
                  </span>
                ) : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRequest;