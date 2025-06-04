import api from './api';

export const registerAdmin = async (email, password) => {
  const response = await api.post('/admin/register', { email, password });
  if (response.data.token) {
    localStorage.setItem('adminToken', response.data.token);
    localStorage.setItem('adminUser', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const loginAdmin = async (email, password) => {
  const response = await api.post('/admin/login', { email, password });
  if (response.data.token) {
    localStorage.setItem('adminToken', response.data.token);
    localStorage.setItem('adminUser', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const logoutAdmin = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  // Optionally, call a backend logout endpoint if it does server-side session invalidation
  // await api.post('/admin/logout');
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('adminUser');
  return userStr ? JSON.parse(userStr) : null;
};

export const getToken = () => {
  return localStorage.getItem('adminToken');
};
