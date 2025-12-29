import mongoose, { Document, Schema } from 'mongoose';

export interface IExamAttempt extends Document {
  studentId: mongoose.Types.ObjectId;
  examId: mongoose.Types.ObjectId;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const examAttemptSchema = new Schema<IExamAttempt>(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    score: { type: Number, required: true },           // use Number here
    totalQuestions: { type: Number, required: true },  // use Number here
    correctAnswers: { type: Number, required: true },  // use Number here
  },
  { timestamps: true }
);

export default mongoose.model<IExamAttempt>('ExamAttempt', examAttemptSchema);
