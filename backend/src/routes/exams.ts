import { Router, Response } from 'express';
import Exam from '../models/Exam';
import auth, { AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/exams
router.get('/', auth, async (_req, res: Response) => {
  try {
    const exams = await Exam.find().populate('questions');
    res.json({ exams });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch exams' });
  }
});

// GET /api/exams/active
router.get('/active', async (_req, res: Response) => {
  try {
    const exams = await Exam.find({ isActive: true });
    res.json({ exams });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch active exams' });
  }
});

// POST /api/exams
router.post('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const exam = await Exam.create({
      ...req.body,
      createdBy: req.user!._id,
    });
    res.status(201).json({ exam });
  } catch (err) {
    res.status(400).json({ message: 'Failed to create exam' });
  }
});

// PUT /api/exams/:id
router.put('/:id', auth, async (req, res: Response) => {
  try {
    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json({ exam });
  } catch (err) {
    res.status(400).json({ message: 'Failed to update exam' });
  }
});

// DELETE /api/exams/:id
router.delete('/:id', auth, async (req, res: Response) => {
  try {
    await Exam.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ message: 'Failed to delete exam' });
  }
});

export default router;
