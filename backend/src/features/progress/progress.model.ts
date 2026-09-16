import mongoose, { Document } from 'mongoose';

export interface ILearningProgress extends Document {
  userId: mongoose.Types.ObjectId;
  topic: string;
  completionPercentage: number;
  completedLessons: string[];
  completedExperiments: string[];
  bestQuizPercentage: number;
  quizCompleted: boolean;
  lastAccessedAt: Date;
  createdAt: Date;
  updatedAt: Date;

  // Legacy virtual getters for backward compatibility
  completed: boolean;
  progress: number;
}

const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String, required: true },
  completionPercentage: { type: Number, min: 0, max: 100, default: 0 },
  completedLessons: { type: [String], default: [] },
  completedExperiments: { type: [String], default: [] },
  bestQuizPercentage: { type: Number, min: 0, max: 100, default: 0 },
  quizCompleted: { type: Boolean, default: false },
  lastAccessedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Compound unique index guaranteeing one record per user + topic
progressSchema.index({ userId: 1, topic: 1 }, { unique: true });

// Virtual getters for legacy frontend field compatibility
progressSchema.virtual('progress').get(function (this: ILearningProgress) {
  return this.completionPercentage;
});

progressSchema.virtual('completed').get(function (this: ILearningProgress) {
  return this.completionPercentage >= 100 || this.quizCompleted;
});

progressSchema.set('toJSON', { virtuals: true });
progressSchema.set('toObject', { virtuals: true });

export const LearningProgress = mongoose.model<ILearningProgress>('LearningProgress', progressSchema);
