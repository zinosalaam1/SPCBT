import api from '../services/api';

export const getExams = async () => {
  const { data } = await api.get('/exams');
  return data.exams;
};

export const getActiveExams = async () => {
  const { data } = await api.get('/exams/active');
  return data.exams;
};

export const createExam = async (payload: any) => {
  const { data } = await api.post('/exams', payload);
  return data.exam;
};

export const updateExam = async (id: string, payload: any) => {
  const { data } = await api.put(`/exams/${id}`, payload);
  return data.exam;
};

export const deleteExam = async (id: string) => {
  await api.delete(`/exams/${id}`);
};
