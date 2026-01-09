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

  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
};


/* ---------------- SESSION ---------------- */
export const getAuthUser = () => {
  const raw = localStorage.getItem('user');

  if (!raw || raw === "undefined") return null;

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error("Corrupted user data in storage:", raw);
    localStorage.removeItem('user');
    return null;
  }
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
