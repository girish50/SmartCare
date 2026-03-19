import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import PatientPortal from './pages/PatientPortal';
import Registration from './pages/Registration';
import DoctorDashboard from './pages/DoctorDashboard';
import ReceptionDashboard from './pages/ReceptionDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PublicStats from './pages/PublicStats';
import EmergencyProfile from './pages/EmergencyProfile';
import PharmacyPortal from './pages/PharmacyPortal';
import LoginPage from './pages/LoginPage';

// Protected route wrapper
function ProtectedRoute({ page, children }) {
  const { canAccess, role } = useAuth();
  if (!canAccess(page)) {
    // If not logged in at all, redirect to login
    if (!role) return <Navigate to="/login" replace />;
    // If logged in but wrong role, redirect to home
    return <Navigate to="/" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="stats" element={<PublicStats />} />
        <Route path="register" element={<Registration />} />
        <Route path="e/:id" element={<EmergencyProfile />} />
        <Route path="patient" element={
          <ProtectedRoute page="patient"><PatientPortal /></ProtectedRoute>
        } />
        <Route path="doctor" element={
          <ProtectedRoute page="doctor"><DoctorDashboard /></ProtectedRoute>
        } />
        <Route path="reception" element={
          <ProtectedRoute page="reception"><ReceptionDashboard /></ProtectedRoute>
        } />
        <Route path="admin" element={
          <ProtectedRoute page="admin"><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="pharmacy" element={
          <ProtectedRoute page="pharmacy"><PharmacyPortal /></ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
}

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
