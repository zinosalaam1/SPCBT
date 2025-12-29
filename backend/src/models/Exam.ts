import mongoose, { Document, Schema } from 'mongoose';
import { IQuestion } from './Question';

export interface IExam extends Document {
  title: string;
  subject: string;
  duration: number; // in minutes
  questions: IQuestion['_id'][];
  totalMarks: number;
  passingMarks: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const examSchema = new Schema<IExam>(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    duration: { type: Number, required: true, default: 60 },
    questions: [{ type: Schema.Types.ObjectId, ref: 'Question', required: true }],
    totalMarks: { type: Number, required: true, default: 100 },
    passingMarks: { type: Number, required: true, default: 40 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IExam>('Exam', examSchema);
