import mongoose, { Document } from 'mongoose';

export interface IExperiment extends Document {
  userId: mongoose.Types.ObjectId;
  type: string;
  algorithm: string;
  input: mongoose.Schema.Types.Mixed;
  results: mongoose.Schema.Types.Mixed;
  createdAt: Date;
}

const experimentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, required: true },
  algorithm: { type: String, required: true },
  input: { type: mongoose.Schema.Types.Mixed },
  results: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

experimentSchema.index({ userId: 1, createdAt: -1 });
experimentSchema.index({ userId: 1, type: 1 });

export const Experiment = mongoose.model<IExperiment>('Experiment', experimentSchema);
