import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import API from '../../api/axios';

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await API.get('/requests/my');
      setRequests(res.data.requests || []);
    } catch (err) {
      setError('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return;
    setDeletingId(id);
    try {
      await API.delete(`/requests/${id}`);
      setRequests(requests.filter(r => r._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete request');
    } finally {
      setDeletingId(null);
    }
  };

  const statusBadge = (status) => {
    if (status === 'Pending') return { bg: '#fef9c3', color: '#92400e', border: '#fde68a' };
    if (status === 'Fulfilled') return { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' };
    return { bg: '#f9fafb', color: '#6b7280', border: '#e5e7eb' };
  };

  const urgencyBadge = (urgency) => urgency === 'Critical'
    ? { bg: '#fff5f5', color: '#7f0000', border: '#fecaca' }
    : { bg: '#f9fafb', color: '#6b7280', border: '#e5e7eb' };

  const filtered = filter === 'All' ? requests : requests.filter(r => r.status === filter);

  if (loading) return (
    <div className="min-h-screen" style={{ backgroundColor: '#fdf6ec' }}>
      <Navbar />
      <div className="flex justify-center items-center h-96 text-gray-500">Loading...</div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fdf6ec' }}>
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">📋 My Requests</h1>
            <p className="text-gray-500 text-sm mt-1">Track and manage all your blood requests</p>
          </div>
          <Link
            to="/requester/create"
            className="text-white text-sm px-4 py-2 rounded-lg font-medium transition hover:opacity-90"
            style={{ backgroundColor: '#7f0000' }}
          >
            + New Request
          </Link>
        </div>

        {error && (
          <div className="border p-3 rounded-lg mb-4 text-sm"
            style={{ backgroundColor: '#fff5f5', borderColor: '#7f0000', color: '#7f0000' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['All', 'Pending', 'Fulfilled', 'Cancelled'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-1.5 rounded-full text-sm font-medium border transition"
              style={{
                backgroundColor: filter === f ? '#7f0000' : 'white',
                color: filter === f ? 'white' : '#6b7280',
                borderColor: filter === f ? '#7f0000' : '#e5e7eb',
              }}
            >
              {f}
              <span className="ml-1 text-xs opacity-70">
                ({f === 'All' ? requests.length : requests.filter(r => r.status === f).length})
              </span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="text-5xl mb-4">🩸</div>
            <div className="text-gray-500 font-medium">No {filter !== 'All' ? filter.toLowerCase() : ''} requests found</div>
            <div className="text-sm text-gray-400 mt-1 mb-4">
              {filter === 'All' ? "You haven't created any blood requests yet" : `No requests with status "${filter}"`}
            </div>
            {filter === 'All' && (
              <Link
                to="/requester/create"
                className="inline-block text-white text-sm px-5 py-2 rounded-lg font-medium"
                style={{ backgroundColor: '#7f0000' }}
              >
                Create First Request
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(r => {
              const sBadge = statusBadge(r.status);
              const uBadge = urgencyBadge(r.urgency);
              return (
                <div key={r._id} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition">
                  <div className="flex items-start justify-between gap-4">

                    {/* Left: blood group circle + info */}
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                        style={{ backgroundColor: '#7f0000' }}>
                        {r.blood_group}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800 text-base">{r.patient_name}</div>
                        <div className="text-sm text-gray-500 mt-0.5">
                          📍 {r.location?.hospital ? `${r.location.hospital}, ` : ''}{r.location?.city}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium border"
                            style={{ backgroundColor: sBadge.bg, color: sBadge.color, borderColor: sBadge.border }}>
                            {r.status}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium border"
                            style={{ backgroundColor: uBadge.bg, color: uBadge.color, borderColor: uBadge.border }}>
                            {r.urgency === 'Critical' ? '🚨' : '📋'} {r.urgency}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200 font-medium">
                            {r.units_needed} unit{r.units_needed > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: date + delete */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <div className="text-xs text-gray-400">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </div>
                      {r.status === 'Pending' && (
                        <button
                          onClick={() => handleDelete(r._id)}
                          disabled={deletingId === r._id}
                          className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                        >
                          {deletingId === r._id ? 'Deleting...' : 'Delete'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Contact */}
                  {r.contact_no && (
                    <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                      📞 Contact: <span className="font-medium text-gray-700">{r.contact_no}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRequests;