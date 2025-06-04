import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Assuming backend is proxied or on the same domain/port
});

// Interceptor to add JWT token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
