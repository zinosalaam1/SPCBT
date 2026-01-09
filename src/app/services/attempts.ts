import api from './api';

/* ===============================
   Student submits an exam
================================ */
export const createAttempt = async (payload: any) => {
  const { data } = await api.post('/attempts', payload);
  return data.attempt;
};

/* ===============================
   STUDENT: get own attempts
   (JWT-based)
================================ */
export const getMyAttempts = async () => {
  const { data } = await api.get('/attempts/student');
  return data.attempts;
};

/* ===============================
   ADMIN: get attempts for ONE student
================================ */
export const getStudentAttempts = async (studentId?: string) => {
  if (!studentId) {
    console.error('getStudentAttempts called without studentId');
    return [];
  }

  const { data } = await api.get(`/attempts/student/${studentId}`);
  return data.attempts;
};

/* ===============================
   ADMIN: get ALL attempts
================================ */
export const getAllAttempts = async () => {
  const { data } = await api.get('/attempts');
  return data.attempts;
};
