import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="stats" element={<PublicStats />} />
          <Route path="register" element={<Registration />} />
          <Route path="patient" element={<PatientPortal />} />
          <Route path="doctor" element={<DoctorDashboard />} />
          <Route path="reception" element={<ReceptionDashboard />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="pharmacy" element={<PharmacyPortal />} />
          <Route path="e/:id" element={<EmergencyProfile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
