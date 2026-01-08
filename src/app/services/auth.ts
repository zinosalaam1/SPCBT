import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL;

/* ---------------- LOGIN ---------------- */
export const loginRequest = async (username: string, password: string) => {
  const res = await axios.post(`${API_BASE}/auth/login`, {
    username,
    password,
  });

  return res.data; // { token, user }
};

/* ---------------- STORAGE ---------------- */
export const saveAuth = (token: string, user: any) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

/* ---------------- SESSION ---------------- */
export const getAuthUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const getToken = () => {
  return localStorage.getItem('token');
};

/* ---------------- LOGOUT ---------------- */
export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/* ---------------- AXIOS INTERCEPTOR ---------------- */
axios.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
