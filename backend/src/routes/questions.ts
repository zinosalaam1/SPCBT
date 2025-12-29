import { Router, Response } from "express";
import mongoose from "mongoose";
import Question from "../models/Question";
import auth, { AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/questions
router.get("/", auth, async (_: AuthRequest, res: Response) => {
  try {
    const questions = await Question.find();
    res.json({ questions });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch questions" });
  }
});

// POST /api/questions
router.post("/", auth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const question = await Question.create({
      ...req.body,
      createdBy: req.user._id,
    });

    res.status(201).json({ question });
  } catch (error) {
    res.status(400).json({ message: "Failed to create question" });
  }
});
// POST /api/questions/by-ids
router.post('/by-ids', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'ids array is required' });
    }

    const questions = await Question.find({
      _id: { $in: ids }
    });

    res.json({ questions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch questions' });
  }
});

// PUT /api/questions/:id
router.put("/:id", auth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid question ID" });
    }

    const question = await Question.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.json({ question });
  } catch (error) {
    res.status(400).json({ message: "Failed to update question" });
  }
});

// DELETE /api/questions/:id
router.delete("/:id", auth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid question ID" });
    }

    const deleted = await Question.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.json({ message: "Question deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete question" });
  }
});

export default router;
