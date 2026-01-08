import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Attach token automatically (EXCEPT login/register)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (
    token &&
    !config.url?.includes('/auth/login') &&
    !config.url?.includes('/auth/register')
  ) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Handle expired token globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

console.log('API URL:', import.meta.env.VITE_API_URL);