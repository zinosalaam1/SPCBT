import api from '../services/api';

export const getUsers = async () => {
  const { data } = await api.get('/users');
  return data.users;
};

export const createUser = async (payload: any) => {
  const { data } = await api.post('/users', payload);
  return data.user;
};

export const deleteUser = async (id: string) => {
  await api.delete(`/users/${id}`);
};
