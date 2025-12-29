import api from '../services/api';

export const getQuestions = async () => {
  const { data } = await api.get('/questions');
  return data.questions;
};

export const createQuestion = async (payload: any) => {
  const { data } = await api.post('/questions', payload);
  return data.question;
};

export const updateQuestion = async (id: string, payload: any) => {
  const { data } = await api.put(`/questions/${id}`, payload);
  return data.question;
};

export const deleteQuestion = async (id: string) => {
  if (!id) {
    throw new Error('Question ID is required');
  }

  await api.delete(`/questions/${id}`);
};

/* ✅ REQUIRED EXPORT */
export const getQuestionsByIds = async (ids: string[]) => {
  const { data } = await api.post('/questions/by-ids', { ids });
  return data.questions;
};
