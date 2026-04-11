import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const AvailableRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [donorProfile, setDonorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [donatingTo, setDonatingTo] = useState(null);
  const [donateLoading, setDonateLoading] = useState(false);

  const bloodGroupLabel = donorProfile?.blood_group || user?.donor_profile?.blood_group || 'Unknown';

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const fetchRequests = async () => {
    try {
      let profile = user?.donor_profile;
      if (!profile && user?.role === 'donor') {
        const profileRes = await API.get('/donors/profile').catch(() => null);
        profile = profileRes?.data?.profile || null;
      }
      setDonorProfile(profile);

      const response = await API.get('/requests?status=Pending');
      const matchingRequests = (response.data.requests || []).filter(
        req => req.blood_group === profile?.blood_group
      );
      setRequests(matchingRequests);
    } catch (err) {
      console.error(err);
      setError('Failed to load blood requests');
    } finally {
      setLoading(false);
    }
  };

  const handleDonate = async (requestId) => {
    setDonatingTo(requestId);
    setDonateLoading(true);
    try {
      await API.post(`/donations`, {
        request_id: requestId,
        units_donated: 1
      });
      // Refresh the requests
      fetchRequests();
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to record donation');
    } finally {
      setDonateLoading(false);
      setDonatingTo(null);
    }
  };

  const getFilteredRequests = () => {
    if (filter === 'critical') return requests.filter(r => r.urgency === 'Critical');
    if (filter === 'nearby') return requests.filter(r => r.location?.city); // In a real app, use geolocation
    return requests;
  };

  const filteredRequests = getFilteredRequests();

  if (loading) return (
    <div className="min-h-screen" style={{ backgroundColor: '#fdf6ec' }}>
      <Navbar />
      <div className="flex justify-center items-center h-96 text-gray-500">Loading requests...</div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fdf6ec' }}>
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">🩸 Available Requests</h1>
          <p className="text-gray-500 text-sm mt-1">
            Blood requests matching your blood type: <span className="font-bold" style={{ color: '#7f0000' }}>
              {bloodGroupLabel}
            </span>
          </p>
                {!donorProfile && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4 text-sm text-yellow-700">
              ⚠️ Complete your donor profile to see matching requests on this page.
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 text-sm text-red-700">
            ⚠️ {error}
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { label: 'All Requests', value: 'all' },
            { label: '🚨 Critical Only', value: 'critical' },
            { label: '📍 Near Me', value: 'nearby' }
          ].map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition border"
              style={{
                borderColor: filter === f.value ? '#7f0000' : '#e5e7eb',
                backgroundColor: filter === f.value ? '#7f0000' : 'white',
                color: filter === f.value ? 'white' : '#374151'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-5xl mb-3">🩸</div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">
              {requests.length === 0 ? 'No Requests Available' : 'No Matching Requests'}
            </h2>
            <p className="text-gray-500">
              {requests.length === 0
                ? 'There are currently no blood requests available.'
                : 'No requests match your current filter. Check back soon!'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map(request => (
              <div key={request._id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition">
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {/* Left: Patient & Request Info */}
                    <div className="md:col-span-2">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">{request.patient_name}</h3>
                          <div className="text-sm text-gray-500 mt-1">
                            Requested by: {request.requester_id?.name || 'Unknown'}
                          </div>
                        </div>
                        <span className="text-xs font-medium px-3 py-1 rounded-full"
                          style={{
                            backgroundColor: request.urgency === 'Critical' ? '#fee2e2' : '#fef3c7',
                            color: request.urgency === 'Critical' ? '#7f0000' : '#b45309'
                          }}>
                          {request.urgency === 'Critical' ? '🚨' : '📋'} {request.urgency}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Blood Group:</span>
                          <div className="font-bold text-lg" style={{ color: '#7f0000' }}>
                            {request.blood_group}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Units Needed:</span>
                          <div className="font-bold text-lg text-gray-800">
                            {request.units_needed}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">📍 Location:</span>
                          <div className="font-medium text-gray-800">
                            {request.location?.hospital ? `${request.location.hospital}, ` : ''}
                            {request.location?.city}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">📞 Contact:</span>
                          <div className="font-medium text-gray-800">
                            {request.contact_no}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Action */}
                    <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-3xl mb-3">🩸</div>
                      <button
                        onClick={() => handleDonate(request._id)}
                        disabled={donateLoading && donatingTo === request._id}
                        className="w-full text-white py-2 rounded-lg font-medium transition disabled:opacity-50"
                        style={{ backgroundColor: '#7f0000' }}
                      >
                        {donateLoading && donatingTo === request._id ? 'Recording...' : 'I Can Donate'}
                      </button>
                      <div className="text-xs text-gray-500 mt-2 text-center">
                        Help save a life today
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableRequests;
