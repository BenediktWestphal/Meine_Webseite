import React from 'react';
import { getCurrentUser, logoutAdmin } from '../services/authService';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const user = getCurrentUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutAdmin();
    navigate('/login');
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Logout
        </button>
      </div>
      <p>Welcome, {user ? user.email : 'Admin'}!</p>
      <p>This is a protected area.</p>
      {/* Further admin functionalities will be added here */}
    </div>
  );
}

export default AdminDashboard;
