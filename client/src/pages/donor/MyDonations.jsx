import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import API from '../../api/axios';

const MyDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const response = await API.get('/donations/my');
      setDonations(response.data.donations || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load donation history');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen" style={{ backgroundColor: '#fdf6ec' }}>
      <Navbar />
      <div className="flex justify-center items-center h-96 text-gray-500">Loading donations...</div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fdf6ec' }}>
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">🩸 My Donations</h1>
          <p className="text-gray-500 text-sm mt-1">Track your blood donation history</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 text-sm text-red-700">
            ⚠️ {error}
          </div>
        )}

        {donations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-5xl mb-3">🩸</div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">No Donations Yet</h2>
            <p className="text-gray-500">You haven't made any donations yet. Help save lives!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-4 border-l-4" style={{ borderLeftColor: '#ef4444' }}>
                <div className="text-sm text-gray-600 mb-1">Total Donations</div>
                <div className="text-3xl font-bold" style={{ color: '#7f0000' }}>{donations.length}</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4 border-l-4" style={{ borderLeftColor: '#3b82f6' }}>
                <div className="text-sm text-gray-600 mb-1">Total Units Donated</div>
                <div className="text-3xl font-bold" style={{ color: '#3b82f6' }}>
                  {donations.reduce((sum, d) => sum + (d.units_donated || 0), 0)}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4 border-l-4" style={{ borderLeftColor: '#16a34a' }}>
                <div className="text-sm text-gray-600 mb-1">Last Donation</div>
                <div className="text-lg font-bold text-gray-800">
                  {donations.length > 0
                    ? new Date(donations[0].createdAt).toLocaleDateString()
                    : 'Never'}
                </div>
              </div>
            </div>

            {/* Donations List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{ backgroundColor: '#fdf6ec' }}>
                    <tr className="border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Request</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Units</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Location</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.map(donation => (
                      <tr key={donation._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-sm text-gray-800">
                          {new Date(donation.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="font-medium text-gray-800">
                            {donation.request_id?.patient_name || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {donation.request_id?.blood_group || 'Unknown'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-800">
                          {donation.units_donated || 1} unit
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {donation.request_id?.location?.city || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-3 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: '#dcfce7',
                              color: '#16a34a'
                            }}>
                            Completed ✅
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyDonations;
