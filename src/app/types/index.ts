// Types for the CBT Application (API + MongoDB aligned)

/* ---------------- USER ---------------- */
export interface User {
  _id: string;
  username: string;
  role: 'admin' | 'student';
  name: string;
  email: string;
  createdAt: string;
}

/* ---------------- QUESTION ---------------- */
export interface Question {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: string;
  createdBy: string; // admin _id
}

/* ---------------- EXAM ---------------- */
export interface Exam {
  _id: string;
  title: string;
  subject: string;
  duration: number; // minutes
  questions: string[]; // question _ids
  totalMarks: number;
  passingMarks: number;
  isActive: boolean;
  createdAt: string;
  createdBy: string; // admin _id
}

/* ---------------- EXAM ATTEMPT ---------------- */
export interface ExamAttempt {
  _id: string;
  examId: string;
  studentId: string;
  answers: {
    questionId: string;
    answer: number;
  }[];
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  startedAt: string;
  submittedAt: string;
  timeTaken: number; // seconds
}

/* ---------------- STUDENT STATS ---------------- */
export interface StudentStats {
  totalExams: number;
  completedExams: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
}
