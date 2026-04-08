import { useState } from 'react';
import Navbar from '../../components/Navbar';
import API from '../../api/axios';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const SearchDonors = () => {
  const [filters, setFilters] = useState({
    city: '',
    blood_group: '',
    maxDistance: 10
  });
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams({
        city: filters.city,
        maxDistance: filters.maxDistance,
        ...(filters.blood_group && { blood_group: filters.blood_group })
      });
      const res = await API.get(`/donors/search?${params}`);
      setDonors(res.data.donors);
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fdf6ec' }}>
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">🔍 Search Donors</h1>
          <p className="text-gray-500 text-sm mt-1">Find eligible blood donors near you</p>
        </div>

        {/* Search form */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6" style={{ borderTop: '4px solid #7f0000' }}>
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                name="city"
                value={filters.city}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none transition"
                onFocus={e => e.target.style.borderColor = '#7f0000'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                placeholder="e.g. Noida"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
              <select
                name="blood_group"
                value={filters.blood_group}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none transition"
              >
                <option value="">Any</option>
                {BLOOD_GROUPS.map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Distance (km)</label>
              <select
                name="maxDistance"
                value={filters.maxDistance}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none transition"
              >
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={25}>25 km</option>
                <option value={50}>50 km</option>
                <option value={100}>100 km</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full text-white py-3 rounded-lg font-medium transition disabled:opacity-50"
                style={{ backgroundColor: '#7f0000' }}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>
        </div>

        {/* Error */}
        {error && (
          <div className="border p-3 rounded-lg mb-4 text-sm" style={{ backgroundColor: '#fff5f5', borderColor: '#7f0000', color: '#7f0000' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Results */}
        {searched && !loading && (
          <div>
            <div className="text-sm text-gray-500 mb-3">
              Found <span className="font-bold" style={{ color: '#7f0000' }}>{donors.length}</span> eligible donor{donors.length !== 1 ? 's' : ''}
            </div>

            {donors.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <div className="text-5xl mb-4">🔍</div>
                <div className="text-gray-500">No eligible donors found in this area</div>
                <div className="text-sm text-gray-400 mt-1">Try increasing the search distance</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {donors.map(donor => (
                  <div key={donor._id} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: '#7f0000' }}>
                        {donor.blood_group}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{donor.user_id?.name}</div>
                        <div className="text-xs text-gray-400">{donor.location?.city}</div>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Contact</span>
                        <span className="font-medium text-gray-700">{donor.contact_no}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Last Donation</span>
                        <span className="font-medium text-gray-700">
                          {donor.last_donation ? new Date(donor.last_donation).toLocaleDateString() : 'Never'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Status</span>
                        <span className="text-green-600 font-medium">✅ Eligible</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchDonors;