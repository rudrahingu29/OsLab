import mongoose, { Document, Schema } from 'mongoose';

// --- Question Schema & Model ---
export interface IQuestion extends Document {
  stableId: string;
  topic: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  reviewTopicSlug?: string;
  labSimulatorLink?: string;
}

const questionSchema = new Schema(
  {
    stableId: { type: String, required: true, unique: true, index: true },
    topic: { type: String, required: true, index: true },
    question: { type: String, required: true },
    options: { type: [String], required: true },
    correctAnswer: { type: Number, required: true, select: false }, // Hidden by default from normal queries
    explanation: { type: String, required: true, select: false }, // Hidden by default from normal queries
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    marks: { type: Number, default: 1 },
    reviewTopicSlug: { type: String },
    labSimulatorLink: { type: String },
  },
  { timestamps: true }
);

export const Question = mongoose.model<IQuestion>('Question', questionSchema);

// --- Quiz Attempt Schema & Model ---
export interface IQuizAttemptAnswer {
  questionId: mongoose.Types.ObjectId;
  selectedAnswer: number;
  isCorrect: boolean;
}

export interface IQuizAttempt extends Document {
  userId: mongoose.Types.ObjectId;
  topic: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  answers: IQuizAttemptAnswer[];
  createdAt: Date;
}

const quizAttemptSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    topic: { type: String, required: true, index: true },
    score: { type: Number, required: true },
    maxScore: { type: Number, required: true },
    percentage: { type: Number, required: true },
    passed: { type: Boolean, required: true },
    answers: [
      {
        questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
        selectedAnswer: { type: Number, required: true },
        isCorrect: { type: Boolean, required: true },
      },
    ],
  },
  { timestamps: true }
);

quizAttemptSchema.index({ userId: 1, createdAt: -1 });

export const QuizAttempt = mongoose.model<IQuizAttempt>('QuizAttempt', quizAttemptSchema);
