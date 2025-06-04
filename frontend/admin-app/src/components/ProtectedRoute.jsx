import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getToken } from '../services/authService';

const ProtectedRoute = ({ children }) => {
  const token = getToken();

  if (!token) {
    // User not authenticated
    return <Navigate to="/login" />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
