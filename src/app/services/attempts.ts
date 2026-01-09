import api from '../services/api';
import axios from 'axios';

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
export const getStudentAttempts = (studentId?: string) => {
  if (!studentId) {
    console.error("getStudentAttempts called without studentId");
    return Promise.resolve([]);
  }

  return axios
    .get(`/api/attempts/student/${studentId}`, {
      withCredentials: true,
    })
    .then(res => res.data);
};


/* ===============================
   ADMIN: get ALL attempts
================================ */
export const getAllAttempts = async () => {
  const { data } = await api.get('/attempts');
  return data.attempts;
};
