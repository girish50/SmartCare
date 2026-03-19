import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ShieldAlert, LogIn, ArrowLeft } from 'lucide-react';
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

// Role labels for disclaimer
const ROLE_NAMES = {
  patient: 'Patient Portal',
  reception: 'Reception Desk',
  doctor: 'Doctor Console',
  admin: 'Admin Command',
  pharmacy: 'Smart Pharmacy',
};

const REQUIRED_ROLES = {
  patient: 'Patient',
  reception: 'Staff or Admin',
  doctor: 'Doctor or Admin',
  admin: 'Admin',
  pharmacy: 'Staff or Admin',
};

// Disclaimer page shown when user doesn't have access
function AccessDenied({ page }) {
  const { role } = useAuth();
  const pageName = ROLE_NAMES[page] || page;
  const neededRole = REQUIRED_ROLES[page] || 'appropriate';

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-xl border border-slate-100 text-center">
        <div className="inline-flex p-4 bg-amber-50 rounded-2xl mb-6">
          <ShieldAlert className="text-amber-500" size={40} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-3">Access Restricted</h2>
        <p className="text-slate-500 mb-6 leading-relaxed">
          The <strong className="text-slate-900">{pageName}</strong> requires a <strong className="text-indigo-600">{neededRole}</strong> login to access.
          {role ? (
            <span> You are currently logged in as <strong className="text-rose-600 uppercase">{role}</strong>.</span>
          ) : (
            <span> Please login with the correct role to continue.</span>
          )}
        </p>
        <div className="flex flex-col gap-3">
          {!role ? (
            <Link to="/login" className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
              <LogIn size={18} /> Login to Continue
            </Link>
          ) : (
            <Link to="/login" className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
              <LogIn size={18} /> Switch Account
            </Link>
          )}
          <Link to="/" className="w-full bg-slate-50 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

// Protected route wrapper — shows disclaimer instead of silent redirect
function ProtectedRoute({ page, children }) {
  const { canAccess } = useAuth();
  if (!canAccess(page)) {
    return <AccessDenied page={page} />;
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
