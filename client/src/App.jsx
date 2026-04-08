import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Donor pages
import DonorDashboard from './pages/donor/DonorDashboard';
import DonorProfile from './pages/donor/DonorProfile';
import SearchDonors from './pages/donor/SearchDonors';

// Requester pages
import RequesterDashboard from './pages/requester/RequesterDashboard';
import CreateRequest from './pages/requester/CreateRequest';
import MyRequests from './pages/requester/MyRequests';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';

// Protected route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/login" />;

  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to={`/${user.role}`} />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to={`/${user.role}`} />} />

      {/* Donor routes */}
      <Route path="/donor" element={
        <ProtectedRoute allowedRoles={['donor']}>
          <DonorDashboard />
        </ProtectedRoute>
      } />
      <Route path="/donor/profile" element={
        <ProtectedRoute allowedRoles={['donor']}>
          <DonorProfile />
        </ProtectedRoute>
      } />
      <Route path="/donor/search" element={
        <ProtectedRoute allowedRoles={['donor']}>
          <SearchDonors />
        </ProtectedRoute>
      } />

      {/* Requester routes */}
      <Route path="/requester" element={
        <ProtectedRoute allowedRoles={['requester']}>
          <RequesterDashboard />
        </ProtectedRoute>
      } />
      <Route path="/requester/create" element={
        <ProtectedRoute allowedRoles={['requester']}>
          <CreateRequest />
        </ProtectedRoute>
      } />
      <Route path="/requester/requests" element={
        <ProtectedRoute allowedRoles={['requester']}>
          <MyRequests />
        </ProtectedRoute>
      } />

      {/* Admin routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <ManageUsers />
        </ProtectedRoute>
      } />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;