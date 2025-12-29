import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion extends Document {
  question: string;
  options: string[];
  correctAnswer: number;
  subject: string;
  difficulty: string;
  createdBy?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const questionSchema = new Schema<IQuestion>(
  {
    question: { type: String, required: true },
    options: { type: [String], required: true },
    correctAnswer: { type: Number, required: true },
    subject: { type: String, required: true },
    difficulty: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model<IQuestion>('Question', questionSchema);
