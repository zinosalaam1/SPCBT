import api from '../services/api';

/* ===============================
   Student submits an exam
================================ */
export const createAttempt = async (payload: any) => {
  const { data } = await api.post('/attempts', payload);
  return data.attempt;
};

/* ===============================
   STUDENT: get own attempts
   (ID comes from JWT, not URL)
================================ */
export const getMyAttempts = async () => {
  const { data } = await api.get('/attempts/student');
  return data.attempts;
};

/* ===============================
   ADMIN: get attempts for ONE student
================================ */
export const getStudentAttempts = async (studentId: string) => {
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
