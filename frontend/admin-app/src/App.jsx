import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import ExhibitionsPage from './pages/ExhibitionsPage'; // Added
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate replace to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute />}>
          {/* Default admin route, e.g., dashboard */}
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="exhibitions" element={<ExhibitionsPage />} /> {/* Added */}
          {/* Add other protected admin routes here, e.g., /admin/settings */}
        </Route>

        {/* Fallback for unknown routes (optional) */}
        {/* <Route path="*" element={<div>Page Not Found</div>} /> */}
      </Routes>
    </Router>
  );
}

export default App;
