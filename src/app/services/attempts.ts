import api from '../services/api';

/* Create / submit an exam attempt */
export const createAttempt = async (payload: any) => {
  const { data } = await api.post('/attempts', payload);
  return data.attempt;
};

/* Logged-in student's own attempts */
export const getMyAttempts = async (studentId: string) => {
  const { data } = await api.get(`/attempts/student/${studentId}`);
  return data.attempts;
};

/* ✅ ADMIN: get attempts for a specific student */
export const getStudentAttempts = async (studentId: string) => {
  const { data } = await api.get(`/attempts/student/${studentId}`);
  return data.attempts;
};

/* ✅ ADMIN: get all attempts (dashboard overview) */
export const getAllAttempts = async () => {
  const { data } = await api.get('/attempts');
  return data.attempts;
};
