import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add JWT Auth token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('invtrack_token') || localStorage.getItem('invtrack_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to catch 401/403 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      const msg = error.response.data?.message || '';
      console.warn('API Auth Notice:', msg);

      if (msg.toLowerCase().includes('token') || msg.toLowerCase().includes('kadaluarsa') || msg.toLowerCase().includes('ditolak')) {
        sessionStorage.removeItem('invtrack_token');
        sessionStorage.removeItem('invtrack_user');
        localStorage.removeItem('invtrack_token');
        localStorage.removeItem('invtrack_user');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
