# Sp-Tech CBT - Express Backend Integration Guide

This guide explains how to integrate this React frontend with an Express.js backend.

## Current Implementation

The app currently uses **Local Storage** to simulate backend functionality. All data persistence logic is in `/src/app/utils/storage.ts`.

## Express Backend API Endpoints

Replace the storage functions with API calls to these Express endpoints:

### Authentication

```typescript
// POST /api/auth/login
Body: { username: string, password: string }
Response: { user: User, token: string }

// POST /api/auth/logout
Headers: { Authorization: 'Bearer <token>' }

// GET /api/auth/me
Headers: { Authorization: 'Bearer <token>' }
Response: { user: User }
```

### Users

```typescript
// GET /api/users
Headers: { Authorization: 'Bearer <token>' }
Response: { users: User[] }

// POST /api/users
Headers: { Authorization: 'Bearer <token>' }
Body: { username, password, name, email, role }
Response: { user: User }

// DELETE /api/users/:id
Headers: { Authorization: 'Bearer <token>' }
Response: { success: boolean }
```

### Questions

```typescript
// GET /api/questions
Headers: { Authorization: 'Bearer <token>' }
Response: { questions: Question[] }

// POST /api/questions
Headers: { Authorization: 'Bearer <token>' }
Body: { question, options, correctAnswer, subject, difficulty }
Response: { question: Question }

// PUT /api/questions/:id
Headers: { Authorization: 'Bearer <token>' }
Body: Partial<Question>
Response: { question: Question }

// DELETE /api/questions/:id
Headers: { Authorization: 'Bearer <token>' }
Response: { success: boolean }
```

### Exams

```typescript
// GET /api/exams
Headers: { Authorization: 'Bearer <token>' }
Response: { exams: Exam[] }

// GET /api/exams/active
Response: { exams: Exam[] }

// POST /api/exams
Headers: { Authorization: 'Bearer <token>' }
Body: { title, subject, duration, questions, totalMarks, passingMarks, isActive }
Response: { exam: Exam }

// PUT /api/exams/:id
Headers: { Authorization: 'Bearer <token>' }
Body: Partial<Exam>
Response: { exam: Exam }

// DELETE /api/exams/:id
Headers: { Authorization: 'Bearer <token>' }
Response: { success: boolean }
```

### Exam Attempts

```typescript
// GET /api/attempts
Headers: { Authorization: 'Bearer <token>' }
Response: { attempts: ExamAttempt[] }

// GET /api/attempts/student/:studentId
Headers: { Authorization: 'Bearer <token>' }
Response: { attempts: ExamAttempt[] }

// POST /api/attempts
Headers: { Authorization: 'Bearer <token>' }
Body: { examId, answers, score, totalQuestions, correctAnswers, timeTaken }
Response: { attempt: ExamAttempt }
```

## Sample Express Backend Structure

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/exams', require('./routes/exams'));
app.use('/api/attempts', require('./routes/attempts'));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

## Updating the Frontend

1. **Install Axios**:
```bash
npm install axios
```

2. **Create API service** (`/src/app/services/api.ts`):
```typescript
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

3. **Replace storage functions** in `/src/app/utils/storage.ts`:
```typescript
import api from '../services/api';

export const login = async (username: string, password: string) => {
  const response = await api.post('/auth/login', { username, password });
  localStorage.setItem('token', response.data.token);
  localStorage.setItem('currentUser', JSON.stringify(response.data.user));
  return response.data.user;
};

export const getAllQuestions = async () => {
  const response = await api.get('/questions');
  return response.data.questions;
};

// ... and so on for all functions
```

## Database Schema (MongoDB/Mongoose)

```javascript
// models/User.js
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hash with bcrypt
  role: { type: String, enum: ['admin', 'student'], required: true },
  name: String,
  email: String,
  createdAt: { type: Date, default: Date.now }
});

// models/Question.js
const questionSchema = new mongoose.Schema({
  question: String,
  options: [String],
  correctAnswer: Number,
  subject: String,
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

// models/Exam.js
const examSchema = new mongoose.Schema({
  title: String,
  subject: String,
  duration: Number,
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  totalMarks: Number,
  passingMarks: Number,
  isActive: Boolean,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

// models/ExamAttempt.js
const attemptSchema = new mongoose.Schema({
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  answers: [{
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    answer: Number
  }],
  score: Number,
  totalQuestions: Number,
  correctAnswers: Number,
  startedAt: Date,
  submittedAt: Date,
  timeTaken: Number
});
```

## Security Considerations

1. **Hash passwords** with bcrypt before storing
2. **Use JWT** for authentication
3. **Validate all inputs** on the backend
4. **Implement rate limiting** to prevent abuse
5. **Use HTTPS** in production
6. **Sanitize user inputs** to prevent XSS/SQL injection
7. **Implement CORS** properly
8. **Add role-based access control** middleware

## Environment Variables

Create a `.env` file:
```
MONGODB_URI=mongodb://localhost:27017/sptech-cbt
JWT_SECRET=your-secret-key-here
PORT=5000
```

Frontend `.env`:
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Deployment

- **Frontend**: Deploy to Vercel, Netlify, or any static hosting
- **Backend**: Deploy to Heroku, Railway, DigitalOcean, or AWS
- **Database**: Use MongoDB Atlas for production database

---

**Note**: The current implementation uses Local Storage for simplicity. Follow this guide to integrate with a real Express backend for production use.
