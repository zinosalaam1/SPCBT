// Types for the CBT Application

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'student';
  name: string;
  email: string;
  createdAt: string;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: string;
  createdBy: string;
}

export interface Exam {
  id: string;
  title: string;
  subject: string;
  duration: number; // in minutes
  questions: string[]; // question IDs
  totalMarks: number;
  passingMarks: number;
  createdAt: string;
  createdBy: string;
  isActive: boolean;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  studentId: string;
  answers: { questionId: string; answer: number }[];
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  startedAt: string;
  submittedAt: string;
  timeTaken: number; // in seconds
}

export interface StudentStats {
  totalExams: number;
  completedExams: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
}
