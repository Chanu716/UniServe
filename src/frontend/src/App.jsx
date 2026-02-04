import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Resources from './pages/Resources';
import Bookings from './pages/Bookings';
import CreateBooking from './pages/CreateBooking';
import Profile from './pages/Profile';
import Analytics from './pages/Analytics';
import QRScanner from './pages/QRScanner';
import PrivateRoute from './components/PrivateRoute';
import { useAuthStore } from './store/authStore';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
      
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="resources" element={<Resources />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="bookings/new" element={<CreateBooking />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="qr-scanner" element={<QRScanner />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
