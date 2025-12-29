import { Router, Response } from 'express';
import ExamAttempt from '../models/ExamAttempt';
import Exam from '../models/Exam';
import auth, { AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * POST /api/attempts
 * Student submits an exam
 */
router.post('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { examId, answers } = req.body;

    if (!examId || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Invalid submission data' });
    }

    // 1️⃣ Get exam with questions
    const exam = await Exam.findById(examId).populate('questions');
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // 2️⃣ Calculate score
    let correctAnswers = 0;

    exam.questions.forEach((question: any) => {
      const userAnswer = answers.find(
        (a: any) => a.questionId === question._id.toString()
      );

      if (
        userAnswer &&
        userAnswer.selectedOption === question.correctAnswer
      ) {
        correctAnswers++;
      }
    });

    const totalQuestions = exam.questions.length;
    const score = correctAnswers; // 1 mark per question (adjust later if needed)

    // 3️⃣ Save attempt (ALL REQUIRED FIELDS)
    const attempt = await ExamAttempt.create({
      studentId: req.user._id, // ✅ comes from auth middleware
      examId,
      score,
      totalQuestions,
      correctAnswers,
    });

    res.status(201).json({ attempt });
  } catch (error) {
    console.error('Submit exam error:', error);
    res.status(500).json({ message: 'Failed to submit exam' });
  }
});

/**
 * GET /api/attempts
 * Admin: get all attempts
 */
router.get('/', auth, async (_, res: Response) => {
  const attempts = await ExamAttempt.find()
    .populate('studentId', 'name email')
    .populate('examId', 'title subject');
  res.json(attempts);
});

/**
 * GET /api/attempts/student
 * Student: get own attempts
 */
router.get('/student', auth, async (req: AuthRequest, res: Response) => {
  const attempts = await ExamAttempt.find({
    studentId: req.user._id,
  }).populate('examId', 'title subject');
  res.json(attempts);
});

export default router;
