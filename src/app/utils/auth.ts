import api from '../services/api';

export const login = async (username: string, password: string) => {
  const { data } = await api.post('/auth/login', { username, password });

  localStorage.setItem('token', data.token);
  localStorage.setItem('currentUser', JSON.stringify(data.user));

  return data.user;
};

export const logout = async () => {
  await api.post('/auth/logout');
  localStorage.clear();
};

export const getCurrentUser = async () => {
  const { data } = await api.get('/auth/me');
  return data.user;
};
