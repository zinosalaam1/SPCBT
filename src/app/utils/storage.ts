// Local Storage utilities - Simulating Express API
// In production, replace these with actual API calls to Express backend

import { User, Question, Exam, ExamAttempt } from '../types';

const STORAGE_KEYS = {
  USERS: 'sp_tech_users',
  QUESTIONS: 'sp_tech_questions',
  EXAMS: 'sp_tech_exams',
  ATTEMPTS: 'sp_tech_attempts',
  CURRENT_USER: 'sp_tech_current_user',
};

// Initialize with demo data
export const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const demoUsers: User[] = [
      {
        id: 'admin1',
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        name: 'Admin User',
        email: 'admin@sptech.com',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'student1',
        username: 'student',
        password: 'student123',
        role: 'student',
        name: 'Demo Student',
        email: 'student@sptech.com',
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(demoUsers));
  }

  if (!localStorage.getItem(STORAGE_KEYS.QUESTIONS)) {
    const demoQuestions: Question[] = [
      {
        id: 'q1',
        question: 'What does HTML stand for?',
        options: [
          'Hyper Text Markup Language',
          'High Tech Modern Language',
          'Home Tool Markup Language',
          'Hyperlinks and Text Markup Language',
        ],
        correctAnswer: 0,
        subject: 'Web Development',
        difficulty: 'easy',
        createdAt: new Date().toISOString(),
        createdBy: 'admin1',
      },
      {
        id: 'q2',
        question: 'Which programming language is known as the "language of the web"?',
        options: ['Python', 'Java', 'JavaScript', 'C++'],
        correctAnswer: 2,
        subject: 'Programming',
        difficulty: 'easy',
        createdAt: new Date().toISOString(),
        createdBy: 'admin1',
      },
      {
        id: 'q3',
        question: 'What is the time complexity of binary search?',
        options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
        correctAnswer: 1,
        subject: 'Data Structures',
        difficulty: 'medium',
        createdAt: new Date().toISOString(),
        createdBy: 'admin1',
      },
    ];
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(demoQuestions));
  }

  if (!localStorage.getItem(STORAGE_KEYS.EXAMS)) {
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.ATTEMPTS)) {
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify([]));
  }
};

// User Management
export const login = (username: string, password: string): User | null => {
  const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  const user = users.find((u) => u.username === username && u.password === password);
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }
  return user || null;
};

export const logout = () => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
};

export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return user ? JSON.parse(user) : null;
};

export const getAllUsers = (): User[] => {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
};

export const createUser = (user: Omit<User, 'id' | 'createdAt'>): User => {
  const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  const newUser: User = {
    ...user,
    id: `user_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  return newUser;
};

export const deleteUser = (userId: string): void => {
  const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  const filtered = users.filter((u) => u.id !== userId);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filtered));
};

// Question Management
export const getAllQuestions = (): Question[] => {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.QUESTIONS) || '[]');
};

export const createQuestion = (question: Omit<Question, 'id' | 'createdAt'>): Question => {
  const questions: Question[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUESTIONS) || '[]');
  const newQuestion: Question = {
    ...question,
    id: `q_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  questions.push(newQuestion);
  localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  return newQuestion;
};

export const updateQuestion = (id: string, updates: Partial<Question>): Question | null => {
  const questions: Question[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUESTIONS) || '[]');
  const index = questions.findIndex((q) => q.id === id);
  if (index === -1) return null;
  
  questions[index] = { ...questions[index], ...updates };
  localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  return questions[index];
};

export const deleteQuestion = (id: string): void => {
  const questions: Question[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUESTIONS) || '[]');
  const filtered = questions.filter((q) => q.id !== id);
  localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(filtered));
};

// Exam Management
export const getAllExams = (): Exam[] => {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.EXAMS) || '[]');
};

export const getActiveExams = (): Exam[] => {
  const exams: Exam[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXAMS) || '[]');
  return exams.filter((e) => e.isActive);
};

export const createExam = (exam: Omit<Exam, 'id' | 'createdAt'>): Exam => {
  const exams: Exam[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXAMS) || '[]');
  const newExam: Exam = {
    ...exam,
    id: `exam_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  exams.push(newExam);
  localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
  return newExam;
};

export const updateExam = (id: string, updates: Partial<Exam>): Exam | null => {
  const exams: Exam[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXAMS) || '[]');
  const index = exams.findIndex((e) => e.id === id);
  if (index === -1) return null;
  
  exams[index] = { ...exams[index], ...updates };
  localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
  return exams[index];
};

export const handleDeleteExam = (id: string): void => {
  const exams: Exam[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXAMS) || '[]');
  const filtered = exams.filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(filtered));
};

// Exam Attempts
export const getAllAttempts = (): ExamAttempt[] => {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTEMPTS) || '[]');
};

export const getStudentAttempts = (studentId: string): ExamAttempt[] => {
  const attempts: ExamAttempt[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTEMPTS) || '[]');
  return attempts.filter((a) => a.studentId === studentId);
};

export const createAttempt = (attempt: Omit<ExamAttempt, 'id'>): ExamAttempt => {
  const attempts: ExamAttempt[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTEMPTS) || '[]');
  const newAttempt: ExamAttempt = {
    ...attempt,
    id: `attempt_${Date.now()}`,
  };
  attempts.push(newAttempt);
  localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(attempts));
  return newAttempt;
};
